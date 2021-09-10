const express= require('express')
const connection = require('../db-config');
const router = express.Router()

router.get('/', (req, res) => {
  let sql = 'SELECT * FROM users';
  const sqlValues = [];
  if (req.query.language) {
    sql += ' WHERE language = ?';
    sqlValues.push(req.query.language);
  }
  connection.query(sql, sqlValues, (err, results) => {
    if (err) {
      res.status(500).send('Error retrieving users from database');
    } else {
      res.json(results);
    }
  });
});

router.get('/:id', (req, res) => {
  const userId = req.params.id;
  connection.query(
    'SELECT * FROM users WHERE id = ?',
    [userId],
    (err, results) => {
      if (err) {
        res.status(500).send('Error retrieving user from database');
      } else {
        if (results.length) res.json(results[0]);
        else res.status(404).send('User not found');
      }
    }
  );
});

//CREATE a new USER
router.post('/', (req, res) => {
  const { firstname, lastname, email } = req.body;
  connection.promise().query(
    'INSERT INTO users (firstname, lastname, email) VALUES (?, ?, ?)',
    [firstname, lastname, email]
  )
  .then((result)=>{
    const user = {id: result[0].insertId, firstname, lastname, email}
    res.status(201).json(user)
  })
  .catch((err)=>{
    console.error(err);
    res.status(500).send('Error saving the user');
  })
});

//EDIT a USER
router.put('/:id', (req, res) => {
  const userId = req.params.id;
  const userPropsToUpdate = req.body;
  connection.promise().query(
    'SELECT * FROM users WHERE id = ?',
    [userId]
  )
  .then(([[result]])=>{
    if(result.length === 0){
      res.status(404).send('User not found');
    } else {
      connection.promise().query(
        'UPDATE users SET ? WHERE id = ?',
        [userPropsToUpdate, userId]
      )
      .then(()=>{
        res.status(200).send({...result, ...userPropsToUpdate});
      })
      .catch((err)=>{
        console.log(err);
        res.status(500).send('Error updating a user');
      })
    }
  })
  .catch((err)=>{
    console.log(err);
  })

});

router.delete('/:id', (req, res) => {
  connection.query(
    'DELETE FROM users WHERE id = ?',
    [req.params.id],
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send('Error deleting an user');
      } else {
        if (result.affectedRows) res.status(200).send('🎉 User deleted!');
        else res.status(404).send('User not found.');
      }
    }
  );
});

module.exports = router;