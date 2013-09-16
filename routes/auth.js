'use strict';

var app = require('../app')
  , User = require('../model/user')
  , Merchant = require('../model/merchant')
  , Card = require('../model/card')
  , _ = require('underscore')
  , utils = require('../utils');

app.get('/signup', function(req, res, next) {
  res.render('auth/signup')
});

app.post('/signup', function(req, res, next) {
  var user = new User(req.body.user);
  user.save(function(err, user) {
    if (err) return next(err);
    var merchant = new Merchant(req.body.merchant);
    merchant.user = user;
    merchant.save(function(err, merchant) {
      if (err) return next(err);
      var card = new Card({
        merchant: merchant._id
      });
      card.save(function(err){
        if (err) return next(err);
        res.json({
          notices: res.notices.info("Welcome to 2pay.co.in!").get(),
          redirect: '/'
        });
      })
    });
  })
});

app.get('/login', function(req, res, next) {
  res.render('auth/login')
});

app.post('/login', function(req, res, next) {
  User.findOne(req.body.user)
    .exec(function(err, user) {
      if (err) next(err);
      if (user && up == user.password) {
        req.login(user);
        Merchant.find({ user: user._id })
          .sort({ lastUsedAt: -1 })
          .limit(1)
          .exec(function(err, merchants) {
            if (err) return next(err);
            if (merchants.length > 0)
              req.session.merchantId = merchants[0].id;
            res.json({
              redirect: "/"
            });
          });
      } else return res.json({
        notices: res.notices.error("Email or password is invalid").get()
      });
    });
});

app.get('/logout', function(req, res, next) {
  req.logout();
  res.redirect('/');
});