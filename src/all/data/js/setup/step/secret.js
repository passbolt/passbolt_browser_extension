/**
 * Passbolt passphrase setup step.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var passbolt = passbolt || {};
passbolt.setup = passbolt.setup || {};
passbolt.setup.steps = passbolt.setup.steps || {};

$(function () {

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
    },
    criterias: {},
    strength: undefined
  };

  /**
   * Implements init().
   * @returns Promise
   */
  step.init = function () {
    return new Promise(function(resolve, reject) {
      resolve();
    });
  };

  /**
   * Implements start().
   */
  step.start =  function () {
    // Disable submit button at the beginning.
    passbolt.setup.setActionState('submit', 'disabled');

    // Update password criterias for empty password.
    step._updatePasswordCriterias('').then(() => {
      // On input change.
      step.elts.$password.on('input change', function () {
        step.onPasswordInput();
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
    });
  };

  /**
   * Implements submit().
   * @returns {Promise}
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
   * @returns Promise
   */
  step.cancel = function () {
    return new Promise(function(resolve, reject) {
      passbolt.setup.setActionState('cancel', 'processing');
      resolve();
    });
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

    // Calculate password strength and criterias
    step.elts.$passwordClear.val(password);
    step.strength = secretComplexity.strength(password);

    if (password.length > 0) {
      step.criterias = secretComplexity.matchMasks(password);
      step.criterias['minLength'] = password.length >= 8;
      if (step.criterias['minLength']) {
        step._checkPasswordPwnd(password);
      } else {
        step.criterias['dictionary'] = false;
      }
    } else {
      step.criterias['minLength'] = false;
      step.criterias['alpha'] = false;
      step.criterias['uppercase'] = false;
      step.criterias['digit'] = false;
      step.criterias['special'] = false;
      step.criterias['dictionary'] = false;
    }
    step._onUpdateAll(password);
  };

  /* ==================================================================================
   *  Business functions
   * ================================================================================== */

  /**
   * Update the secret strength and password criteria component.
   * @returns {Promise}
   */
  step._onUpdateAll = function(password) {
    // Update strength.
    return step._updatePasswordStrength(step.strength)
      .then(() => step._updatePasswordCriterias(step.criterias))
      .then(() => passbolt.request('passbolt.keyring.key.validate', {passphrase: password}, ['passphrase']))
      .then(() => {
        passbolt.setup.setActionState('submit', 'enabled')
      }, (errorMessage) => {
        console.error(errorMessage);
        passbolt.setup.setActionState('submit', 'disabled');
      });
  };

  /**
   * Update the secret strength component.
   * @returns {Promise}
   */
  step._updatePasswordCriterias = function () {
    data = {
      criterias: step.criterias
    };
    return passbolt.html.loadTemplate(step.elts.$passwordCriterias, 'secret/criterias.ejs', 'html', data);
  };

  /**
   * Update strength and criteria when password is pwnd
   * @param password
   * @returns {Promise<Promise<T>|*|*>}
   * @private
   */
  step._checkPasswordPwnd = async function(password) {
    step.criterias['dictionary'] = undefined;
    var isPwnd;
    try {
      isPwnd = await secretComplexity.ispwned(password);
    } catch (error) {
      // something went wrong (like a network issue)
      // leave it undefined
      console.error(error.message);
      return;
    }
    if (typeof step.criterias['dictionary'] !== 'undefined') {
      // password was cleared in meantime, ignore this request
      return;
    }
    step.criterias['dictionary'] = !isPwnd;
    if (isPwnd) {
      step.strength = 1;
    }
    step._onUpdateAll(password);
  };

  /**
   * Update the secret strength component.
   * @param string {string} strength level to display
   * @returns {Promise}
   */
  step._updatePasswordStrength = function () {
    var data = {
      strengthId: secretComplexity.STRENGTH[step.strength].id,
      strengthLabel: secretComplexity.STRENGTH[step.strength].label
    };
    return passbolt.html.loadTemplate(step.elts.$passwordStrength, 'secret/strength.ejs', 'html', data);
  };

  passbolt.setup.steps[step.id] = step;

});
