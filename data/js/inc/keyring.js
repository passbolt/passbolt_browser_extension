/**
 * The passbolt keyring module used on content code side.
 */
var passbolt = passbolt || {};

(function (passbolt) {

  // The keyring module.
  var keyring = {};

  keyring.importPrivate = function(key) {
    return passbolt.request("passbolt.keyring.private.import", key);
  };

  keyring.importPublic = function(key, meta) {
    return passbolt.request("passbolt.keyring.public.import", key, meta);
  };

  passbolt.keyring = keyring;

})( passbolt );
