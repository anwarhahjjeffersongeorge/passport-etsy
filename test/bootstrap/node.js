var chai = require('chai');
var passport = require('chai-passport-strategy');
var chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
chai.use(passport);

global.expect = chai.expect;
global.assert = chai.assert;
console.log('\n\t\tTest boostrah');
