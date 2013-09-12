'use strict';

var mongoose = require('mongoose')
  , genPass = require('password-generator');

var Merchant = mongoose.Schema({
    user:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    title: String,
    url: String,
    privateKey: String
  }
);

Merchant.methods.setPrivateKey = function(){
  return this.privateKey = genPass(32, false);
};

module.exports = mongoose.model("Merchant", Merchant);