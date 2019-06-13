'use strict';

const test = require('tape');
const nock = require('nock');
const escherRequest = require('./main');
const { a } = require('./test-helpers');

test('making requests', a(async t => {
  t.test('should find escher credentials based on url and set escher headers', a(async t => {
    process.env.ESCHER_INTEGRATIONS = `[
      {
        "serviceUrl": "http://www.example.com",
        "credentialScope": "eu/test-target/ems_request",
        "keyId": "test_test-target_v1",
        "secret": "secret",
        "acceptOnly": 0
      }
    ]`;
    nock('http://www.example.com', {
        reqheaders: {
          'x-ems-date': /\d{8}T\d{6}Z/,
          'x-ems-auth': /EMS-HMAC-SHA256 Credential=test_test-target_v1\/\d{8}\/eu\/test-target\/ems_request, SignedHeaders=content-type;host;x-ems-date, Signature=/
        }
      })
      .get('/hello')
      .reply(200, { yolo: true })

    const response = await escherRequest.get('http://www.example.com/hello');

    t.deepEqual(response.data, { yolo: true });
  }));
}));

