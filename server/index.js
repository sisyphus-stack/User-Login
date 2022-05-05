/***INITIALIZE SERVICES using node.js***/

//import express API for HTTP requests
const express = require('express');

//impprt cors API to allow FETCH from localhost
const cors = require('cors');

//initialize monk API for mongodb interface
const monk = require('monk');

//initialize express to app variable
const app = express();

//create database_example in mongodb using monk API
const db = monk('localhost/user_data');

//get database_1 collection
const users = db.get('users');

//initialize cors using express app
app.use(cors());

//initialize json using express app
app.use(express.json());

//When accessing http://localhost:5000 returns json message: 'Meower! 😹 🐈'
app.get('/', (req, res) => {
  res.json({
    message: 'Meower! 😹 🐈'
  });
});

//Pulls prior messages from database_1 for displaying onto index.html
//(under "data" div)
app.get('/users', (req, res, next) => {
  let { skip = 0, limit = 5, sort = 'desc' } = req.query;
  skip = parseInt(skip) || 0;
  limit = parseInt(limit) || 5;

  skip = skip < 0 ? 0 : skip;
  limit = Math.min(50, Math.max(1, limit));

  Promise.all([
    users
      .count(),
    users
      .find({}, {
        skip,
        limit,
        sort: {
          created: sort === 'desc' ? -1 : 1
        }
      })
  ])
    .then(([ total, users ]) => {
      res.json({
        users,
        meta: {
          total,
          skip,
          limit,
          has_more: total - (skip + limit) > 0,
        }
      });
    }).catch(next);
});

//Checks to see if entered message meets parameters
function isValidUser(user) {
  return user.username && user.username.toString().trim() !== '' && user.username.toString().trim().length <= 140
  && user.password && user.password.toString().trim() !== '' && user.password.toString().trim().length <= 140;
}

//Creates new message to submit to database
const createUser = (req, res, next) => {
  if (isValidUser(req.body)) {
    const user = {
      username: req.body.username.toString().trim(),
      password: req.body.password.toString().trim(),
      created: new Date()
    };

    users
      .insert(user)
      .then(createdUser => {
        res.json(createdUser);
      }).catch(next);
  } else {
    res.status(422);
    res.json({
      message: 'Hey! Content are required! Content cannot be longer than 140 characters.'
    });
  }
};

//Posts new message to http://localhost:5000/database_1 
app.post('/users', createUser);

//Throws error message
app.use((error, req, res, next) => {
  res.status(500);
  res.json({
    message: error.message
  });
});

//Listens on port 5000
app.listen(5000, () => {
  console.log('Listening on http://localhost:5000');
});
