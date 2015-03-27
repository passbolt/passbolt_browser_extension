/**
 * The passbolt file module used on content code side.
 */
var passbolt = passbolt || {};

(function (passbolt) {

  // The file module.
  var file = {};

  file.prompt = function(key) {
    return passbolt.request("passbolt.file.prompt", key);
  };

  passbolt.file = file;

})( passbolt );
