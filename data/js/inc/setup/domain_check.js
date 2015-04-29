/**
 * The passbolt wizard domain check step
 */
var passbolt = passbolt || {};
passbolt.setup = passbolt.setup || {};
passbolt.setup.steps = passbolt.setup.steps || {};

(function (passbolt) {

  var step = {
    'id': 'domain_check',
    'label': '1. Get the plugin',
    'title': 'Welcome to passbolt! Let\'s take 5 min to setup your system.',
    'parents': null,
    'next': 'define_key',
    'viewData': {},
    'defaultActions': [
      'submit'
    ]
  };

  step.init = function() {
    step.viewData.domain = passbolt.setup.data.domain;
  };

  step.start = function() {
    passbolt.setup.setActionState('submit', 'disabled');
    $('#js_setup_domain_check').change(function() {
      if(!$(this).is(':checked')) {
        passbolt.setup.setActionState('submit', 'disabled');
      } else {
        passbolt.setup.setActionState('submit', 'enabled');
      }
    });
  };

  step.submit = function() {
    passbolt.setup.setActionState('submit', 'processing');
    var def = $.Deferred();
    setTimeout(function() {
      def.resolve();
    }, 1000);
    return def;
  };

  step.cancel = function() {
    // No cancel action available at this step.
    return null;
  };

  passbolt.setup.steps[step.id] = step;

})( passbolt );
