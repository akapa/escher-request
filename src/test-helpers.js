'use strict';

exports.a = testFunction => async t => {
  try {
    await testFunction(t);
  } catch (error) {
    t.fail(`Unexpected error thrown from test: ${error.name} ${error.message}`);
  }
  t.end();
};
