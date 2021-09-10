const express= require('express')
const connection = require('../db-config');
const router = express.Router()

router.get('/', (req, res) => {
  let sql = 'SELECT * FROM movies';
  const sqlValues = [];
  if (req.query.color) {
    sql += ' WHERE color = ?';
    sqlValues.push(req.query.color);
  }
  if (req.query.max_duration) {
    if (req.query.color) sql += ' AND duration <= ? ;';
    else sql += ' WHERE duration <= ?';

    sqlValues.push(req.query.max_duration);
  }

  connection.query(sql, sqlValues, (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error retrieving movies from database');
    } else {
      res.json(results);
    }
  });
});

router.get('/:id', (req, res) => {
  const movieId = req.params.id;
  connection.query(
    'SELECT * FROM movies WHERE id = ?',
    [movieId],
    (err, results) => {
      if (err) {
        res.status(500).send('Error retrieving movie from database');
      } else {
        if (results.length) res.json(results[0]);
        else res.status(404).send('Movie not found');
      }
    }
  );
});

router.post('/', (req, res) => {
  const { title, director, year, color, duration } = req.body;
  connection.query(
    'INSERT INTO movies (title, director, year, color, duration) VALUES (?, ?, ?, ?, ?)',
    [title, director, year, color, duration],
    (err, result) => {
      if (err) {
        res.status(500).send('Error saving the movie');
      } else {
        const movie = {id: result.insertId, ...req.body}
        res.status(201).send(movie);
      }
    }
  );
});

router.put('/:id', (req, res) => {
  const movieId = req.params.id;
  const moviePropsToUpdate = req.body;

  connection.promise().query(
    "SELECT * FROM movies WHERE id=?",
    [movieId]
  )
  .then((result)=>{
    if(result[0].length === 0){
      return Promise.reject('Movie not found')
    } else {
      connection.query(
        'UPDATE movies SET ? WHERE id = ?',
        [moviePropsToUpdate, movieId],
        (err) => {
          if (err) {
            console.log(err);
            res.status(500).send('Error updating a movie');
          } else {
            const updatedMovie = {...result[0][0], ...moviePropsToUpdate}
            res.status(200).send(updatedMovie);
          }
        }
      );      
    }
  })
  .catch((err)=>{
    res.status(404).send(err)
  })


});

router.delete('/:id', (req, res) => {
  const movieId = req.params.id;
  connection.query(
    'DELETE FROM movies WHERE id = ?',
    [movieId],
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send('Error deleting a movie');
      } else {
        if (result.affectedRows) res.status(200).send('🎉 Movie deleted!');
        else res.status(404).send('Movie not found');
      }
    }
  );
});

module.exports = router;