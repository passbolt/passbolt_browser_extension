/**
 * Passbolt setup step.
 */
var passbolt = passbolt || {};
passbolt.setup = passbolt.setup || {};
passbolt.setup.steps = passbolt.setup.steps || {};

(function (passbolt) {

  // The cipher module.
  var step = {
    'id': 'define_key',
    'label': 'Define your keys',
    'title': 'Create a new key or <a id="js_setup_goto_import_key" href="#">import</a> an existing one!',
    'parents': ['domain_check'],
    'next': 'secret',
    'favorite': true,
    'viewData': {}
  };

  step.init = function() {
  };

  step.start = function() {
    passbolt.setup.setActionState('submit', 'disabled');

    // Bind the go to import an existing key button.
    $('#js_setup_goto_import_key').click(function(ev) {
      ev.preventDefault();
      passbolt.setup.switchToStep('import_key');
    });
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
