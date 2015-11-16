module.exports = function (app, express, passport, EtsyStrategy) {
  var router = express.Router();
  router.get('/', function (req, res){
    var authenticatedUser = null;
    if (req.isAuthenticated()){
      authenticatedUser = req.user;
      // console.log('\n\tauthenticatedUser:\n');
      // console.log(authenticatedUser);
      // console.log('\n\tauthenticatedUser._json.results:\n');
      // console.log(authenticatedUser._json.results);
    }

    res.render('index', {
      title: app.get('title'),
      authenticatedUser: authenticatedUser,
      loginlink: app.get('etsyAuthRoute'),
      logoutlink: '/logout'
    });
  });

  router.get(app.get('etsyAuthRoute'),
    passport.authenticate('etsy', {
      scope: ['profile_r', 'email_r', 'listings_r', 'profile_w']
    }),
    function (req, res){
      //the request is redirected to etsy for authentication,
      //...so this sad function is never called
    });

  router.get(app.get('etsyCallbackRoute'),
    passport.authenticate('etsy', {
      failureRedirect: '/',
      successRedirect: '/'
    })
  );

  router.get('/logout', function (req, res){
    req.logout();
    res.redirect('/');
  });

  return router;
};
