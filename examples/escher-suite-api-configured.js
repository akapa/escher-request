'use strict';

const SuiteRequest = require('escher-suiteapi-js');
const KeyPool = require('escher-keypool');
const { URL } = require('url');

process.env.ESCHER_KEY_POOL = `[
  { "keyId": "test_test-target_v1", "secret": "secret", "acceptOnly": 0 }
]`
process.env.INTEGRATION_TEST_TARGET = `{
  "url": "http://localhost:9193",
  "keyId": "test_test-target",
  "credentialScope": "eu/test-target/ems_request"
}`

const integration = JSON.parse(process.env.INTEGRATION_TEST_TARGET);

const { protocol, hostname, port } = new URL(integration.url);
const options = new SuiteRequest.Options(hostname, {
  credentialScope: integration.credentialScope,
  secure: protocol !== 'http:',
  port
})

const { secret, keyId } = KeyPool
  .create(process.env.ESCHER_KEY_POOL)
  .getActiveKey(integration.keyId)

const suiteRequest =  SuiteRequest.create(keyId, secret, options)

suiteRequest.get('/hello?a=2')
  .then(console.log)
  .catch(console.log)