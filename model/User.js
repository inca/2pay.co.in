'use strict';

var mongoose = require('mongoose');

var User = mongoose.Schema({
    name:String,
    password:String,
    email:String
  }
);

module.exports = mongoose.model('User', User);