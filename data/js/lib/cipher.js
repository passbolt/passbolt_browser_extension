/**
 * The passbolt cipher module used on content code side.
 */
var passbolt = passbolt || {};

(function (passbolt) {

  // The cipher module.
  var cipher = {};

  cipher.decrypt = function(armored) {
    return passbolt.request("passbolt.cipher.decrypt", armored);
  };

  cipher.encrypt = function(unarmored, usersIds, callback) {
    return passbolt.request("passbolt.cipher.encrypt", unarmored, usersIds);
  };

  passbolt.cipher = cipher;

})( passbolt );
