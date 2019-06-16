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

const Koa = require('koa');
const Router = require('koa-router');
const bodyparser = require('koa-bodyparser');
const escherRequest = require('../src/main');

const escherAuthMiddleware = async (context, next) => {
  const { authenticated, message } = escherRequest.authenticate(
    'eu/test-target/ems_request',
    {
      method: context.request.method,
      url: context.request.url,
      headers: context.request.headers,
      body: context.request.rawBody
    }
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

app.use(bodyparser())

router.post('/puty', escherAuthMiddleware, context => {
  context.body = context.request.body;
});

app.use(router.routes());
app.listen(9193);
