# passport-etsy credentials
Everything in this folder except this file should be `.gitignore`d.

In this way, you may create and include herein a file with your Etsy application credentials for trial purposes and not have it exposed in your repo. The default name of this file should be
`streetcred.js`

This file should expose a nameless object as follows:

```
/**
* expose etsy credentials
*/
var credentials = {
  keystring: 'YOUR_KEY_GOES_HERE',
  secret: 'YOUR_SECRET_GOES_HERE'
};
exports = module.exports = credentials;
```
