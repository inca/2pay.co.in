'use strict';

var app = require('../app')
  , async = require("async")
  , _ = require("underscore");

app.get('/', function(req, res) {
  if (req.user) res.redirect('/cards');
  else res.render('index');
});

require('./cards');
require('./auth');