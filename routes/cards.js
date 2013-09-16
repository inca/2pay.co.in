'use strict';

var app = require('../app')
  , Card = require("../model/card");

app.all('/cards*', function(req, res, next) {
  if (!req.user)
    return res.redirect("login");
  if (!req.merchant)
    return res.redirect('/merchants');
  next();
});

app.get('/cards', function(req, res, next) {
  Card.find({ merchant: req.merchant.id })
    .exec(function(err, cards) {
      if (err) return next(err);
      res.render('cards/index', { cards: cards });
    });
});

app.get('/cards/new', function(req, res, next) {
  res.render('cards/new')
});

