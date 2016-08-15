/**
 * Passbolt passphrase setup step.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var passbolt = passbolt || {};
passbolt.setup = passbolt.setup || {};
passbolt.setup.steps = passbolt.setup.steps || {};

(function (passbolt) {

    var step = {
        'id': 'secret',
        'elts' : {
            password : '#js_field_password',
            passwordClear : '#js_field_password_clear',
            viewPasswordButton : '#js_show_pwd_button',
            passwordStrength : '#js_user_pwd_strength',
            passwordCriterias : '#js_password_match_criterias'
        }
    };

    /* ==================================================================================
     *  Content code events
     * ================================================================================== */

    /**
     * On click event on the view button.
     *
     * @param ev
     * @param el
     */
    step.onViewButtonClick = function(ev, el) {
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
    }

    /**
     * On input change event on the clear password field.
     */
    step.onPasswordClearInput = function() {
        // Update password field.
        step.elts.$password.val(step.elts.$passwordClear.val())
            .trigger('change');
    }

    /**
     * On input change event on the password field.
     */
    step.onPasswordInput = function() {
        // Get password from password field.
        var password = step.elts.$password.val();

        // Update password in clear.
        step.elts.$passwordClear.val(password);

        // Update strength.
        step._updatePasswordStrength(password);

        // Update criterias.
        step._updatePasswordCriterias(password);

        // Validate key.
        passbolt.request('passbolt.keyring.key.validate', {passphrase : password}, ['passphrase'])
            .then(function() {
                passbolt.setup.setActionState('submit', 'enabled');
            })
            .then(null, function(errorMessage, validationErrors) {
                passbolt.setup.setActionState('submit', 'disabled');
            })
    }


    /* ==================================================================================
     *  Core functions (Implements()).
     * ================================================================================== */

    /**
     * Implements init().
     * @returns {*}
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
    };

    /**
     * Implements submit().
     * @returns {*}
     */
    step.submit = function () {
        passbolt.setup.setActionState('submit', 'processing');

        // Validate the key and return promise related to validation.
        return passbolt.request('passbolt.keyring.key.validate', {passphrase : step.elts.$password.val()}, ['passphrase'])
            .then(function() {
                passbolt.setup.set('key.passphrase', step.elts.$password.val());
            })
            .then(null, function(errorMessage, validationErrors) {
                passbolt.setup.setActionState('submit', 'disabled');
            })
    };

    /**
     * Implements cancel().
     * @returns {*}
     */
    step.cancel = function () {
        passbolt.setup.setActionState('cancel', 'processing');
        var def = $.Deferred();
        def.resolve();
        return def;
    };

    /* ==================================================================================
     *  Business functions
     * ================================================================================== */

    /**
     * Update the secret strength component.
     * @param secret
     */
    step._updatePasswordCriterias = function (password) {
        getTpl('./tpl/secret/criterias.ejs', function (tpl) {
            var criterias = {};
            if (password.length > 0) {
                var criterias = secretComplexity.matchMasks(password);
                criterias['dictionary'] = null;
                criterias['minLength'] = password.length >= 8;
            }
            var data = {
                criterias: criterias
            };
            step.elts.$passwordCriterias.html(new EJS({text: tpl}).render(data));
        });
    };

    /**
     * Update the secret strength component.
     * @param secret
     */
    step._updatePasswordStrength = function (password) {
        getTpl('./tpl/secret/strength.ejs', function (tpl) {
            var strength = secretComplexity.strength(password);
            var data = {
                strengthId: secretComplexity.STRENGTH[strength].id,
                strengthLabel: secretComplexity.STRENGTH[strength].label
            };
            step.elts.$passwordStrength.html(new EJS({text: tpl}).render(data));
        });
    };

    passbolt.setup.steps[step.id] = step;

})(passbolt);
