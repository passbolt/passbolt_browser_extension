/**
 * Passbolt passphrase setup step.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var passbolt = passbolt || {};
passbolt.setup = passbolt.setup || {};
passbolt.setup.steps = passbolt.setup.steps || {};

(function (passbolt) {

  /*
   * Step settings.
   */
  var step = {
      id: 'secret',
      elts: {
        password: '#js_field_password',
        passwordClear: '#js_field_password_clear',
        viewPasswordButton: '#js_show_pwd_button',
        passwordStrength: '#js_user_pwd_strength',
        passwordCriterias: '#js_password_match_criterias'
      }
    },

  // Allow to delay the treament of the master password input.
    currentOnPasswordInputTimeout = null;

  /**
   * Implements init().
   * @returns {promise}
   */
  step.init = function () {
    var def = $.Deferred();
    def.resolve();
    return def;
  };

  /**
   * Implements start().
   */
  step.start = function () {
    // Disable submit button at the beginning.
    passbolt.setup.setActionState('submit', 'disabled');

    // Update password criterias for empty password.
    step._updatePasswordCriterias('');

    // On input change.
    step.elts.$password.on('input change', function () {
      // If the treatment of the input is already schedule.
      if (currentOnPasswordInputTimeout != null) {
        clearTimeout(currentOnPasswordInputTimeout);
      }
      // Postpone the input treatment
      currentOnPasswordInputTimeout = setTimeout(function () {
        step.onPasswordInput();
      }, 100);
    });

    // When the clear password is updated.
    step.elts.$passwordClear.on('input', function () {
      step.onPasswordClearInput();
    });

    // When the user explicitly wants to view the password.
    step.elts.$viewPasswordButton.on('click', function (ev) {
      ev.preventDefault();
      step.onViewButtonClick(ev);
    });
  };

  /**
   * Implements submit().
   * @returns {promise}
   */
  step.submit = function () {
    passbolt.setup.setActionState('submit', 'processing');

    // Validate the key and return promise related to validation.
    return passbolt.request('passbolt.keyring.key.validate', {passphrase: step.elts.$password.val()}, ['passphrase'])
      .then(function () {
        passbolt.setup.set('key.passphrase', step.elts.$password.val());
      })
      .then(null, function (errorMessage, validationErrors) {
        passbolt.setup.setActionState('submit', 'disabled');
      })
  };

  /**
   * Implements cancel().
   * @returns {promise}
   */
  step.cancel = function () {
    passbolt.setup.setActionState('cancel', 'processing');
    var def = $.Deferred();
    def.resolve();
    return def;
  };

  /* ==================================================================================
   *  Content code events
   * ================================================================================== */

  /**
   * On click event on the view button.
   */
  step.onViewButtonClick = function () {
    if (step.elts.$password.hasClass('hidden')) {
      step.elts.$password.removeClass('hidden');
      step.elts.$passwordClear.addClass('hidden');
      step.elts.$viewPasswordButton.removeClass('selected');
    } else {
      step.elts.$password.addClass('hidden');
      step.elts.$passwordClear.removeClass('hidden');
      step.elts.$passwordClear.val(step.elts.$password.val());
      step.elts.$viewPasswordButton.addClass('selected');
    }
  };

  /**
   * On input change event on the clear password field.
   */
  step.onPasswordClearInput = function () {
    // Update password field.
    step.elts.$password.val(step.elts.$passwordClear.val())
      .trigger('change');
  };

  /**
   * On input change event on the password field.
   */
  step.onPasswordInput = function () {
    // Get password from password field.
    var password = step.elts.$password.val();

    // Update password in clear.
    step.elts.$passwordClear.val(password);

    // Update strength.
    return step._updatePasswordStrength(password)

      // Update criterias.
      .then(function () {
        return step._updatePasswordCriterias(password);
      })

      // Validate key.
      .then(function () {
        passbolt.request('passbolt.keyring.key.validate', {passphrase: password}, ['passphrase'])
          .then(function () {
            passbolt.setup.setActionState('submit', 'enabled');
          })
          .then(null, function (errorMessage, validationErrors) {
            passbolt.setup.setActionState('submit', 'disabled');
          })
      });
  };

  /* ==================================================================================
   *  Business functions
   * ================================================================================== */

  /**
   * Update the secret strength component.
   * @param password {string} The password to evaluate
   * @returns {promise}
   */
  step._updatePasswordCriterias = function (password) {
    var criterias = {};
    if (password.length > 0) {
      var criterias = secretComplexity.matchMasks(password);
      criterias['dictionary'] = null;
      criterias['minLength'] = password.length >= 8;
    }
    var data = {
      criterias: criterias
    };

    return passbolt.html.loadTemplate(step.elts.$passwordCriterias, './tpl/secret/criterias.ejs', 'html', data);
  };

  /**
   * Update the secret strength component.
   * @param password {string} The password to measure the strength
   * @returns {promise}
   */
  step._updatePasswordStrength = function (password) {
    var strength = secretComplexity.strength(password);
    var data = {
      strengthId: secretComplexity.STRENGTH[strength].id,
      strengthLabel: secretComplexity.STRENGTH[strength].label
    };

    return passbolt.html.loadTemplate(step.elts.$passwordStrength, './tpl/secret/strength.ejs', 'html', data);
  };

  passbolt.setup.steps[step.id] = step;

})(passbolt);
