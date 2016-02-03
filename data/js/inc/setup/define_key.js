/**
 * Passbolt setup step.
 */
var passbolt = passbolt || {};
passbolt.setup = passbolt.setup || {};
passbolt.setup.steps = passbolt.setup.steps || {};

(function (passbolt) {

    var step = {
        'id': 'define_key',
        'label': '2. Define your keys',
        'title': 'Create a new key or <a id="js_setup_goto_import_key" href="#" class="button primary">import</a> an existing one!',
        'parents': ['domain_check'],
        'next': 'secret',
        'favorite': true,
        'viewData': {},
        'elts' : {
            importButton : '#js_setup_goto_import_key',
            ownerName : '#OwnerName',
            ownerEmail : '#OwnerEmail',
            keyComment : '#KeyComment',
            keyType : '#KeyType',
            keyLength : '#KeyLength',
            keyExpiryDate : '#KeyExpire',
            feedbackError : '#js_main_error_feedback'
        },
        options: {
            defaultKeyLength : 2048,
            defaultKeyType : 'RSA-DSA'
        },
        data: {

        }
    };

    /* ==================================================================================
     *  Content code events
     * ================================================================================== */

    /**
     * On click event on the import button.
     *
     * @param ev
     * @param el
     */
    step.onImportButtonClick = function(ev, el) {
        ev.preventDefault();
        passbolt.setup.switchToStep('import_key');
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
            .text('Error : ' + errorMsg);
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

        step._getData()
            .then(function(data) {
                step.viewData.username = step.data.username = data.username;
                step.viewData.firstName = step.data.firstname = data.firstname;
                step.viewData.lastName = step.data.lastname = data.lastname;
                step.viewData.domain = step.data.domain = data.settings.domain;

                def.resolve();
            });

        return def;
    };

    /**
     * Implements start().
     */
    step.start = function () {
        // Define default values for key length and type.
        step.elts.$keyLength.val(step.options.defaultKeyLength);
        step.elts.$keyType.val(step.options.defaultKeyType);

        // Bind the go to import an existing key button.
        step.elts.$importButton.click(step.onImportButtonClick);
    };

    /**
     * Implements submit().
     *
     * @returns {*}
     */
    step.submit = function () {
        // Set submit button into processing state.
        passbolt.setup.setActionState('submit', 'processing');

        var keyInfo = {};
        keyInfo.ownerName = step.data.firstname + ' ' + step.data.lastname;
        keyInfo.ownerEmail = step.data.username;
        keyInfo.comment = step.elts.$keyComment.val();
        keyInfo.length = step.elts.$keyLength.val();
        keyInfo.algorithm = step.elts.$keyType.val();

        return step.validateKeyInfo(keyInfo);
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
     * Get the data needed to start this step from plugin, and
     * Display an error in case it could not be retrieved.
     *
     * @returns Deferred
     *
     * @private
     */
    step._getData = function() {
        return passbolt.request('passbolt.user.get', {
            "user" : ["firstname", "lastname", "username"],
            "settings" : ["domain"]
        }).fail(function(errorMsg) {
                step.onError(errorMsg);
            });
    }

    /**
     * Validate key info.
     *
     * @param keyInfo
     * @returns {*}
     */
    step.validateKeyInfo = function(keyInfo) {
        return passbolt.request('passbolt.setup.keyinfo.set', keyInfo)
            .fail(function(errorMsg) {
                step.onError(errorMsg);
                // back to ready state.
                passbolt.setup.setActionState('submit', 'ready');
            });
    }

    passbolt.setup.steps[step.id] = step;

})(passbolt);
