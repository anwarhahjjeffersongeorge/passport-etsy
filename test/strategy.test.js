/*eslint no-unused-expressions: 1, no-new: 1*/
var EtsyStrategy = require('../dist/strategy');

//the Etsy response is formatted like This
var expectedResponse = '{ "count":1, "results":[{"user_id": "_DEDEDEDE00", "login_name":"Neko Kone", "primary_email": "ne.ko@ko.ne"}]}';

function getTestStrategy(){
  return new EtsyStrategy({
    consumerKey: 'ABC124',
    consumerSecret: 'secret'
  },
  function (){
    //verify function
  });
}

describe('EtsyStrategy-Object', function (){
  var strategyInstance;
  beforeEach('define strategy instance', function (){
    strategyInstance = getTestStrategy();
  });
  // NAME
  it('oughta be named etsy', function (){
    expect(strategyInstance.name).to.equal('etsy');
  });
  // SCOPE
  it('oughta return scope', function (){
    var params = strategyInstance.requestTokenParams({
      scope: ['profile_r']
    });
    assert.equal(params.scope, 'profile_r');
  });
  // SCOPE CONCATENATION
  it('oughta return concatenated scope from array', function (){
    var params = strategyInstance.requestTokenParams({
      scope: [
        'profile_r',
        'profile_w',
        'listings_r',
        'listings_w'
      ]
    });
    assert.equal(params.scope, 'profile_r+profile_w+listings_r+listings_w');
  });
});

describe('EtsyStrategy-Profile', function (){
  var strategyInstance;
  var testProfile;
  var testBody = expectedResponse;
  var testJSON = JSON.parse(testBody);
  beforeEach('define strategy instance', function (done){
    strategyInstance = getTestStrategy();
    //mock profile by overloading EtsyStrategy._ouath.get
    strategyInstance._oauth.get = function (url, token, tokenSecret, callback){
      if (url === 'https://openapi.etsy.com/v2/users/__SELF__'){
        var body = testBody;
        callback(null, body, undefined);
        //callback(new Error('Incorrect user profile url'));
      } else {
        callback(new Error('Incorrect user profile url'));
      }
    };
    process.nextTick(function (){
      strategyInstance.userProfile('token', 'token-secret', {}, function (err, profile){
        if (err){
          done(err);
        } else {
          testProfile = profile;
          done(null);
        }
      });
    });
  });

  describe('when told to load user profile', function (){
    // PROFILE ERRORS
    it('oughta not error', function (){
      //it seems that nothing is necessary here,
      // as passing error from beforeEach hook fails function as intended
    });
    // PROFILE LOADING
    it('oughta load profile', function (){
      expect(testProfile.provider).to.equal('etsy');
      expect(testProfile.id).to.equal('_DEDEDEDE00');
    });
    it('oughta set profile _json property (Object)', function (){
      assert.isObject(testProfile._json);
    });
    it('oughta set profile _raw property (String)', function (){
      assert.isString(testProfile._raw);
    });
  });
});

describe('EtsyStrategy-Profile with bad JSON', function (){
  var strategyInstance;
  var testProfile;
  var testBody = '{ "id": "_DEDEDEDE00", name: "Username"}';
  var receivedJSONError;
  beforeEach('define strategy instance', function (done){
    strategyInstance = getTestStrategy();
    //mock profile by overloading EtsyStrategy._ouath.get
    strategyInstance._oauth.get = function (url, token, tokenSecret, callback){
      if (url === 'https://openapi.etsy.com/v2/users/__SELF__'){
        var body = testBody;
        callback(null, body, undefined);
        //callback(new Error('Incorrect user profile url'));
      } else {
        callback(new Error('Incorrect user profile url'));
      }
    };
    process.nextTick(function (){
      strategyInstance.userProfile('token', 'token-secret', {}, function (err, profile){
        if (err){
          receivedJSONError = err;
          done();
        } else {
          testProfile = profile;
          done(new Error('A JSON error should have been created'));
        }
      });
    });
  });

  describe('when told to load user profile', function (){
    // PROFILE ERRORS
    it('oughta JSON error', function (){
      //it seems that nothing is necessary here,
      // as passing error from beforeEach hook fails function as intended
    });
    // ERROR TYPE
    it('oughta wrap error in SyntaxError', function (){
      expect(receivedJSONError.constructor.name).to.equal('SyntaxError');
    });
    // PROFILE ABSENT
    it('oughta not load profile', function (){
      expect(testProfile).to.be.undefined;
    });
  });
});

