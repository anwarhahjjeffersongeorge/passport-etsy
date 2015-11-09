/**
*  See: https://www.etsy.com/developers/documentation/getting_started/oauth
*  OAuth Approach is three legged:
*  1.  Using the Etsy API, an app requests a set of temporary credentials (also known as a  request token".)
*      These are not yet associated with any specific Etsy member's account.
*  2.  The app directs the member to a page on Etsy, where the temporary credentials are approved
*      and linked to the member's account.
*  3.  Using the API, the app exchanges the temporary credentials for permanent token credentials
*      (also known as an "access token".) These credentials give the app
*      limited access to the member's account using the API.
*
*  See https://www.etsy.com/developers/documentation/getting_started/oauth#section_permission_scopes
*  In addition, a proprietary extension to the OAuth protocol called "permission scopes" allows apps
*  to be more specific about the operations they intend to perform against an Etsy member's account.
*  This means that apps that, for instance, only intend to look at a member's sales history and not
*  upload or change the member's listings, can request only the permissions they intend to use.
*  This protects the member's account against abuse.
*/


/**
 * module deps
 */

var util = require('util');
var querystring = require('querystring');
var OAuthStrategy = require('passport-oauth').OAuthStrategy;
var InternalOAuthError = require('passport-oauth').InternalOAuthError;
// var profile = require('./profile');

/**
 * 'Strategy' constructor
 *
 *  Etsy authentication strategy authenticates requests by delegating to Etsy using
 *  OAuth 1.0 protocol
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `consumerKey`      your Etsy application's OAuth Consumer Key
 *   - `consumerSecret`  your Facebook application's OAuth Consumer Secret
 *   - `callbackURL`   URL to which Etsy will redirect the user after granting authorization
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify){
  //ensure options
  options = options || {};
  //ensure options populated
  options.requestTokenURL = options.requestTokenURL || 'https://openapi.etsy.com/v2/oauth/request_token'; //url used to obtain unauthorized req token
  options.accessTokenURL = options.accessTokenURL || 'https://openapi.etsy.com/v2/oauth/access_token'; //url used to exchange user-authorized req token for access token
  options.userAuthorizationURL = options.userAuthorizationURL || 'https://www.etsy.com/oauth/signin'; //url used to sign user in
  options.sessionKey = options.sessionkey || 'oauth:etsy';

  OAuthStrategy.call(this, options, verify);
  this.name = 'etsy';
  this._profileFields = options.profileFields || null;

  // Etsy accepts an extended scope parameter when obtaining a request
  // This parameter should be supplied as a URL query parameter
  // So, guerilla patch node-oauth implementation to add scope parameters as URL query parameters
  // (see https://github.com/jaredhanson/passport-linkedin/blob/master/lib/strategy.js)
  this._oauth.getOAuthRequestToken = function (extraParams, callback){
    //handle case when extra params are function
    if (typeof extraParams === 'function'){
      callback = extraParams;
      extraParams = {};
    }

    //add to url
    var requestUrl = this._requestUrl;
    if (extraParams.scope) {
      requestUrl = requestUrl += ('?scope=' + extraParams.scope);
      delete extraParams.scope;
    }

    // Callbacks are 1.0A related
    if (this._authorize_callback) {
      extraParams.oauth_callback = this._authorize_callback;
    }
    //See Oauth.js from node oauth module
    //https://github.com/ciaranj/node-oauth/blob/eefd821ea9b010a44ba49afa048a421ea23e7502/lib/oauth.js
    //...exports.OAuth.prototype._performSecureRequest= function( oauth_token, oauth_token_secret, method, url, extra_params, post_body, post_content_type, callback )
    this._performSecureRequest(null, null, this._clientOptions.requestTokenHttpMethod, requestUrl, extraParams, null, null, function (error, data, response) {
      if (error){
        callback(error);
      } else {
        var results = querystring.parse(data);

        var oauth_token = results.oauth_token;
        var oauth_token_secret = results.oauth_token_secret;
        delete results.oauth_token;
        delete results.oauth_token_secret;
        callback(null, oauth_token, oauth_token_secret, results);
      }
    });
  };
}

/**
 * Inherit prototype methods from 'OAuthStrategy' constructor using util.inherits
 * https://nodejs.org/api/all.html#all_util_inherits_constructor_superconstructor
 */
util.inherits(Strategy, OAuthStrategy);

/**
 * Authenticate request by delegating to Etsy using OAuth.
 *
 * @param {Object} req
 * @api protected
 */
Strategy.prototype.authenticate = function (req, options) {
  // When a user denies authorization on Etsy, they are presented with a
  // link to return to the application in the following format:
  //
  //     http://www.example.com/auth/etsy/callback?oauth_problem=user_refused
  //
  // Following the link back to the application is interpreted as an
  // authentication failure.
  if (req.query && req.query.oauth_problem) {
    return this.fail();
  }

  // Call the base class for standard OAuth authentication.
  OAuthStrategy.prototype.authenticate.call(this, req, options);
};

/**
 * Retrieve user profile from Etsy
 *
 * Construct normalized profile with the following properties
 *   'id'
 *
 * @param {String} token
 * @param {String} tokenSecret
 * @param {Object} params
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function (token, tokenSecret, params, done) {
  var url = 'https://openapi.etsy.com/v2/users/__SELF__';

  this._oauth.get(url, token, tokenSecret, function (err, body, res){
    if (err) {
      return done(new InternalOAuthError('failed to fetch Etsy user profile', err));
    }

    try {
      var json = JSON.parse(body);

      var profile = {
        provider: 'etsy'
      };
      profile.id = json.id;

      profile._raw = body;
      profile._json = json;

      done(null, profile);
    } catch (jsonError){
      done(jsonError);
    }
  });
};

/**
 * Return extra Etsy-specific parameters to be included in the request token
 * request.
 *
 * References:
 *   https://www.etsy.com/developers/documentation/getting_started/oauth#section_permission_scopes
 *
 * @param {Object} options
 * @return {Object}
 * @api protected
 */
Strategy.prototype.requestTokenParams = function (options) {
  var params = {};

  var scope = options.scope;
  if (scope) {
    if (Array.isArray(scope)) {
      scope = scope.join('+');
    }
    params.scope = scope;
  }
  return params;
};

Strategy.prototype._convertProfileFields = function (profileFields) {
  var map = {
    id: 'id'
  };

  var fields = [];

  profileFields.forEach(function (f) {
    // return raw Etsy profile field to support the many fields that don't
    // map cleanly to Portable Contacts
    if (typeof map[f] === 'undefined') {
      return fields.push(f);
    }

    if (Array.isArray(map[f])) {
      Array.prototype.push.apply(fields, map[f]);
    } else {
      fields.push(map[f]);
    }
  });

  return fields.join(',');
};

/**
 * Expose 'Strategy'
 */
module.exports = Strategy;
