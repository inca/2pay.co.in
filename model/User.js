'use strict';

var mongoose = require('mongoose');

var User = mongoose.Schema({
    name:String,
    password:String,
    email:String
  }
);

User.methods.checkPassword = function(passwd) {
  return this.password == passwd;
};

module.exports = mongoose.model('User', User);