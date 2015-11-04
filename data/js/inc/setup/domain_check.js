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
        ],

        // Will be used at runtime.
        serverKey: null,
        serverKeyInfo: {}
    };

    /**
     * Fetch server key.
     *
     * @param domain
     *   domain where to fetch the server key.
     *
     * @returns deferred
     */
    step.fetchServerKey = function(domain) {
        console.log('domain', domain);
        return passbolt.request('passbolt.auth.getServerKey', domain)
            .then(function(serverKey) {
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
    step.getKeyInfo = function(unarmoredServerKey) {
        // Now, request information for the given key, and store them in a variable.
        return passbolt.request('passbolt.keyring.public.info', unarmoredServerKey)
            .then(function(keyInfo) {
                step.serverKeyInfo = keyInfo;
                return keyInfo;
            });
    };

    /**
     * Set domain in the settings.
     * Is called at the page submit.
     *
     * @param domain
     * @returns {*}
     */
    step.setDomain = function(domain) {
        return passbolt.request('passbolt.user.settings.set.domain', domain);
    };

    /**
     * Import the server key in the keyring.
     * Is called at the page submit.
     *
     * @param armoredServerKey
     * @returns {*}
     */
    step.importServerKey = function(armoredServerKey) {
        return passbolt.request('passbolt.keyring.server.import', armoredServerKey);
    };

    /**
     * Show key information dialog, and initialize its components.
     *
     * @param keyInfo
     *   key information, as returned by getKeyInfo().
     */
    step.showKeyInfoDialog = function(keyInfo) {
        getTpl('./tpl/setup/dialog_key_info.ejs', function(tpl) {
            var data = keyInfo;
            $('body').prepend(new EJS({text: tpl}).render(data));
            var $dialog = $('.dialog-wrapper');
            // Init controls close and ok.
            $('.js-dialog-close, input[type=submit]', $dialog).click(function() {
                $dialog.remove();
            });
            // TODO : Help page and re-enable help button in dialog view.
        });
    };

    /**
     * Display an error message for server key.
     * @param errorMessage
     */
    step.errorServerKey = function(errorMessage) {
        $('.input.key-fingerprint').addClass('error');
        $('.input.key-fingerprint .message.error').text(errorMessage);
    };

    /**
     * Implement init().
     */
    step.init = function () {
        step.viewData.domain = passbolt.setup.data.domain;
        passbolt.request('passbolt.setup.init');
    };

    /**
     * Implement start().
     */
    step.start = function () {
        $('.input.checkbox').css('visibility', 'hidden');

        step.fetchServerKey(passbolt.setup.data.domain)
            .then(step.getKeyInfo)
            .then(function(info) {
                $('#js_setup_key_fingerprint').val(info.fingerprint.toUpperCase());
                $('.input.checkbox').css('visibility', 'visible');
            })
            .fail(function(msg) {
                step.errorServerKey(msg);
                console.log("error server key : " + msg);
            });

        passbolt.setup.setActionState('submit', 'disabled');
        $('#js_setup_domain_check').change(function () {
            if (!$(this).is(':checked')) {
                passbolt.setup.setActionState('submit', 'disabled');
            } else {
                passbolt.setup.setActionState('submit', 'enabled');
            }
        });

        // Init key info dialog.
        $('#js_server_key_info').click(function() {
            if ($('#js_setup_key_fingerprint').val() != '') {
                step.showKeyInfoDialog(step.serverKeyInfo);
            }
            return false;
        });
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
        step.setDomain(passbolt.setup.data.domain)

            // If domain was set succesfully, attempt to import the server key.
            .then(function() {
                return step.importServerKey(step.serverKeyInfo.key);
            })

            // If server key was imported successfully, resolve submit.
            .then(function() {
                setTimeout(function() {
                    def.resolve();
                }, 1000)
            })

            // In case of error, we display an error in the console.
            .fail(function(msg) {
                console.log(msg);
                // back to ready state.
                passbolt.setup.setActionState('submit', 'ready');
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

    passbolt.setup.steps[step.id] = step;

})(passbolt);
