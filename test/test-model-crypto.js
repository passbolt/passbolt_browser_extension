'use strict';

var Crypto = require('../lib/model/crypto').Crypto;

/**
 * Test Gpg Key Import
 * @param assert
 */
exports.testUuid = function(assert) {
    try {
        Crypto.uuid();
        assert.ok(false,'Crypto.uuid without seed should throw and exception')
    } catch (e) {
        assert.ok(true);
    }

    var adauuid = Crypto.uuid('user.id.ada');
    assert.ok( adauuid == 'cd49eb9e-73a2-3433-a018-6ed993d421e8',
        'ada uuid should be cd49eb9e-73a2-3433-a018-6ed993d421e8 and not '+ adauuid);
};
require('sdk/test').run(exports);