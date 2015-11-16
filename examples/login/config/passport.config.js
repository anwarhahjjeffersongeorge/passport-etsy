/**
* if you haven't defined a module with your
* etsy app credentials in the trialdata folder
* you can define them in the "catch" clause below
*/
function etsyCredentials(){
  var creds;
  try {
    creds = require('../../../trialdata/streetcred.js');
  } catch (e) {
    creds = {
      keystring: 'YOUR_KEY_GOES_HERE',
      secret: 'YOUR_SECRET_GOES_HERE'
    };
  }
  return creds;
}

module.exports = function (app, express, passport, EtsyStrategy){
  //...Etsy authentication
  var creds = etsyCredentials();
  app.set('etsyCredentials', creds);
  app.set('etsyCallbackRoute', '/auth/etsy/callback');
  app.set('etsyAuthRoute', '/auth/etsy');

  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.static(__dirname + '/public'));

  //setup passport session
  // support persistent login sessions to serialize and deserialize users
  // into and out of session. since we don't use a user record
  // database in this example we serialize/deserialize the complete
  // Etsy profile
  passport.serializeUser(function (user, done) {
    done(null, user);
  });
  passport.deserializeUser(function (user, done) {
    done(null, user);
  });

  //use the EtsyStrategy within passport
  passport.use(new EtsyStrategy({
    consumerKey: app.get('etsyCredentials').keystring,
    consumerSecret: app.get('etsyCredentials').secret,
    callbackURL: 'http://127.0.0.1:' + app.get('port') + app.get('etsyCallbackRoute')
  },
  function (token, tokenSecret, profile, done){
    //asynchronous verification
    process.nextTick(function (){
      //this simple example just returns user's Etsy profile
      // in production, you'd probably want to associate it with a db record
      // and return the record instead
      return done(null, profile);
    });
  }));
};
