import assert from 'assert';
import passportEtsy from '../lib';

var expect = require('chai').expect;

describe('passport-etsy', function () {
  it('should export Strategy constructor directly from package', function (){
    expect(passportEtsy).to.be.a('function');
    expect(passportEtsy).to.equal(passportEtsy.Strategy);
  });
  console.log(passportEtsy);

});
