'use strict';

var app = require('../app')
  , async = require("async")
  , _ = require("underscore");

app.get('/', function(req, res) {
  if (req.user) res.redirect('/merchants');
  else res.render('index');
});

require('./auth');
require('./merchants');
require('./merchant');
require('./card');
require('./user');
require('./api');