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

exports.testValidateFirstname = function (assert) {
    var firstname;
    var ok = [
        'ada','rémy','jean-marc','jean marc', 'd\'ante'
    ];
    var notok = [
        '', '$w4g', 'biloute_', '@___@', '+1', '../../test','javascript:alert("ok")', '/route'
    ];

    for (let value of ok) {
        firstname = value;
        try {
            assert.ok(user.__validate('firstname', firstname));
        } catch(e) {
            assert.ok(false, 'validation of firstname '+ firstname + ' should not throw the exception: ' + e.message);
        }
    }
    for (let value of notok) {
        firstname = value;
        try {
            user.__validate('firstname', firstname);
            assert.ok(false, 'validation of firstname '+ firstname + ' should throw an exception');
        } catch(e) {
            assert.ok(true);
        }
    }

};

exports.testValidateUsername = function (assert) {
    var username;
    var ok = [
        '1@passbolt.com', 'ada+test@passbolt.com','rémy@passbolt.com','jean-marc@passbolt.com','o\'flynn@passbolt.com'
    ];
    var notok = [
        'ada @ passbolt.com', 'ada@localhost', 'checkonetwo', '$w@g@sw4g3r.com', '../../@passbolt.com'
    ];

    for (let value of ok) {
        username = value;
        try {
            assert.ok(user.__validate('username', username));
        } catch(e) {
            assert.ok(false, 'validation of username '+ username + ' should not throw the exception: ' + e.message);
        }
    }
    for (let value of notok) {
        username = value;
        try {
            user.__validate('username', username);
            assert.ok(false, 'validation of username '+ username + ' should throw an exception');
        } catch(e) {
            assert.ok(true);
        }
    }

};

require('sdk/test').run(exports);