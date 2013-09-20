'use strict';

var crypto = require('crypto')
  , fs = require('fs')
  , path = require('path');

var ALPHANUMERIC = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
var NUMERIC = '0123456789';

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

exports.randomString = function(length, alphabet) {
  if (!length) length = 6;
  if (!alphabet) alphabet = ALPHANUMERIC;
  var result = '';
  for (var i = 0; i < length; i++) {
    var idx = Math.floor(Math.random() * alphabet.length);
    result += alphabet[idx];
  }
  return result;
};

exports.randomNumber = function(length) {
  return exports.randomString(length, NUMERIC);
};

exports.randomIndex = function(length) {
  return Math.floor(Math.random() * length);
};