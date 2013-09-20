'use strict';

var mongoose = require("mongoose")
  , conf = require("../conf")
  , utils = require("../utils")
  , moment = require("moment");

var Card = mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'User'
  },

  merchant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Merchant'
  },

  issuer: {
    type: String,
    default: '400000',
    enum: ['400000', '500000']
  },

  holder: {
    name: String,
    surname: String
  },

  number: String,

  cvc: String,

  expires: {
    month: {
      type: Number,
      min: 1,
      max: 12,
      default: 12
    },
    year: {
      type: Number,
      min: new Date().getFullYear(),
      max: new Date().getFullYear() + 4,
      default: new Date().getFullYear() + 4
    }
  },

  balance: {
    type: Number,
    default: 0
  },

  currency: {
    type: String,
    enum: conf.currency,
    default: "RUB"
  },

  pendingTransaction: {
    type: Array,
    default: [ ]
  }

});

Card.pre('save', function(next) {
  if (this.cvc && this.number) return next();
  this.cvc = utils.randomNumber(3);
  var num = this.issuer + utils.randomNumber(9);
  var sum = 0;
  for (var i = 0; i < num.length; i++) {
    if (i % 2 == 0) {
      var p = parseInt(num[i]) * 2;
      if (p > 9)
        p -= 9;
      sum += p;
    }
  }
  num += ((10 - (sum % 10)).toString())%10;
  this.number = num;
  var name = utils.randomIndex(40);
  this.holder.name = conf.name[name];
  var surname = utils.randomIndex(20);
  this.holder.surname = conf.surname[surname];
  next();
});

Card.virtual('expires.date').get(function() {
  return moment(new Date(this.expires.year, this.expires.month - 1))
    .format("MM/YYYY");
});

Card.virtual('numberFormatted').get(function() {
  return this.number.replace(/^(.{4})(.{4})(.{4})(.*)$/, '$1 $2 $3 $4');
});

module.exports = mongoose.model("Card", Card);