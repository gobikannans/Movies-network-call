const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const app = express();
app.use(express.json());

const dbpath = path.join(__dirname, "moviesData.db");

let db = null;

const intializeDbServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Running server: http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB error: ${error.message}`);
    process.exit(1);
  }
};

intializeDbServer();

//Movie

const convertDbObjToResponseObj = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

const convertDbObjToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

// GET ALL MOVIES

app.get("/movies/", async (request, response) => {
  const movieQuery = `  
    SELECT *
    FROM
    movie
    ORDER BY
    movie_id;`;

  const movie = await db.all(movieQuery);
  response.send(
    movie.map((each_movie) => convertDbObjToResponseObj(each_movie))
  );
});

// POST MOVIE
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const addMovieQuery = `
    INSERT INTO 
      movie(director_id,movie_name,lead_actor)
    VALUES
       (${directorId}, '${movieName}', '${leadActor}');`;

  const movie = await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

// GET SPECIFIC MOVIE
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieQuery = `  
    SELECT 
      *
    FROM
      movie
    WHERE
      movie_id=${movieId};`;
  const getmovie = await db.get(movieQuery);
  response.send(convertDbObjToResponseObject(getmovie));
});

//  UPDATE MOVIE
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateQuery = `
    UPDATE
    movie
    SET
     director_id=${directorId},
     movie_name='${movieName}',
     lead_actor='${leadActor}'
    WHERE
     movie_id=${movieId};`;

  const updatemovie = await db.run(updateQuery);
  response.send("Movie Details Updated");
});

// DELETE MOVIE
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `
    DELETE FROM
    movie
    WHERE 
    movie_id=${movieId};`;
  const deletemovie = await db.run(deleteQuery);
  response.send("Movie Removed");
});

//DIRECTORS

const convertDbToDirectorObj = (directorObj) => {
  return {
    directorId: directorObj.director_id,
    directorName: directorObj.director_name,
  };
};

// All DIRECTORS
app.get("/directors/", async (request, response) => {
  const directorQuery = `  
    SELECT *
    FROM
      director;`;

  const movie = await db.all(directorQuery);
  response.send(movie.map((each_movie) => convertDbToDirectorObj(each_movie)));
});

//SPECIFIC DIRECTOR
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const specificDirectorQuery = `  
    SELECT
      movie_name
    FROM
      movie
    WHERE  
      director_id=${directorId};`;

  const speciDirector = await db.all(specificDirectorQuery);
  response.send(
    speciDirector.map((eachDir) => ({ movieName: eachDir.movie_name }))
  );
});

module.exports = app;
