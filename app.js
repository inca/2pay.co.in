var express = require('express')
  , http = require('http')
  , stylus = require('stylus')
  , nib = require('nib');

var port = process.env.PORT || 3003;
var publicPath = __dirname + '/public';
var app = module.exports = exports = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
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

require('./routes');

http.createServer(app).listen(port, function() {
  console.log('Server is listening on ' + port);
});
