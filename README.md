# passport-etsy
Etsy (OAuth) authentication strategy for Passport and Node.js.

## Install
```
$npm install passport-etsy
```

## Usage
#### I. Obtain App Credentials:
[Etsy Developer Portal](https://www.etsy.com/developers/register)

#### II. Configure Strategy
The Etsy authentication strategy uses an Etsy account and OAuth tokens to authenticate users.
It requires:

1. A `consumerKey`, `consumerSecret`, and `callbackURL`, _and_

2. A `verify` callback that accepts these credentials and provides the user to `done`

```
passport.use(new EtsyStrategy({
    consumerKey: 'YOUR_KEY_GOES_HERE',
    consumerSecret: 'YOUR_SECRET_GOES_HERE',
    callbackURL: 'http://127.0.0.1:4181/auth/etsy/callback'
  },
  function (token, tokenSecret, profile, done){
    User.findOrCreate({etsyID: profile.id})
  }
));
```

#### III. Authenticate Requests
You can authenticate requests using `passport.authenticate()` and specifying the `'etsy'` strategy.

In an [Express](http://expressjs.com/) application, create route middleware as follows:

```
app.get('/auth/etsy', passport.authenticate('etsy'));

app.get('/auth/etsy/callback', passport.authenticate('etsy', {
  failureRedirect: '/login'
  successRedirect: '/home'
  })
);
```

###### Scope parameters
Etsy auth requests can include [multiple `scope` request parameters](https://www.etsy.com/developers/documentation/getting_started/oauth#section_permission_scopes).
While you can authenticate as above without adding `scope`, doing so reduces the
amount of actions you can take with the Etsy API.

```
app.get('/auth/etsy', passport.authenticate('etsy', {
  scope: ['profile_r', 'email_r', 'listings_r', 'profile_w']
}));
```

## Module Structure
This module's `package.json` uses seeks code in its `dist` folder. Source is in the `lib` folder.

The project was scaffolded using [Yeoman](http://yeoman.io/)/[generator-node](https://github.com/yeoman/generator-node).

It uses [gulp](http://gulpjs.com/) build system, so you can execute:

- `gulp prepublish` to populate `dist` from `lib` via [Node Security (gulp-nsp)](https://www.npmjs.com/package/gulp-nsp) and [Babel (gulp-babel)](https://www.npmjs.com/package/gulp-babel),
- `gulp test` to lint, unit-test and code-coverage source using [ESLint (gulp-eslint)](https://www.npmjs.com/package/gulp-eslint), [Mocha (gulp-mocha) ](https://www.npmjs.com/package/gulp-mocha) and [Coveralls (gulp-coveralls)](https://www.npmjs.com/package/gulp-coveralls), or
- `gulp-serve` to run an example server using the code in `examples/login` (see below)

## Testing
Before running `gulp-test`, please `gulp-prepublish`, as tests are applied to compiled sources
in `dist`.

After running `gulp-test`, you can find coverage reports in the `coverage` folder

## Using the Provided Examples
Before trying `gulp-serve`, please:

1. Provide your Etsy credentials _(keystring, secret)_ to the example code. You may:
  + Insert them in the `etsyCredentials` function of `examples/login/config/passport.config.js`, or
  + Follow the instructions in `examples/login/trialdata/README.md`
2. If you have changed the code in `lib`, execute `gulp-prepublish` to repopulate `dist` with your changes.

## Additional Information:
- [Passport](http://passportjs.org/docs) [passport-oauth](https://github.com/jaredhanson/passport-oauth) [passport-oauth1](https://github.com/jaredhanson/passport-oauth1) by Jared Hanson
- [Etsy Authentication](https://www.etsy.com/developers/documentation/getting_started/oauth)

## Contact
Anwar Hahj Jefferson-George:
[Github](https://github.com/anwarhahjjeffersongeorge) |
[Google+](https://plus.google.com/+AnwarHahjJeffersonGeorge/)

## License
[MIT License](http://opensource.org/licenses/MIT)
