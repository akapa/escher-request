'use strict';

process.env.ESCHER_INTEGRATIONS = `[
  {
    "serviceUrl": "http://somewhere.com",
    "credentialScope": "eu/test/ems_request",
    "keyId": "test_test-target_v1",
    "secret": "secret"
  }
]`;

const escherRequest = require('../src/main');
const express = require('express');
const bodyParser = require('body-parser')

const app = express();
app.use(bodyParser.text({ type: '*/json' }));

const escherAuthMiddleware = (req, res, next) => {
  const { authenticated, message } = escherRequest.authenticate(
    'eu/test-target/ems_request',
    req
  );
  if (authenticated) {
    req.body = JSON.parse(req.body);
    next()
  } else {
    res.status(401).send(message);
  }
};

app.post('/puty', escherAuthMiddleware, (req, res) => {
  console.log(typeof req.body, req.body);
  res.send(req.body)
});

app.listen(9193);
