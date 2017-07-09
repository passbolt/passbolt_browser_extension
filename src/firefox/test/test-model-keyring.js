/**
 * Test keyring model.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

'use strict';

var Keyring = require('../lib/model/keyring').Keyring;
var Settings = require('../lib/model/settings').Settings;
var keyring = new Keyring();
var GpgkeyFixture = require('./fixture/gpgkeyFixture').GpgkeyFixture;
var Validator = require('../lib/vendors/validator.js');

/**
 * Test Gpg Key Import
 * @param assert
 */
exports.testPrivateImport = function(assert) {

    // Import with a wrong key should return false
    for(var i=0; i < GpgkeyFixture.private.not.length; i++) {
        try {
            keyring.importPrivate(GpgkeyFixture.private.not[i]);
            assert.ok(e.message == 'TypeError: armoredKey is undefined', 'import with empty key should throw an exception');
        } catch(e) {
            assert.ok(true);
        }
    }

    // Import with a good key should return true
    for(var i=0; i < GpgkeyFixture.private.ok.length; i++) {
        var result = keyring.importPrivate(GpgkeyFixture.private.ok[i]);
        assert.ok(result == true, 'Private key import (' + i + ') should work: ' + result);
    }
};

/**
 * Check unlocking a private keyring with a given passphrase
 * @param assert
 */
exports.testcheckPassphrase = function(assert) {
    var result = keyring.importPrivate(GpgkeyFixture.ada.private);
    assert.ok(result == true, 'Private key import should work');

    keyring.checkPassphrase(GpgkeyFixture.ada.phassphrase)
        .then(
            function() {
                assert.ok(true, 'Private key decrypt should work');
            },
            function(error) {
               throw "The decrypt should have worked";
            }
        );
};

/**
 * Check importing a public key
 * @param assert
 */
exports.testImportPublic = function(assert) {

    // Import with a good key without uuid return false
    try {
        var result = keyring.importPublic(GpgkeyFixture.public.ok[0].key);
        assert.ok(false, 'import with no user id should throw an exception');
    } catch(e) {
        assert.ok(true);
    }

    // Import with a good key with wrong uuid return false
    try {
        var result = keyring.importPublic(GpgkeyFixture.public.ok[0].key,'123');
        assert.ok(false, 'import with no user id should throw an exception');
    } catch(e) {
        assert.ok(true);
    }

    // Import with a good key should return true
    for(var i=0; i < GpgkeyFixture.public.ok.length; i++) {
        var k = GpgkeyFixture.public.ok[i];
        var result = keyring.importPublic(k.key, k.user_id);
        assert.ok(result === true, 'Public key import (' + i + ') should work: ' + result);
    }

};

/**
 * Check flushing the keyring
 * @param assert
 */
exports.testFlush = function(assert) {
    keyring.importPublic(GpgkeyFixture.ada.public, GpgkeyFixture.ada.user_id);
    keyring.importPublic(GpgkeyFixture.betty.public, GpgkeyFixture.betty.user_id);
    keyring.importPrivate(GpgkeyFixture.ada.private);
    var publicKeys = Keyring.getPublicKeys();
    var privateKeys = Keyring.getPrivateKeys();

    var l = Object.keys(publicKeys).length;
    assert.ok( l == 2, 'There should be 2 public keys in the keyring');
    l = Object.keys(privateKeys).length;
    assert.ok( l == 1, 'There should be 1 private key in the keyring');

    keyring.flush(Keyring.PUBLIC);
    publicKeys = Keyring.getPublicKeys();
    privateKeys = Keyring.getPrivateKeys();

    l = Object.keys(publicKeys).length;
    assert.ok( l == 0, 'There should be 0 public key in the keyring');
    l = Object.keys(privateKeys).length;
    assert.ok( l == 1, 'There should be 1 private key in the keyring');

    keyring.flush(Keyring.PRIVATE);
    privateKeys = Keyring.getPrivateKeys();
    l = Object.keys(privateKeys).length;
    assert.ok( l == 0, 'There should be 0 private key in the keyring');

};

/**
 * Check getting key informations
 * @param assert
 */
exports.testKeyInfo = function(assert) {
    var fixture = GpgkeyFixture.public.ok[0];
    var info = keyring.keyInfo(fixture.key);

    assert.ok(info.keyid == fixture.keyid);
    assert.ok(info.userIds[0].name == fixture.userIds[0].name);
    assert.ok(info.userIds[0].email == fixture.userIds[0].email);
    assert.ok(info.fingerprint == fixture.fingerprint);
    assert.ok(info.algorithm == fixture.algorithm);
    assert.ok(info.created.toString() == fixture.created.toString());
    assert.ok(info.expires.toString() == fixture.expires.toString());
    assert.ok(info.length == fixture.length);
};

/**
 * Check storing a key in the keyring
 * @param assert
 */
exports.testSync = function(assert, done) {
    var Auth = require('../lib/model/auth').Auth;
    var auth = new Auth();

    keyring.flush(Keyring.PUBLIC);
    keyring.importPrivate(GpgkeyFixture.ada.private);

    auth.login('ada@passbolt.com').then(
      function success(referrer) {
          keyring.sync()
            .then(function() {
                var publicKeys = Keyring.getPublicKeys();
                var l = Object.keys(publicKeys).length;
                assert.ok( l > 0, 'There should be at least one public key in the keyring');
                done();
            }, function error(error) {
                assert.ok(false, 'There should not be an error');
                done();
            })
            .catch(function(error) {
                assert.ok(false, 'There should not be an exception');
                done();
            });
      });
};

///**
// * Check storing a key in the keyring
// * @param assert
// */
//exports.testStore = function(assert) {
//    console.log('todo');
//};
//
//
///**
// * Check extracting public key from private key
// * @param assert
// */
//exports.testExtractPublicKey = function(assert) {
//    console.log('todo');
//};
//
///**
// * Check finding public key in keyring
// * @param assert
// */
//exports.testFindPublic = function(assert) {
//    console.log('todo');
//};
//
///**
// * Check finding private key in keyring
// * @param assert
// */
//exports.testFindPrivate = function(assert) {
//    console.log('todo');
//};
//
///**
// * Check generating a keypair
// * @param assert
// */
//exports.testGenerateKeyPair = function(assert) {
//    console.log('todo');
//};

require('../sdk/test').run(exports);