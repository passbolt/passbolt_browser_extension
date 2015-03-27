var openpgp = require("openpgp");
var storage = new (require('node-localstorage').LocalStorage)();
var Request = require("sdk/request").Request;
var Config = require("config/config");
var Gpgkey = require("model/gpgkey").Gpgkey;
var gpgkey = new Gpgkey();

/**
 * Sync the local keyring with the passbolt back end.
 * Retrieve the latest updated Public Keys.
 */
var sync = function(worker) {
  // @todo Remove the forced flush.
  //gpgkey.flush(Gpgkey.PRIVATE);
  gpgkey.flush(Gpgkey.PUBLIC);
  storage.setItem('latestSync', null);

  // Attention : some latencies have been observed while operating on the opengpg keyring.
  var latestSync = storage.getItem('latestSync');
  // Get the latest keys changes from the backend.
  var url = Config.url + "/gpgkeys.json";
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
        for (var i in response.body) {
          var meta = response.body[i];
          gpgkey.importPublic(meta.Gpgkey.key, meta.Gpgkey);
        }
        gpgkey.store();
      }
    }
  }).get();
  storage.setItem('latestSync', Math.floor(new Date().getTime() / 1000));
};
exports.sync = sync;

/**
 * Get the private key information.
 * @param worker
 * @returns {OpenPgpKey}
 */
var privateKeyInfo = function(worker) {
  var keyInfo = gpgkey.findPrivate("MY_KEY_ID");
  return keyInfo;
};
exports.privateKeyInfo = privateKeyInfo;

/**
 * Import a private key.
 * @param worker
 * @param txt
 */
var importPrivate = function(worker, txt) {
  return gpgkey.importPrivate(txt);
};
exports.importPrivate = importPrivate;
