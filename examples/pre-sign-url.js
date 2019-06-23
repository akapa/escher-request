'use strict';

process.env.ESCHER_INTEGRATIONS = `[
  {
    "serviceUrl": "http://localhost:9193",
    "credentialScope": "eu/test-target/ems_request",
    "keyId": "test_test-target_v1",
    "secret": "secret"
  }
]`;

const escherRequest = require('../src/main');

// absolut url
var preSigned = escherRequest.preSignUrl(
  'http://localhost:9193/hello?a=4',
  { expires: 300 }
);
console.log('preSigned', preSigned);

// relative url
var preSigned = escherRequest.preSignUrl(
  '/hello?a=4',
  { expires: 300, escherKeyId: 'test_test-target' }
);
console.log('preSigned', preSigned);
