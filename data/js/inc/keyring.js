/**
 * The passbolt keyring module used on content code side.
 */
var passbolt = passbolt || {};

(function (passbolt) {

  // The keyring module.
  var keyring = {};

  /**
   * Request the addon code to import given private key
   * @param privateKeyArmored
   * @returns {*}
   */
  keyring.importPrivate = function(privateKeyArmored) {
    return passbolt.request("passbolt.keyring.private.import", privateKeyArmored);
  };

  /**
   * Request the addon code to import given public key for a user id
   * @param publicKeyArmored
   * @param userid user uuid
   * @returns {*}
   */
  keyring.importPublic = function(publicKeyArmored, userid) {
    return passbolt.request("passbolt.keyring.public.import", publicKeyArmored, userid);
  };

  /**
   *
   * @param armoredKey
   * @param userId
   * @returns {{user_id: *, key: *}}
   */
  //keyring.getKeyMeta = function(armoredKey, userId) {
  //  var meta = {
  //    "user_id" : userId,
  //    "key" : armoredKey
  //  };
  //  return meta;
  //};

  passbolt.keyring = keyring;

})( passbolt );
