'use strict';

const SuiteRequest = require('escher-suiteapi-js');

// simple use case
const options = new SuiteRequest.Options('localhost', {
  credentialScope: 'eu/test-target/ems_request',
  secure: false,
  port: 9193
});
const suiteRequest = SuiteRequest.create('test_test-target_v1', 'secret', options);

suiteRequest.get('/hello?a=2')
  .then(console.log)
  .catch(console.log);