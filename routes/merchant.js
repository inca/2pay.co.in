'use strict';

var app = require('../app')
  , Merchant = require('../model/merchant')
  , Card = require('../model/card');

app.all('/merchant/:id*', function(req, res, next) {
  if (!req.user)
    return res.redirect("login");
  Merchant.findOne({ _id: req.param('id') })
    .exec(function(err, merchant) {
      if (err) return next(err);
      if (!merchant || merchant.user != req.user.id)
        return res.send(404);
      req.merchant = res.locals.merchant = merchant;
      res.locals.merchantPath = '/merchant/' + merchant.id;
      next();
    });
});

app.get('/merchant/:id', function(req, res, next) {
  res.render('merchant/index');
});

app.post('/merchant/:id', function(req, res, next) {
  // EDIT
  res.send(501);
});

app.get('/merchant/:id/delete', function(req, res, next) {
  if (!req.xhr) return res.send(404);
  res.render('merchant/delete');
});

app.delete('/merchant/:id', function(req, res, next) {
  Merchant.remove({ _id: req.param('id') }, function(err) {
    if (err) return next(err);
    res.json({
      notices: res.notices.info("Merchant removed."),
      redirect: '/merchants'
    });
  })
});

app.get('/merchant/:id/cards', function(req, res, next) {
  Card.find({ merchant: req.merchant.id })
    .exec(function(err, cards) {
      if (err) return next(err);
      res.render('merchant/cards', { cards: cards });
    });
});