'use strict';

var app = require('../app')
  , Card = require("../model/card")
  , async = require("async")
  , _ = require("underscore");

app.get('/', function(req, res) {
  if (req.user){
    res.redirect('/cards')
  } else {
    res.render('index');
  }
});

app.get('/cards', function(req, res, next){
  if (!req.user){
    res.redirect("login")
  } else{
    Card.find({merchant:req.session.curMerchant._id}).exec(function(err, card){
      res.render('cards/index', {cards: card})
    });
  }
});

app.get('/cards/create', function(req, res, next){
  if (!req.user){
    res.redirect("login")
  } else{
    res.render('cards/cards', {cards: card})
  }
});

