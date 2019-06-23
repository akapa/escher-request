'use strict';

process.env.ESCHER_INTEGRATIONS = `[
  {
    "serviceUrl": "http://somewhere.com",
    "credentialScope": "eu/test/ems_request",
    "keyId": "test_test-target_v1",
    "secret": "secret"
  }
]`;

const Koa = require('koa');
const Router = require('koa-router');
const escherRequest = require('../src/main');

const escherAuthMiddleware = async (context, next) => {
  const { authenticated, message } = escherRequest.authenticate(
    'eu/test-target/ems_request',
    context.request
  );
  if (!authenticated) {
    context.status = 401;
    context.body = message;
  } else {
    await next();
  }
};

const app = new Koa();
var router = new Router();

router.get('/hello', escherAuthMiddleware, context => {
  context.body = 'Hello World';
});

app.use(router.routes());
app.listen(9193);
