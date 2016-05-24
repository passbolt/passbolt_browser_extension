/**
 * Passbolt domain check setup step
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
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
        'defaultActions': {
            'submit': 'disabled',
            'cancel': 'hidden'
        },
        /**
         * Elements available in the dom.
         * Setup will automatically create corresponding jquery elements
         * that will be accessible with ${name}.
         * Example : step.elts.$fingerprintWrapper
         */
        elts: {
            fingerprintWrapper : '.input.key-fingerprint',
            fingerprintError : '.input.key-fingerprint .message.error',
            feedbackError : '#js_main_error_feedback',
            fingerprintInput : '#js_setup_key_fingerprint',
            domainCheckboxWrapper : '.input.checkbox',
            domainCheckbox : '#js_setup_domain_check',
            keyInfoLink :'#js_server_key_info'
        },

        // Will be used at runtime.
        _data: {
            domain : '',
            serverKey: null,
            serverKeyInfo: {}
        }
    };

    /* ==================================================================================
     *  Chainable functions
     * ================================================================================== */


    /**
     * Fetch server key.
     *
     * @param domain
     *   domain where to fetch the server key.
     *
     * @returns deferred
     */
    step._fetchServerKey = function (domain) {
        return passbolt.request('passbolt.auth.getServerKey', domain)
            .then(function (serverKey) {
                step._data.serverKey = serverKey.keydata;
                return serverKey.keydata;
            });
    };

    /**
     * Get public key information
     *
     * @param unarmoredServerKey
     *   unarmored server key
     *
     * @returns {*}
     */
    step._getKeyInfo = function (unarmoredServerKey) {
        // Now, request information for the given key, and store them in a variable.
        return passbolt.request('passbolt.keyring.public.info', unarmoredServerKey)
            .then(function (keyInfo) {
                step._data.serverKeyInfo = keyInfo;
                return keyInfo;
            });
    };

    /**
     * Display key info.
     *
     * @param keyInfo
     */
    step._displayKeyInfo = function (keyInfo) {
        step.elts.$fingerprintInput.attr('value', keyInfo.fingerprint.toUpperCase());
        step.elts.$domainCheckboxWrapper.css('visibility', 'visible');
    };

    /**
     * Get user domain.
     *
     * @returns {*}
     * @private
     */
    step._getUserDomain = function() {
        return passbolt.request('passbolt.user.settings.get.domain')
            .then(function(domain) {
                return domain;
            });
    };

    /**
     * Get user data.
     * @returns {*}
     * @private
     */
    step._getUserData = function(domain) {
        return passbolt.request('passbolt.user.get', {user:['firstname', 'lastname', 'username']})
            .then(function(user) {
                user.domain = domain;
                return user;
            });
    };


    /* ==================================================================================
     *  Content code events
     * ================================================================================== */

    /**
     * Display an error message for server key.
     * @param errorMessage
     */
    step.onErrorServerKey = function (errorMessage) {
        step.elts.$fingerprintWrapper.addClass('error');
        step.elts.$fingerprintError.text("Could not retrieve server key. Please contact administrator.");
    };

    /**
     * On Domain check.
     *
     * Happens when the domain checkbox is checked by the user.
     */
    step.onDomainCheck = function () {
        if (!step.elts.$domainCheckbox.is(':checked')) {
            passbolt.setup.setActionState('submit', 'disabled');
        } else {
            passbolt.setup.setActionState('submit', 'enabled');
        }
    };

    /**
     * On server key info click.
     *
     * Happens when the user has clicked on More link next to the server key fingerprint.
     *
     * @returns {boolean}
     */
    step.onServerKeyInfo = function () {
        if (step.elts.$fingerprintInput.val() != '') {
            step.showKeyInfoDialog(step._data.serverKeyInfo);
        }
        return false;
    };

    /**
     * On error.
     *
     * Is called for general errors that doesn't require specific behavior.
     *
     * @param errorMsg
     */
    step.onError = function (errorMsg) {
        step.elts.$feedbackError
            .removeClass('hidden')
            .text(errorMsg);
    }

    /* ==================================================================================
     *  Core functions (Implements()).
     * ================================================================================== */

    /**
     * Implement init().
     *
     * @return deferred
     */
    step.init = function () {
        return passbolt.setup.get('settings.domain')
            .then(function(domain) {
                step.viewData.domain = step._data.domain = domain;
            });
    };

    /**
     * Implement start().
     */
    step.start = function () {
        step.elts.$domainCheckboxWrapper.css('visibility', 'hidden');

        // username and name is set, get the server key.
        step.fetchServerKey();

        // Check if server is already configured, and display warning.
        passbolt.request('passbolt.addon.isConfigured')
            .then(function (isConfigured) {
                if (isConfigured) {
                    step._getUserDomain()
                        .then(step._getUserData)
                        .then(function(userSettings) {
                            getTpl('./tpl/setup/already_configured.ejs', function (tpl) {
                                $('.plugin-check .message')
                                    .html(new EJS({text: tpl}).render(userSettings))
                                    .parent()
                                    .removeClass('success')
                                    .addClass('warning');
                            });
                        });
                }
            });

        // Bind domain check change event.
        step.elts.$domainCheckbox.change(step.onDomainCheck);

        // Init key info dialog.
        step.elts.$keyInfoLink.click(step.onServerKeyInfo);
    };

    /**
     * Implement submit().
     * @returns {*}
     */
    step.submit = function () {
        // Deferred.
        var def = $.Deferred();

        // Set submit form as processing.
        passbolt.setup.setActionState('submit', 'processing');

        // Set domain in the settings.
        step.setDomain(step._data.domain)

            // If domain was set succesfully, attempt to import the server key.
            .then(function () {
                return step.setServerKey(step._data.serverKeyInfo.key);
            })

            // If server key was imported successfully, resolve submit.
            .then(function () {
                setTimeout(function () {
                    def.resolve();
                }, 1000)
            })

            // In case of error,  display fatal error.
            .fail(function (msg) {
                passbolt.setup.fatalError(msg);
            });

        return def;
    };

    /**
     * Implement cancel().
     * @returns {null}
     */
    step.cancel = function () {
        // No cancel action available at this step.
        return null;
    };

    /* ==================================================================================
     *  Business functions
     * ================================================================================== */

    /**
     * Set domain in the settings.
     * Is called at the page submit.
     *
     * @param domain.
     *
     * @returns {*}
     */
    step.setDomain = function (domain) {
        return passbolt.request('passbolt.setup.set', 'settings.domain', domain)
            .fail(function (errorMsg) {
                step.onError(errorMsg);
            });
    };


    /**
     * Set the server key in the settings.
     * Is called at the page submit.
     *
     * @param armoredServerKey
     * @returns {*}
     */
    step.setServerKey = function (armoredServerKey) {
        return passbolt.request('passbolt.setup.set', 'settings.armoredServerKey', armoredServerKey)
            .fail(function (errorMsg) {
                step.onError(errorMsg);
            });
    };

    /**
     * Show key information dialog, and initialize its components.
     *
     * @param keyInfo
     *   key information, as returned by getKeyInfo().
     */
    step.showKeyInfoDialog = function (keyInfo) {
        getTpl('./tpl/setup/dialog_key_info.ejs', function (tpl) {
            var data = keyInfo;
            $('body').prepend(new EJS({text: tpl}).render(data));
            var $dialog = $('.dialog-wrapper');
            // Init controls close and ok.
            $('.js-dialog-close, input[type=submit]', $dialog).click(function () {
                $dialog.remove();
            });
            // TODO : Help page and re-enable help button in dialog view.
        });
    };

    /**
     * Fetch and display server key.
     */
    step.fetchServerKey = function () {
        step._fetchServerKey(step._data.domain)
            .then(step._getKeyInfo)
            .then(step._displayKeyInfo)
            .fail(function (msg) {
                step.onErrorServerKey(msg);
            });
    };

    passbolt.setup.steps[step.id] = step;

})(passbolt);
