/**
 * The passbolt secret module used on content code side.
 */
var passbolt = passbolt || {};

(function (passbolt) {

  // The secret module.
  var secret = {};

  secret.decrypt = function(armored) {
    return passbolt.request("passbolt.secret.decrypt", armored);
  };

  secret.encrypt = function(unarmored, usersIds, callback) {
    return passbolt.request("passbolt.secret.encrypt", unarmored, usersIds);
  };

  passbolt.secret = secret;

})( passbolt );
