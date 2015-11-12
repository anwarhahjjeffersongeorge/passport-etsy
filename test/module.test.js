import passportEtsy from '../lib';

describe('passport-etsy', function () {
  it('oughta export Strategy constructor directly from package', function (){
    expect(passportEtsy).to.be.a('function');
    expect(passportEtsy).to.equal(passportEtsy.Strategy);
  });

});
