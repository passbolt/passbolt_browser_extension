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
        'defaultActions': {
            'submit': 'disabled',
            'cancel': 'hidden'
        },

        // Will be used at runtime.
        serverKey: null,
        serverKeyInfo: {},

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
                step.serverKey = serverKey.keydata;
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
                step.serverKeyInfo = keyInfo;
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


    /* ==================================================================================
     *  Content code events
     * ================================================================================== */

    /**
     * On submit.
     *
     * @returns {*}
     */
    step.onSubmit = function () {
        // Deferred.
        var def = $.Deferred();

        // Set submit form as processing.
        passbolt.setup.setActionState('submit', 'processing');

        // Set domain in the settings.
        step.setDomain(passbolt.setup.data.domain)

            // If domain was set succesfully, attempt to import the server key.
            .then(function () {
                return step.importServerKey(step.serverKeyInfo.key);
            })

            // If server key was imported successfully, resolve submit.
            .then(function () {
                setTimeout(function () {
                    def.resolve();
                }, 1000)
            })

            // In case of error, we display an error in the console.
            .fail(function (msg) {
                console.log(msg);
                // back to ready state.
                passbolt.setup.setActionState('submit', 'ready');
            });

        return def;
    };

    /**
     * Display an error message for server key.
     * @param errorMessage
     */
    step.onErrorServerKey = function (errorMessage) {
        console.log("error retrieving server key : ", errorMessage);
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
            step.showKeyInfoDialog(step.serverKeyInfo);
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
        console.log('Error : ', errorMsg);
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
        var def = $.Deferred();
        step.viewData.domain = passbolt.setup.data.domain;
        passbolt.request('passbolt.setup.init');
        def.resolve();
        return def;
    };

    /**
     * Implement start().
     */
    step.start = function () {
        step.elts.$domainCheckboxWrapper.css('visibility', 'hidden');

        // Set the name and username on start.
        // so we can display an error if any.
        step.setName(passbolt.setup.data.firstName, passbolt.setup.data.lastName)
            .then(function () {
                step.setUsername(passbolt.setup.data.username).then(function () {
                    // username and name is set, get the server key.
                    step.fetchServerKey();
                });
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
        return step.onSubmit();
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
     * @param domain
     * @returns {*}
     */
    step.setDomain = function (domain) {
        return passbolt.request('passbolt.user.settings.set.domain', domain)
            .fail(function (errorMsg) {
                step.onError(errorMsg);
            });
    };

    /**
     * Validate and set the first name and last name in the plugin.
     *
     * @param firstName
     * @param lastName
     * @returns {*}
     */
    step.setName = function (firstName, lastName) {
        return passbolt.request('passbolt.user.set.name', firstName, lastName)
            .fail(function (errorMsg) {
                step.onError(errorMsg);
            });
    };

    /**
     * Validate and set the username in the plugin.
     *
     * @param username
     * @returns {*}
     */
    step.setUsername = function (username) {
        return passbolt.request('passbolt.user.set.username', username)
            .fail(function (errorMsg) {
                step.onError(errorMsg);
            });
    };

    /**
     * Import the server key in the keyring.
     * Is called at the page submit.
     *
     * @param armoredServerKey
     * @returns {*}
     */
    step.importServerKey = function (armoredServerKey) {
        return passbolt.request('passbolt.keyring.server.import', armoredServerKey)
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
        step._fetchServerKey(passbolt.setup.data.domain)
            .then(step._getKeyInfo)
            .then(step._displayKeyInfo)
            .fail(function (msg) {
                step.onErrorServerKey(msg);
            });
    };

    passbolt.setup.steps[step.id] = step;

})(passbolt);