describe('EtsyStrategy-Profile with Etsy profile fields', function (){
  var testProfile;
  var testBody = expectedResponse;
  var strategyInstance = new EtsyStrategy({
    consumerKey: 'ABC124',
    consumerSecret: 'secret',
    profileFields: ['id']
  },
  function (){
    //verify function
  });

  //hooks
  beforeEach('define strategy instance', function (done){
    //mock profile by overloading EtsyStrategy._ouath.get
    strategyInstance._oauth.get = function (url, token, tokenSecret, callback){
      if (url === 'https://openapi.etsy.com/v2/users/__SELF__'){
        var body = testBody;
        callback(null, body, undefined);
        //callback(new Error('Incorrect user profile url'));
      } else {
        callback(new Error('Incorrect user profile url'));
      }
    };
    process.nextTick(function (){
      strategyInstance.userProfile('token', 'token-secret', {}, function (err, profile){
        if (err){
          done(err);
        } else {
          testProfile = profile;
          done(null);
        }
      });
    });
  });
  describe('when told to load user profile', function (){
    // PROFILE ERRORS
    it('oughta not error', function (){
      //it seems that nothing is necessary here,
      // as passing error from beforeEach hook fails function as intended
    });
    // PROFILE LOADING
    it('oughta load profile with fields', function (){
      expect(testProfile.provider).to.equal('etsy');
      expect(testProfile.id).to.equal('_DEDEDEDE00');
    });
    it('oughta set profile _json property (Object)', function (){
      assert.isObject(testProfile._json);
    });
    it('oughta set profile _raw property (String)', function (){
      assert.isString(testProfile._raw);
    });
  });
});

describe('EtsyStrategy-Profile with unmapped Etsy profile fields', function (){
  var testProfile;
  var testBody = expectedResponse;
  var strategyInstance = new EtsyStrategy({
    consumerKey: 'ABC124',
    consumerSecret: 'secret',
    profileFields: ['id', 'barharbaor']
  },
  function (){
    //verify function
  });

  //hooks
  beforeEach('define strategy instance', function (done){
    //mock profile by overloading EtsyStrategy._ouath.get
    strategyInstance._oauth.get = function (url, token, tokenSecret, callback){
      if (url === 'https://openapi.etsy.com/v2/users/__SELF__'){
        var body = testBody;
        callback(null, body, undefined);
        //callback(new Error('Incorrect user profile url'));
      } else {
        (new Error('Incorrect user profile url'));
      }
    };
    process.nextTick(function (){
      strategyInstance.userProfile('token', 'token-secret', {}, function (err, profile){
        if (err){
          done(err);
        } else {
          testProfile = profile;
          done(null);
        }
      });
    });
  });
  describe('when told to load user profile', function (){
    // PROFILE ERRORS
    it('oughta not error', function (){
      //it seems that nothing is necessary here,
      // as passing error from beforeEach hook fails function as intended
    });
    // PROFILE LOADING
    it('oughta load profile', function (){
      expect(testProfile.provider).to.equal('etsy');
      expect(testProfile.id).to.equal('_DEDEDEDE00');
    });
    it('oughta set profile _json property (Object)', function (){
      assert.isObject(testProfile._json);
    });
    it('oughta set profile _raw property (String)', function (){
      assert.isString(testProfile._raw);
    });
  });
});


describe('EtsyStrategy-Profile and encountering an error', function (){
  var testProfile;
  var testBody = expectedResponse;
  var receivedError;
  var strategyInstance = getTestStrategy();

  //hooks
  beforeEach('define strategy instance', function (done){
    //mock profile by overloading EtsyStrategy._ouath.get
    strategyInstance._oauth.get = function (url, token, tokenSecret, callback){
      callback(new Error('An error was encountered'));
    };
    process.nextTick(function (){
      strategyInstance.userProfile('token', 'token-secret', {}, function (err, profile){
        if (err){
          receivedError = err;
          done();
        } else {
          testProfile = profile;
          done(new Error('An error should have been created'));
        }
      });
    });
  });
  describe('when told to load user profile', function (){
    // ERRORS
    it('oughta error', function (){
      //it seems that nothing is necessary here,
      // as passing error from beforeEach hook fails function as intended
    });
    // ERROR TYPE
    it('oughta wrap error in InternalOAuthError', function (){
      expect(receivedError.constructor.name).to.equal('InternalOAuthError');
    });
    // PROFILE ABSENT
    it('oughta not load profile', function (){
      expect(testProfile).to.be.undefined;
    });
  });
});

describe('EtsyStrategy-Handling a denied request', function (){
  var testRequest;
  var strategyInstance = getTestStrategy();

  //hooks
  beforeEach('augment strategy intance with actions', function (done){
    var refusedRequest = {};
    strategyInstance.success = function (user){
      done(new Error('success should not be called in this test'));
    };
    strategyInstance.fail = function (){
      testRequest = refusedRequest;
      done();
    };

    refusedRequest.query = {};
    refusedRequest.query.oauth_problem = 'user refused authentication';
    process.nextTick(function () {
      strategyInstance.authenticate(refusedRequest);
    });
  });

  describe('the strategy', function (){
    // EtsyStrategy.success
    it('ought not call success)', function (){
      //it seems that nothing is necessary here,
      // as passing error from beforeEach hook fails function as intended
    });
    // EtsyStrategy.fail
    it('oughta call fail', function (){
      expect(testRequest).to.not.be.null;
    });
  });
});
