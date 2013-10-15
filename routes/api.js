'use strict';

var app = require("../app")
  , Card = require("../model/card")
  , Merchant = require("../model/merchant")
  , Transaction = require('../model/transaction')
  , utils = require('../utils');

app.all('/api*', function(req, res, next){
  Merchant.findOne({_id: req.param("MerchantId")})
    .exec(function(err, merchant){
      if (err) return next(err);
      if (!merchant)
        return res.send(404);
      req.merchant = res.locals.merchant = merchant;
      res.locals.merchantPath = '/merchant/' + merchant.id;
      next();
    })
});

app.get('/api/pay', function(req, res, next){
  var MerchantId = res.locals.MerchantId = req.param("MerchantId") ;
  var OrderId = res.locals.OrderId = req.param("OrderId");
  var Cost = res.locals.Cost = req.param("Cost");
  var Currency = res.locals.Currency = req.param("Currency");
  var Secret = req.param("Secret");
  if (MerchantId){
    Merchant.findById(MerchantId).exec(function(err, merchant){
      if(err) return next(err);
      var hash = "MerchantId=" + MerchantId + "&OrderId=" + OrderId + "&Cost=" + Cost + "&Currency=" + Currency + "&PrivateKey" + merchant.privateKey
      if (utils.md5(hash) == Secret) {
        if (!merchant)
          return res.render("api/error");
        req.merchant = res.locals.merchant = merchant;
        Card.find({merchant: merchant._id})
          .exec(function(err, cards){
            if(err) return next(err);
            return res.render("api/pay", {cards: cards});
          });
      }
      else {
        res.render(merchant.domain + merchant.errorDomain)
      }
    })
  } else {
    res.send(404);
  }
});

app.post("/api/pay", function(req, res, next){
  var number = req.body.card.number1 + req.body.card.number2 + req.body.card.number3 + req.body.card.number4;
  Card.findOne({number:number,
    cvc: req.body.card.cvc,
    'holder.name': req.body.card.name,
    'holder.surname': req.body.card.surname,
    'expires.month': req.body.card.month,
    'expires.year': req.body.card.year})
    .exec(function(err, card){
      if(err) return next(err);
      console.log(card);
      if (!card) {
        return res.json({
          redirect: req.merchant.domain + req.merchant.errorDomain
        });
      }
      if (card.balance < req.param("Cost")) return res.json({
        redirect: req.merchant.domain + req.merchant.errorDomain
      });
      Transaction.txRun(null, req.merchant, card._id, req.param("Cost"), "pay")(function(err){
        if(err) return next(err);
        res.json({
          redirect: req.merchant.domain + req.merchant.successDomain
        })
      })
    });
});