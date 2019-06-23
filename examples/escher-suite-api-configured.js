'use strict';

const SuiteRequest = require('escher-suiteapi-js');
const KeyPool = require('escher-keypool');

process.env.TEST_TARGET_URL='localhost'
process.env.TEST_TARGET_PORT='9193'
process.env.TEST_TARGET_SECURE='false'
process.env.TEST_TARGET_ESCHER_KEY_ID='test_test-target'
process.env.TEST_TARGET_CREDENTIAL_SCOPE='eu/test-target/ems_request'
process.env.ESCHER_KEY_POOL = `[
  { "keyId": "test_test-target_v1", "secret": "secret", "acceptOnly": 0 }
]`

const options = new SuiteRequest.Options(process.env.TEST_TARGET_URL, {
  credentialScope: process.env.TEST_TARGET_CREDENTIAL_SCOPE,
  secure: process.env.TEST_TARGET_SECURE === 'true',
  port: parseInt(process.env.TEST_TARGET_PORT)
})

const { secret, keyId } = KeyPool
  .create(process.env.ESCHER_KEY_POOL)
  .getActiveKey(process.env.TEST_TARGET_ESCHER_KEY_ID)

const suiteRequest =  SuiteRequest.create(keyId, secret, options)

suiteRequest.get('/hello?a=2')
  .then(console.log)
  .catch(console.log)