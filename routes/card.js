'use strict';

var app = require('../app')
  , Merchant = require('../model/merchant')
  , Card = require('../model/card');

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
