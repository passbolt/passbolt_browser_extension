/**
 * Passbolt setup step.
 */
var passbolt = passbolt || {};
passbolt.setup = passbolt.setup || {};
passbolt.setup.steps = passbolt.setup.steps || {};

(function (passbolt) {

  var step = {
    'id': 'security_token',
    'label': 'Set a security token',
    'title': 'We need a visual cue to protect us from the bad guys..',
    'parents': ['key_info', 'generate_key'],
    'next': 'password',
    'viewData': {}
  };

  step.init = function() {
    step.viewData.securityTokenColor = passbolt.setup.data.securityTokenColor || null;
    step.viewData.securityTokenCode = passbolt.setup.data.securityTokenCode || null;
  };

  step.start = function() {
    // Check that the pre-filled values unlock the submit button.
    if ($('#js_setup_security_token_color').val().length != 7 || $('#js_setup_security_token_code').val().length != 3) {
      passbolt.setup.setActionState('submit', 'disabled');
    }
    // While changing the security token value.
    $('#js_setup_security_token_color, #js_setup_security_token_code').on('input', function() {
      if ($('#js_setup_security_token_color').val().length == 7 && $('#js_setup_security_token_code').val().length == 3) {
        passbolt.setup.setActionState('submit', 'enabled');
      }
      else {
        passbolt.setup.setActionState('submit', 'disabled');
      }
    });
  };

  step.submit = function() {
    passbolt.setup.setActionState('submit', 'processing');
    var def = $.Deferred(),
      securityTokenColor = $('#js_setup_security_token_color').val(),
      securityTokenCode = $('#js_setup_security_token_code').val();

    if ($.trim(securityTokenColor).length == 7 && $.trim(securityTokenCode).length == 3) {
      passbolt.setup.data.securityTokenColor = securityTokenColor;
      passbolt.setup.data.securityTokenCode = securityTokenCode;
      def.resolve();
    }

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
