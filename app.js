var express = require('express');
var app = express();
var db = require('./db');

var UserController = require('./user/UserController');
app.use('/api/users', UserController);

module.exports = app;
