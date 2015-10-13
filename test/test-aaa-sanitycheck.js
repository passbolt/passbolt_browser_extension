'use strict';

// Test if models are testable (so meta!)
exports.testSanityCheck = function(assert) {
    assert.ok(true, "sanity check model");
};

require('sdk/test').run(exports);