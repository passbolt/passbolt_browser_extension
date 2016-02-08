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
    step.onError = function (errorMsg, validationErrors) {
        console.log('Error : ', errorMsg, validationErrors);

        var html = '<p>Error : ' + errorMsg + '</p>';
        if (validationErrors != undefined) {
            html += '<ul>';
            for (var i in validationErrors) {
                var valError = validationErrors[i];
                html += '<li>' + valError[Object.keys(valError)[0]] + '</li>';
            }
            html += '</ul>';
        }

        step.elts.$feedbackError
            .removeClass('hidden')
            .html(html);
    }


    /* ==================================================================================
     *  Core functions (Implements()).
     * ================================================================================== */

    /**
     * Implements init().
     * @returns {*}
     */
     step.init = function () {

        return step._getData()
            .then(function(data) {
                step.viewData.username = step.data.username = data.user.username;
                step.viewData.firstName = step.data.firstname = data.user.firstname;
                step.viewData.lastName = step.data.lastname = data.user.lastname;
                step.viewData.comment = step.data.comment = (data.key.comment != undefined ? data.key.comment : '');
                step.viewData.domain = step.data.domain = data.settings.domain;
            });
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

        var key = {
            ownerName : step.data.firstname + ' ' + step.data.lastname,
            ownerEmail : step.data.username,
            comment : step.elts.$keyComment.val(),
            length : step.elts.$keyLength.val(),
            algorithm : step.elts.$keyType.val()
        };

        var validated = step._validateKeyInfo(key).then(function() {
            // Store setup data.
            passbolt.setup.set('key', key);
        });

        return validated;
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
        return passbolt.setup.get()
            .fail(function(errorMsg) {
                step.onError(errorMsg);
            });
    }

    /**
     * Validate key info.
     *
     * @param keyInfo
     * @returns {*}
     */
    step._validateKeyInfo = function(keyInfo) {
        return passbolt.request('passbolt.keyring.key.validate', keyInfo, ['ownerName', 'ownerEmail', 'comment', 'length', 'algorithm'])
            .fail(function(errorMsg, validationErrors) {
                step.onError(errorMsg, validationErrors);
                // back to ready state.
                passbolt.setup.setActionState('submit', 'enabled');
            });
    }

    passbolt.setup.steps[step.id] = step;

})(passbolt);
