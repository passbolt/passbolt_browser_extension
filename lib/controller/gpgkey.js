var openpgp = require("openpgp");
var storage = new (require('node-localstorage').LocalStorage)();
var Request = require("sdk/request").Request;
const { defer } = require('sdk/core/promise');
var Config = require("model/config");
var Gpgkey = require("model/gpgkey").Gpgkey;
var gpgkey = new Gpgkey();

/**
 * Sync the local keyring with the passbolt back end.
 * Retrieve the latest updated Public Keys.
 */
var sync = function(worker) {
  var deferred = defer(),
    // Attention : some latencies have been observed while operating on the opengpg keyring.
    latestSync = storage.getItem('latestSync'),
    // Get the latest keys changes from the backend.
    url = Config.read('baseUrl') + "/gpgkeys.json";

  // If a sync has already been performed.
  if (latestSync) {
    url += '?modified_after=' + latestSync;
  }

  // Get the updated public keys from passbolt.
  Request({
    url: url,
    onComplete: function (raw) {
      var response = JSON.parse(raw.text);
      if (response.body) {
        // Store all the new keys in the keyring.
        for (var i in response.body) {
          var meta = response.body[i];
          gpgkey.importPublic(meta.Gpgkey.key, meta.Gpgkey);
        }
        gpgkey.store();
      }
      if (response.header) {
        // Update the latest synced time.
        storage.setItem('latestSync', response.header.servertime);
      }

      // Resolve the defer with the number of updated keys.
      deferred.resolve(response.body.length);
    }
  }).get();

  return deferred.promise;
};
exports.sync = sync;

/**
 * Get the private key information.
 * @param worker
 * @returns {OpenPgpKey}
 */
var privateKeyInfo = function(worker) {
  var gpgKey = gpgkey.findPrivate("MY_KEY_ID");
  return gpgKey;
};
exports.privateKeyInfo = privateKeyInfo;

/**
 * Get information about a given public key.
 * @param worker
 * @param publicArmoredKey
 * @returns {array}
 */
var publicKeyInfo = function(worker, publicArmoredKey) {
  var keyInfo = gpgkey.keyInfo(publicArmoredKey);
  return keyInfo;
};
exports.publicKeyInfo = publicKeyInfo;

/**
 * Find a public key for a given user.
 * @param worker
 * @param userId
 * @returns {OpenPgpKey}
 */
var findPublicKey = function(worker, userId) {
  var publicKey = gpgkey.findPublic(userId);
  return publicKey;
}
exports.findPublicKey = findPublicKey;

/**
 * Import a private key.
 * @param worker
 * @param txt
 */
var importPrivate = function(worker, txt) {
  return gpgkey.importPrivate(txt);
};
exports.importPrivate = importPrivate;

/**
 * Import a private key.
 * @param worker
 * @param txt
 */
var importPublic = function(worker, txt, meta) {
  return gpgkey.importPublic(txt, meta);
};
exports.importPublic = importPublic;

/**
 * Generate a key pair.
 * @param worker
 * @param userId
 * @param masterKey
 * @param lgth
 * @returns {OpenPgpKey}
 */
var generateKeyPair = function(worker, userId, masterKey, lgth) {
    return gpgkey.generateKeyPair(userId, masterKey, lgth);
};
exports.generateKeyPair = generateKeyPair;
