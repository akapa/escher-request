'use strict';

const test = require('tape');
const nock = require('nock');
const _ = require('lodash');
const escherRequest = require('./main');
const { a } = require('./test-helpers');

// making requests
test('should find escher credentials based on url and set escher headers', a(async t => {
  setUpExampleEscherIntegration();

  nock('http://www.example.com', {
      reqheaders: {
        'x-ems-date': /\d{8}T\d{6}Z/,
        'x-ems-auth': /EMS-HMAC-SHA256 Credential=test_test-target_v1\/\d{8}\/eu\/test-target\/ems_request, SignedHeaders=content-type;host;x-ems-date, Signature=/
      }
    })
    .get('/hello')
    .reply(200, { yolo: true });

  const response = await escherRequest.get('http://www.example.com/hello');

  t.deepEqual(response.data, { yolo: true });
}));

test('should sign the request correctly when using a relative url and escherKeyId param', a(async t => {
  setUpExampleEscherIntegration();
  nock('http://www.example.com', {
      reqheaders: {
        'x-ems-date': /\d{8}T\d{6}Z/,
        'x-ems-auth': /EMS-HMAC-SHA256 Credential=test_test-target_v1\/\d{8}\/eu\/test-target\/ems_request, SignedHeaders=content-type;host;x-ems-date, Signature=/
      }
    })
    .get('/hello')
    .reply(200, { yolo: true });

  const response = await escherRequest.get('/hello', { escherKeyId: 'test_test-target_v1' });

  t.deepEqual(response.data, { yolo: true });
}));

test('should sign extra headers set through options', a(async t => {
  setUpExampleEscherIntegration();

  nock('http://www.example.com', {
      reqheaders: {
        'x-sajt': 'kacsa',
        'x-ems-auth': /SignedHeaders=content-type;host;x-ems-date;x-sajt,/
      }
    })
    .get('/hello')
    .reply(200, 'OK');

  const response = await escherRequest.get('http://www.example.com/hello', {
    headers: { 'x-sajt': 'kacsa' }
  });

  t.equal(response.data, 'OK');
}));

test('should pass down all relevant config to axios', a(async t => {
  setUpExampleEscherIntegration();

  nock('http://www.example.com').get('/hello').reply(200, 'OK');

  const response = await escherRequest.get('http://www.example.com/hello', {
    timeout: 1000,
    maxContentLength: 2000,
    maxRedirects: 5
  });
  t.deepEqual(
    _.pick(response.config, ['maxContentLength', 'timeout', 'maxRedirects']),
    { timeout: 1000, maxContentLength: 2000, maxRedirects: 5 }
  )
}));

const setUpExampleEscherIntegration = () => {
  process.env.ESCHER_INTEGRATIONS = `[
    {
      "serviceUrl": "http://www.example.com",
      "credentialScope": "eu/test-target/ems_request",
      "keyId": "test_test-target_v1",
      "secret": "secret",
      "acceptOnly": false
    }
  ]`;
}