'use strict';

var app = require('../app')
  , Merchant = require('../model/merchant')
  , Card = require('../model/card')
  , Transaction = require('../model/transaction')
  , conf = require('../conf');

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
      req.merchantId = res.locals.merchantPath = '/merchant/' + card.merchant.id;
      next();
    });
});

app.get('/card/:id', function(req, res, next) {
  res.render('card/index');
});

app.delete('/card/:id', function(req, res, next){
  Card.remove({ _id: req.param('id') }, function(err) {
    if (err) return next(err);
    res.json({
      notices: res.notices.info("Card removed."),
      redirect: req.merchantId + "/cards"
    });
  })
});

app.get('/card/:id/delete', function(req, res){
  if (!req.xhr) return res.send(404);
  res.render('card/delete');
});


app.get('/card/:id/deposit', function(req, res, next){
  res.render('card/deposit');
});

app.post('/card/:id/deposit', function(req, res, next){
  var value = req.param("deposit");
  if (value <= conf.depositLimit[req.card.currency]){
    Transaction.txRun(null, null, req.card.id, value, "deposit")(function(err){
      if (err) return next(err);
      res.json({
        redirect: "/card/" + req.param("id")
      })
    })
  } else {
    res.json({
      notices: res.notices.error("Limit has been exceeded."),
      redirect: "/card/" + req.param("id") + "/deposit"
    })
  }

});