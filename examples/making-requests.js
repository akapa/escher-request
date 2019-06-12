'use strict';

process.env.ESCHER_INTEGRATIONS = `[
  {
    "serviceUrl": "http://localhost:9193",
    "credentialScope": "eu/test-target/ems_request",
    "keyId": "test_test-target_v1",
    "secret": "secret",
    "acceptOnly": 0
  }
]`;

const escherRequest = require('../index');

// request with absolute url
escherRequest.get('http://localhost:9193/hello')
  .then(console.log)
  .catch(console.log);

// request with relative url and escherKeyId option
escherRequest.get('/hello', { escherKeyId: 'test_test-target' })
  .then(console.log)
  .catch(console.log);