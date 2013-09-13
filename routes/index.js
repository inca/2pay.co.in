'use strict';

var app = require('../app');

app.get('/', function(req, res) {
  res.render('index');
});

