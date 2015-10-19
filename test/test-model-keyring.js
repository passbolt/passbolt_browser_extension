'use strict';

var Keyring = require('../lib/model/keyring').Keyring;
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

    var result = keyring.checkPassphrase(GpgkeyFixture.ada.phassphrase);
    assert.ok(result, 'Private key decrypt should work');
};

/**
 * Check importing a public key
 * @param assert
 */
exports.testImportPublic = function(assert) {

    //Import with a good key without uuid return false
    try {
        var result = keyring.importPublic(GpgkeyFixture.public.ok[0].key);
        assert.ok(false, 'import with no user id should throw an exception');
    } catch(e) {
        assert.ok(true);
    }

    //Import with a good key with wrong uuid return false
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
    var l = Object.keys(keyring.publicKeys).length;
    assert.ok( l == 2, 'There should be 2 public keys in the keyring');
    l = Object.keys(keyring.privateKeys).length;
    assert.ok( l == 1, 'There should be 1 private key in the keyring');

    keyring.flush(Keyring.PUBLIC);
    l = Object.keys(keyring.publicKeys).length;
    assert.ok( l == 0, 'There should be 0 public key in the keyring');
    l = Object.keys(keyring.privateKeys).length;
    assert.ok( l == 1, 'There should be 1 private key in the keyring');

    keyring.flush(Keyring.PRIVATE);
    l = Object.keys(keyring.privateKeys).length;
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

require('sdk/test').run(exports);