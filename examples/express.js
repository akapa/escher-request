'use strict';

process.env.ESCHER_INTEGRATIONS = `[
  {
    "serviceUrl": "http://somewhere.com",
    "credentialScope": "eu/test/ems_request",
    "keyId": "test_test-target_v1",
    "secret": "secret",
    "acceptOnly": false
  }
]`;

const escherRequest = require('../src/main');
const express = require('express');
const app = express();

const escherAuthMiddleware = (req, res, next) => {
  const { authenticated, message } = escherRequest.authenticate(
    'eu/test-target/ems_request',
    req
  );
  authenticated ? next() : res.status(401).send(message);
};

app.get('/hello', escherAuthMiddleware, (req, res) => res.send('Hello World!'));

app.listen(9193);
