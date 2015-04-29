/**
 * Passbolt setup step.
 */
var passbolt = passbolt || {};
passbolt.setup = passbolt.setup || {};
passbolt.setup.steps = passbolt.setup.steps || {};

(function (passbolt) {

  var step = {
    'id': 'secret',
    'title': 'Now let\'s setup your master password!',
    'label': '3. Set a master password',
    'parents': ['define_key'],
    'next': 'generate_key',
    'viewData': {}
  };

  step.init = function() {

  };

  step.start = function() {
    // Declare elements and variables.
    var $password = $('#js_field_password'),
      $passwordClear = $('#js_field_password_clear'),
      $viewPasswordButton = $('#js_show_pwd_button'),
      $passwordStrength = $('#js_user_pwd_strength');

    // Disable submit button at the beginning.
    passbolt.setup.setActionState('submit', 'disabled');

    /**
     * show / hide the secret.
     */
    var toggleViewPassword = function() {
      if ($password.hasClass('hidden')) {
        $password.removeClass('hidden');
        $passwordClear.addClass('hidden');
        $viewPasswordButton.removeClass('selected');
      } else {
        $password.addClass('hidden');
        $passwordClear.removeClass('hidden');
        $passwordClear.val($password.val());
        $viewPasswordButton.addClass('selected');
      }
    };

    /**
     * Update the secret strength component.
     * @param secret
     */
    var updatePasswordStrength = function(password) {
      getTpl('./tpl/secret/strength.ejs', function(tpl) {
        var strength = secretComplexity.strength(password);
        var data = {
          strengthId: secretComplexity.STRENGTH[strength].id,
          strengthLabel: secretComplexity.STRENGTH[strength].label
        };
        $passwordStrength.html(new EJS({text: tpl}).render(data));
      });
    };


    // On input change.
    $password.on('input change', function() {
      var password = $password.val();
      // Update password in clear.
      $passwordClear.val(password);
      // Update strength.
      updatePasswordStrength(password);

      // The submit button will be enabled only if the password
      // contains more than 8 characters.
      if($password.val().length >= 8) {
        passbolt.setup.setActionState('submit', 'enabled');
      } else {
        passbolt.setup.setActionState('submit', 'disabled');
      }
    });

    // When the clear password is updated.
    $passwordClear.on('input', function() {
      // Update password field.
      $password.val($passwordClear.val())
        .trigger('change');
    });

    // When the user explicitly wants to view the password.
    $viewPasswordButton.on('click', function(ev) {
      ev.preventDefault();
      toggleViewPassword();
    });
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
