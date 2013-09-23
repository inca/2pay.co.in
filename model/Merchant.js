'use strict';

var mongoose = require('mongoose')
  , utils = require('../utils');

var Merchant = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  title: {
    type: String,
    required: true
  },

  privateKey: String,

  lastUsedAt: {
    type: Date,
    default: new Date()
  },

  balance: {
    type: Number,
    default: 1000
  },

  domain: {
    type: String,
    required: true
  },

  successDomain: {
    type: String,
    required: true
  },

  errorDomain: {
    type: String,
    required: true
  },

  pendingTransaction: []
});

Merchant.pre('save', function(next) {
  if (!this.privateKey)
    this.privateKey = utils.randomString(32);
  next();
});

module.exports = mongoose.model("Merchant", Merchant);