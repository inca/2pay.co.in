var express = require('express')
  , http = require('http')
  , stylus = require('stylus')
  , nib = require('nib')
  , I18n = require('i18n-2')
  , utils= require('./utils')
  , moment = require('moment')
  , conf = require("./conf")
  , mongoose = require("mongoose")
  , User = require('./model/user')
  , Merchant = require('./model/merchant')
  , Card = require('./model/card')
  , async = require("async")
  , _ = require('underscore');

var port = process.env.PORT || 3003;
var publicPath = __dirname + '/public';
var app = module.exports = exports = express();

mongoose.connect(conf.mongoURL);

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
app.use(function(req, res, next){

  req.login = function(user){
    req.session.userId = user.id;
  };

  req.logout = function(){
    delete req.session.userId;
  };

  if (req.session.userId) {
    async.waterfall([
      function(callback){
        User.findById(req.session.userId).exec(function(err, user){
          if (err) next(err);
          req.user = user;
          callback();
        });
      },
      function(callback){
        Merchant.find({user:req.user._id}).exec(function(err, merchants){
          if (err) next(err);
          req.merchants = merchants;
          req.session.curMerchant = merchants[0];
          callback();
        });
      }
    ], function (err) {
      next();
    });

  } else {
    next();
  }
});

I18n.expressBind(app, {
  locales: ['ru'],
  extension: ".json"
});

app.use(function(req, res, next){
  _.extend(res.locals, {
    user: req.user,
    merchants: req.merchants,
    curMerchant: req.session.curMerchant,
    xhr: req.xhr
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
require('./routes/auth');

http.createServer(app).listen(port, function() {
  console.log('Server is listening on ' + port);
});
