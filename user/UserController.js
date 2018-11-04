var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('../config');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

var User = require('./User');

// CREATES A NEW USER
router.post('/', function (req, res) {
    User.create({
        name : req.body.name,
        email : req.body.email,
        password : req.body.password
    },
    function (err, user) {
        if (err) return res.status(500).send("There was a problem adding the information to the database.");
        res.status(200).send(user);
    });
});

// Welcome users
router.get('/', function (req, res) {

  res.json({message: 'Welcome to the users api where you can look up a user'});

});

// get all users
router.get('/users', function (req, res) {

  var token = req.headers['x-access-token'];

  if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

  jwt.verify(token, config.secret, function(err, decoded) {
    if (err) {
      return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
    } else {
      User.find({}, function (err, users) {
            if (err) return res.status(500).send("There was a problem finding the users.");
            res.status(200).send(users);
        });
    }
  });

});

// route to authenticate a user (POST http://localhost:3000/api/authenticate)
router.post('/authenticate', function (req, res) {
  // find the user
  User.findOne({
    name: req.body.name
  }, function(err, user) {

    if (err) throw err;

    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {

      // check if password matches
      console.log(`username: ${user.password}`);
      console.log(`req.body.password: ${req.body.password}`);
      if (user.password != req.body.password) {
        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
      } else {

        // if user is found and password is right
        // create a token with only our given payload
        // we don't want to pass in the entire user since that has the password
        const payload = {
          admin: user.admin
        };

        var token = jwt.sign(payload, config.secret, {
          expiresIn: 86400 // expires in 24 hours
        });

        // return the information including token as JSON
        res.json({
          success: true,
          message: 'Enjoy your token!',
          token: token
        });
      }
    }
  });
});

// GETS A SINGLE USER FROM THE DATABASE
router.get('/:id', function (req, res) {

  var token = req.headers['x-access-token'];
  console.log(token);

  if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

  jwt.verify(token, config.secret, function(err, decoded) {
    if (err) {
      return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
    } else {
      User.findById(req.params.id, function (err, user) {
          if (err) return res.status(500).send("There was a problem finding the user.");
          if (!user) return res.status(404).send("No user found.");
          res.status(200).send(user);
      });
    }
  });
});

// DELETES A USER FROM THE DATABASE
router.delete('/:id', function (req, res) {

  var token = req.headers['x-access-token'];
  console.log(token);

  if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

  jwt.verify(token, config.secret, function(err, decoded) {
    if (err) {
      return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
    } else {
      User.findByIdAndRemove(req.params.id, function (err, user) {
          if (err) return res.status(500).send("There was a problem deleting the user.");
          res.status(200).send("User "+ user.name +" was deleted.");
      });
    }
  });
});

// UPDATES A SINGLE USER IN THE DATABASE
router.put('/:id', function (req, res) {
  var token = req.headers['x-access-token'];
  console.log(token);

  if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

  jwt.verify(token, config.secret, function(err, decoded) {
    if (err) {
      return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
    } else {
      User.findByIdAndUpdate(req.params.id, req.body, {new: true}, function (err, user) {
          if (err) return res.status(500).send("There was a problem updating the user.");
          res.status(200).send(user);
      });
    }
  });
});

module.exports = router;
