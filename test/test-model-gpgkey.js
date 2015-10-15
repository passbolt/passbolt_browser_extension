'use strict';

var Gpgkey = require('../lib/model/gpgkey').Gpgkey;
var gpgkey = new Gpgkey();
var GpgkeyFixture = require('./fixture/gpgkeyFixture').GpgkeyFixture;
var uuid  = require('sdk/util/uuid');
var Validator = require('../lib/vendors/validator.js');

/**
 * Test Gpg Key Import
 * @param assert
 */
exports.testPrivateImport = function(assert) {

    // Import with a wrong key should return false
    for(var i=0; i < GpgkeyFixture.private.not.length; i++) {
        try {
            gpgkey.importPrivate(GpgkeyFixture.private.not[i]);
            assert.ok(e.message == 'TypeError: armoredKey is undefined', 'import with empty key should throw an exception');
        } catch(e) {
            assert.ok(true);
        }
    }

    // Import with a good key should return true
    for(var i=0; i < GpgkeyFixture.private.ok.length; i++) {
        var result = gpgkey.importPrivate(GpgkeyFixture.private.ok[i]);
        assert.ok(result == true, 'Private key import (' + i + ') should work: ' + result);
    }
};

/**
 * Check unlocking a private gpgkey with a given passphrase
 * @param assert
 */
exports.testcheckPassphrase = function(assert) {
    var result = gpgkey.importPrivate(GpgkeyFixture.ada.private);
    assert.ok(result == true, 'Private key import should work');

    var result = gpgkey.checkPassphrase(GpgkeyFixture.ada.phassphrase);
    assert.ok(result, 'Private key decrypt should work');
};

/**
 * Check importing a public key
 * @param assert
 */
exports.testImportPublic = function(assert) {

    //Import with a good key without uuid return false
    try {
        var result = gpgkey.importPublic(GpgkeyFixture.public.ok[0].key);
        assert.ok(false, 'import with no user id should throw an exception');
    } catch(e) {
        assert.ok(true);
    }

    //Import with a good key with wrong uuid return false
    try {
        var result = gpgkey.importPublic(GpgkeyFixture.public.ok[0].key,'123');
        assert.ok(false, 'import with no user id should throw an exception');
    } catch(e) {
        assert.ok(true);
    }

    // Import with a good key should return true
    for(var i=0; i < GpgkeyFixture.public.ok.length; i++) {
        var k = GpgkeyFixture.public.ok[i];
        var result = gpgkey.importPublic(k.key, k.user_id);
        assert.ok(result === true, 'Public key import (' + i + ') should work: ' + result);
    }

};

///**
// * Check flushing the keyring
// * @param assert
// */
//exports.testFlush = function(assert) {
//    console.log(gpgkey.importPublic(GpgkeyFixture.ada.public, GpgkeyFixture.ada.id));
//    console.log(gpgkey.importPublic(GpgkeyFixture.betty.public, GpgkeyFixture.betty.id));
//    var l = gpgkey.publicKeys.length;
//    console.log(gpgkey.publicKeys);
//    assert.ok( l == 2, 'There should be at least 2 public keys in the keyring');
//};

//
///**
// * Check importing a public key
// * @param assert
// */
//exports.testImportPublic = function(assert) {
//    console.log('todo');
//};
//
///**
// * Check storing a key in the keyring
// * @param assert
// */
//exports.testStore = function(assert) {
//    console.log('todo');
//};
//
///**
// * Check getting key informations
// * @param assert
// */
//exports.testKeyInfo = function(assert) {
//    console.log('todo');
//};
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