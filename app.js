"use strict";

var express = require('express')
  , http = require('http')
  , stylus = require('stylus')
  , nib = require('nib')
  , I18n = require('i18n-2')
  , utils = require('./utils')
  , conf = require("./conf")
  , mongoose = require("mongoose")
  , moment = require("moment")
  , User = require('./model/user')
  , _ = require('underscore');

var port = process.env.PORT || 3003;
var publicPath = __dirname + '/public';
var app = module.exports = exports = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.locals.basedir = __dirname + '/views';
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());

app.use(express.cookieParser('bionicman'));
app.use(express.session({
  key: 'sid',
  secret: 'bionicman'
}));

// Authentication
app.use(function(req, res, next) {

  req.login = function(user) {
    req.session.userId = user.id;
  };

  req.logout = function() {
    req.session.destroy();
  };

  if (req.session.userId) {
    User.findById(req.session.userId)
      .exec(function(err, user) {
        if (err) next(err);
        req.user = user;
        next();
      });
  } else next();
});

I18n.expressBind(app, {
  locales: ['ru'],
  extension: ".json"
});

app.use(function(req, res, next) {
  _.extend(res.locals, utils, {
    user: req.user,
    xhr: req.xhr,
    _: _,
    moment: function() {
      return moment(arguments).lang(req.i18n.getLocale());
    }
  });
  next();
});

// Notices
app.use(require('./notices'));

app.use(app.router);

app.use(stylus.middleware({
  src: publicPath,
  compile: function(str, path) {
    return stylus(str)
      .set('filename', path)
      .set('compress', true)
      .use(nib());
  }
}));

app.use(express.static(publicPath));

if (app.get('env') == 'development') {
  app.use(express.errorHandler());
}

require('./routes/index');

mongoose.connect(conf.mongoURL, function(err) {
  if (err) {
    console.log(err);
    process.exit(1);
  }
  http.createServer(app).listen(port, function() {
    console.log('Server is listening on ' + port);
  });
});
