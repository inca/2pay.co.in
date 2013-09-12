'use strict';

var app = require('../app')
  , genPass = require("password-generator");

app.get('/', function(req, res) {
  res.render('index');
});

