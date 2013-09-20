'use strict';

var app = require("../app")
  , Card = require("../model/card")
  , Merchant = require("../model/merchant");

app.get('/api/pay', function(req, res, next){
  var MerchantId = res.locals.MerchantId = req.param("MerchantId") ;
  var PrivateKey = res.locals.PrivateKey = req.param("PrivateKey");
  var OrderId = res.locals.OrderId = req.param("OrderId");
  var Amount = res.locals.Amount = req.param("Amount");
  var Currency = res.locals.Currency = req.param("Currency");
  if (MerchantId && PrivateKey && OrderId && Amount && Currency){
    Merchant.findById(MerchantId).exec(function(err, merchant){
      if(err) return next(err);
      if (!merchant)
        return res.render("api/error");
      if(merchant.privateKey == PrivateKey) {
        req.merchant = res.locals.merchant = merchant;
        Card.find({merchant: merchant._id})
          .exec(function(err, cards){
            if(err) return next(err);
            return res.render("api/pay", {cards: cards});
          });
      } else {
        res.locals.varify = false;
        return res.render("api/error")
      }
    })
  } else {
    res.render("api/error")
  }
});
//


app.post("/api/pay", function(req, res, next){
  var number = req.body.card.number1 + req.body.card.number2 + req.body.card.number3 + req.body.card.number4
  console.log(number);
  console.log(req.body.card.cvc);
  console.log(req.body.card.name);
  console.log(req.body.card.surname);
  console.log(req.body.card.month);
  console.log(req.body.card.year);
  Card.findOne({number:number,
    cvc: req.body.card.cvc,
    'holder.name': req.body.card.name,
    'holder.surname': req.body.card.surname,
    'expires.month': req.body.card.month,
    'expires.year': req.body.card.year})
    .exec(function(err, card){
      if(err) return next(err);
      if (!card) return res.redirect("/api/error");
      card.populate('merchant', function(err, card){
        if(err) return next(err);

      })
    })

});