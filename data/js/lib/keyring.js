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

  passbolt.keyring = keyring;

})( passbolt );
