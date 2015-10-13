'use strict';

var Gpgkey = require('../lib/model/gpgkey').Gpgkey;
var gpgkey = new Gpgkey();

/**
 * Test Gpg Key Import
 * @param assert
 */
exports.testGpgkeyImport = function(assert) {

    var GpgkeyFixture = require('./fixture/gpgkeyFixture').GpgkeyFixture;

    // Import with empty key should throw an exception
    try {
        gpgkey.importPrivate();
        assert.ok(false, "import with empty key should throw an exception");
    } catch(e) {
        assert.ok(true, "import with empty key should throw an exception");
    }

    // Import with a wrong key should return false
    for(var i=0; i < GpgkeyFixture['not'].length; i++) {
        assert.ok( gpgkey.importPrivate(GpgkeyFixture['not'][i]) != true, 'import with wrong key (' + i +') should not work');
    }

    // Import with a good key should return true
    for(var i=0; i < GpgkeyFixture['ok'].length; i++) {
        assert.ok(gpgkey.importPrivate(GpgkeyFixture['ok'][i]), 'import with good key (' + i +') should work');
    }
};
require('sdk/test').run(exports);