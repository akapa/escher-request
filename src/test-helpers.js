'use strict';

exports.a = testFunction => async t => {
  try {
    await testFunction(t);
  } catch (error) {
    if (error.response) {
      console.log(error.response.status, error.response.statusText);
      // console.log(error.config);
    } else {
      console.log(error.stack);
    }
    t.fail(`Unexpected error thrown from test: ${error.name} ${error.message}`);
  }
  t.end();
};
