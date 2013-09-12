'use strict';

var crypto = require('crypto')
  , fs = require('fs')
  , path = require('path')
  , conf = require("./conf");

exports.sha256 = function(str) {
  var p = crypto.createHash('sha256');
  p.update(str);
  return p.digest('hex');
};

exports.md5 = function(str) {
  var p = crypto.createHash('md5');
  p.update(str);
  return p.digest('hex');
};

exports.escapeHtml = function(str) {
  return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
};


