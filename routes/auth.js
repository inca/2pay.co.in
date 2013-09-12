'use strict';

var app = require('../app');

app.get('/registration', function(req, res, next){
  res.render('pages/registration')
});