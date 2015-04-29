/**
 * Passbolt setup step.
 */
var passbolt = passbolt || {};
passbolt.setup = passbolt.setup || {};
passbolt.setup.steps = passbolt.setup.steps || {};

(function (passbolt) {

  var step = {
    'id': 'secret',
    'label': '3. Set a secret',
    'parents': ['define_key'],
    'next': 'generate_key',
    'viewData': {}
  };

  step.init = function() {

  };

  step.start = function() {
  };

  step.submit = function() {
    passbolt.setup.setActionState('submit', 'processing');
    passbolt.setup.data.keyInfo.masterKey = $("#js_field_password").val();

    var def = $.Deferred();
    def.resolve();
    return def;
  };

  step.cancel = function() {
    passbolt.setup.setActionState('cancel', 'processing');
    var def = $.Deferred();
    def.resolve();
    return def;
  };

  passbolt.setup.steps[step.id] = step;

})( passbolt );
