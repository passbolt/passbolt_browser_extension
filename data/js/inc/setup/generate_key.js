/**
 * Passbolt setup step.
 */
var passbolt = passbolt || {};
passbolt.setup = passbolt.setup || {};
passbolt.setup.steps = passbolt.setup.steps || {};

(function (passbolt) {

  var step = {
    'id': 'generate_key',
    'label': '',
    'parents': ['secret'],
    'next': 'security_token',
    'subStep': true,
    'viewData': {}
  };

  step.init = function() {

  };

  step.start = function() {
  };

  step.submit = function() {
    passbolt.setup.setActionState('submit', 'processing');
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
