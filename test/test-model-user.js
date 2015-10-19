'use strict';

var User = require('../lib/model/user').User;
var user = new User();
var Validator = require('../lib/vendors/validator.js');

/**
 * Test Gpg Key Import
 * @param assert
 */
exports.testIsValid = function(assert) {
    assert.ok(user.isValid() === false, 'User should not be valid');
};

exports.testGetCurrent = function(assert) {
    user.getCurrent().then(
        function() {
            assert.ok(false, 'Get current should not work');
        },
        function() {
            assert.ok(true);
        }
    );
    assert.ok(true);
};

require('sdk/test').run(exports);