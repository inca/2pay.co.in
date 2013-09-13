'use strict';

var mongoose = require("mongoose")
  , conf = require("../conf")
  , genPass = require("password-generator");

var Card = mongoose.Schema({
  merchant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Merchant'
  },
  issuer: {
    type:String,
    default: 400000
  },
  number: String,
  balance: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    enum: conf.currency,
    default:"RUB"
  },
  expires: {
    month: {
      type: Number,
      min: 1,
      max: 12,
      default:12
    },
    year: {
      type: Number,
      min: new Date().getFullYear(),
      max: new Date().getFullYear() + 4,
      default: new Date().getFullYear() + 4
    }
  },
  cvc: Number

});

Card.methods.setCVC = function(){
  return this.cvc = genPass(3, false, /\d/)
};

Card.methods.setNumber = function(){
  var a = genPass(9, false, /\d/).split('');
  var num = this.issuer.split('');
  var b = num.concat(a);
  console.log(b);
  var sum = 0;
  for (var i= 0; i< b.length; i++){
    if (i%2 == 0){
      var p = b[i] * 2;
      if (p > 9) {
        p -= 9;
      }
      sum += p;
    }
  }
  var end_number = 10 - (sum % 10).toString();
  b = b.concat(end_number);
  b.splice(0, 6);
  return this.number = b.join("");
};

module.exports = mongoose.model("Card", Card);