/**
 * Passbolt setup step.
 */
var passbolt = passbolt || {};
passbolt.setup = passbolt.setup || {};
passbolt.setup.steps = passbolt.setup.steps || {};

(function (passbolt) {

  var step = {
    'id': 'password',
    'label': 'Login !',
    'parents': ['security_token'],
    'viewData': {}
  };

  step.init = function() {
    step.viewData.firstName = passbolt.setup.data.firstName || null;
    step.viewData.lastName = passbolt.setup.data.lastName || null;
    step.viewData.domain = passbolt.setup.data.domain || null;
    step.viewData.username = passbolt.setup.data.username || null;
  };

  step.start = function() {
    passbolt.setup.setActionState('submit', 'disabled');
    $('#js_setup_password').on('input change', function() {
      if($('#js_setup_password').val().length) {
        passbolt.setup.setActionState('submit', 'enabled');
      } else {
        passbolt.setup.setActionState('submit', 'disabled');
      }
    });
  };

  step.submit = function() {
    passbolt.setup.setActionState('submit', 'processing');
    var def = $.Deferred();

    passbolt.setup.data.password = $('#js_setup_password').val();
    passbolt.request('passbolt.setup.save', passbolt.setup.data)
      .then(function() {
        console.log('done');
      });

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
