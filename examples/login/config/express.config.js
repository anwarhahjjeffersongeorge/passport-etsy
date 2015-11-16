var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var livereload = require('connect-livereload');
/**
* configure application
*/
module.exports = function (app, appdirname) {
  app.set('port', process.env.PORT || 4181);
  app.set('views', appdirname + '/views');
  app.set('view engine', 'jade');
  app.set('title', 'Try out passport-etsy strategy');

  //...middleware
  app.use(morgan('combined'));
  //app.use(cookieParser());
  app.use(bodyParser.urlencoded({ extended: false }));// parse application/x-www-form-urlencoded
  app.use(bodyParser.json()); // parse application/json
  app.use(session({
    secret: 'NIHAOMAAMOAHIN',
    resave: false,
    saveUninitialized: true
  }));
  app.use(require('connect-livereload')({
    port: 35729,
    ignore: ['.js']
  }));

};
