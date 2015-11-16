var express = require('express');
var passport = require('passport');
var EtsyStrategy = require('../../../passport-etsy').Strategy;

var app = express();
require('./config/express.config.js')(app, __dirname);

require('./config/passport.config.js')(app, express, passport, EtsyStrategy);

var router = require('./config/routes.config.js')(app, express, passport, EtsyStrategy);
app.use('/', router);

var server = app.listen(app.get('port'), function (){
  console.log('Express server listening on port ' + app.get('port'));
});
