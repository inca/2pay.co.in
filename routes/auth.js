'use strict';

var app = require('../app')
  , User = require('../model/user')
  , Merchant = require('../model/merchant')
  , Card = require('../model/card');

app.get('/signup', function(req, res, next) {
  res.render('auth/signup')
});

app.post('/signup', function(req, res, next) {
  var un = req.param("un");
  var up = req.param("up");
  var ue = req.param("ue");
  var mt = req.param("mt");
  var user = new User({
    name: un,
    password: up,
    email: ue
  });
  user.save(function(err, user) {
    if (err) next(err);
    var merchant = new Merchant({
      user: user._id,
      title: mt
    });
    merchant.setPrivateKey();
    merchant.save(function(err, merchant) {
      if (err) next(err);
      var card = new Card({
        merchant: merchant._id
      });
      card.setCVC();
      card.setNumber();
      card.save(function(err){
        if (err) next(err);
        res.render('index');
      })
    });
  })
});

app.get('/login', function(req, res, next) {
  res.render('auth/login')
});

app.post('/login', function(req, res, next) {
  var ue = req.param("ue");
  var up = req.param("up");
  User.findOne({email:ue}).exec(function(err, user) {
    if (err) next(err);

    if (user && up == user.password) {
      req.login(user);
      res.json({
        redirect: "/"
      });
    } else {
      return res.json({
        notices: res.notices.error("Email or password is invalid").get()
      });
    }

  })
});

app.get('/logout', function(req, res, next) {
  req.logout();
  res.redirect('/');
});