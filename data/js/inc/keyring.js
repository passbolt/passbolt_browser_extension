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

  keyring.getKeyMeta = function(armoredKey, userId) {
    var meta = {
      "user_id" : userId,
      "key" : armoredKey
    };
    return meta;
  }

  passbolt.keyring = keyring;

})( passbolt );
