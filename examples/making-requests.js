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

// request with absolute url
escherRequest.get('http://localhost:9193/hello?a=1&b=2')
  .then(console.log)
  .catch(logError);

// request with relative url and escherKeyId option
escherRequest.get('/hello?t=1#new', { escherKeyId: 'test_test-target', params: { a: 3 } })
  .then(console.log)
  .catch(logError);

// post request
escherRequest.post('/puty', { valami: 4 }, { escherKeyId: 'test_test-target' })
  .then(console.log)
  .catch(logError);

// post with absolute url
escherRequest.request({
  method: 'post',
  url: 'http://localhost:9193/puty',
  data: { name: 'Kacsa Ur' }
})
  .then(console.log)
  .catch(logError)

function logError(error) {
  if (error.response) {
    console.log(error.response.status, error.response.statusText, error.response.data);
  } else {
    console.log(error);
  }
}
