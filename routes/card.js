'use strict';

var app = require('../app')
  , Merchant = require('../model/merchant')
  , Card = require('../model/card')
  , Transaction = require('../model/transaction');

app.all('/card/:id*', function(req, res, next) {
  if (!req.user)
    return res.redirect("login");
  Card.findOne({ _id: req.param('id') })
    .populate('merchant')
    .exec(function(err, card) {
      if (err) return next(err);
      if (!card || card.merchant.user != req.user.id)
        return res.send(404);
      req.card = res.locals.card = card;
      req.merchant = res.locals.merchant = card.merchant;
      res.locals.cardPath = '/card/' + card.id;
      res.locals.merchantPath = '/merchant/' + card.merchant.id;
      next();
    });
});

app.get('/card/:id', function(req, res, next) {
  res.render('card/index');
});

app.get('/card/:id/deposit', function(req, res, next){
  res.render('card/deposit');
});

app.post('/card/:id/deposit', function(req, res, next){
  var value = req.param("deposit");
  Transaction.txRun(req.param.id, value)(function(err){
    if (err) return next(err);
    res.redirect("/")
  })
});