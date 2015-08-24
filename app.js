var express = require('express');
var path = require('path');
var config = require('config');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var elasticsearch = require('elasticsearch');
var fs = require('fs');

var routes = require('./routes/index');
var search = require('./routes/search');
var createhooks = require('./routes/createhooks');
var webhooks = require('./routes/webhooks');
var about = require('./routes/about');
var signin = require('./routes/signin');
var logout = require('./routes/logout');
var initdb = require('./lib/initdb');

// init ElaticSearch
var client = new elasticsearch.Client({
	host: config.get('ElasticSearch.host'),
	log: config.get('ElasticSearch.logType')
});
initdb(client);

var app = express();

app.set('client', client);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(path.join(__dirname, 'public', 'images/favicon.ico')));
app.use(cookieParser());
app.use(session({ 
    secret: config.get('Session.secret'), 
    key: config.get('Session.key'), 
    cookie: { secure: false }
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/search', search);
app.use('/signin', signin);
app.use('/logout', logout);
app.use('/createhooks', createhooks);
app.use('/webhook', webhooks);
app.use('/about', about);
app.use('/:user/:repo', function(req, res, next){
  var docPath = path.join('docs', req.params.user, req.params.repo);
  express.static(docPath)(req, res, next);
});

// if 404 error when visit static website, then redirect to the index
app.use('/:user/:repo', function(req, res) {
  var newPath = path.join('/',req.params.user, req.params.repo, '/');
  res.set('Location', newPath);
  res.status(301);
  res.send();
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;