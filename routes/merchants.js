'use strict';

var app = require("../app")
  , mongoose = require("mongoose")
  , Merchant = require("../model/merchant");

app.all('/merchants*', function (req, res, next) {
  if (!req.user)
    return res.redirect("login");
  next();
});

app.get('/merchants', function(req, res, next) {
  Merchant.find({ user: req.user.id })
    .exec(function(err, merchants) {
      res.render('merchants/index', { merchants: merchants });
    });
});

app.get('/merchants/new', function(req, res, next){
  res.render('merchants/new')
});

app.post('/merchants', function(req, res, next){
  var merchant = new Merchant(req.body.merchant);
  merchant.user = req.user;
  merchant.save(function (err, merchant) {
    if (err) return next(err);
    res.json({
      notices: res.notices.info("New merchant created").get(),
      // Choose active merchant on create
      redirect: '/merchants/' + merchant.id + '/choose'
    })
  })
});

app.get('/merchants/links', function(req, res, next){
  if (!req.xhr) return next(new Error(404));
  Merchant.find({user:req.session.userId}).exec(function(err, merchants){
    if (err) return next(err);
    res.render('merchants/links', { merchants:merchants });
  })
});