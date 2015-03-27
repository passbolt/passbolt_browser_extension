/**
 * The passbolt settings module used on content code side.
 */
var passbolt = passbolt || {};

(function (passbolt) {

  // The settings module.
  var settings = {};

  settings.saveVisualCode = function(code, label) {
    return passbolt.request("passbolt.settings.visual_code.save", code, label);
  };

  passbolt.settings = settings;

})( passbolt );
