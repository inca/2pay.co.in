'use strict';

var mongoose = require('mongoose');

var User = mongoose.Schema({

  name: String,

  password: String,

  email: String

});

User.methods.checkPassword = function(passwd) {
  return this.password == passwd;
};

User.index({ email: 1 }, { unique: 1 });

module.exports = mongoose.model('User', User);