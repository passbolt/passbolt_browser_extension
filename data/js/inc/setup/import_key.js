/**
 * Passbolt import key setup step.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var passbolt = passbolt || {};
passbolt.setup = passbolt.setup || {};
passbolt.setup.steps = passbolt.setup.steps || {};

(function (passbolt) {

    var step = {
        'id': 'import_key',
        'elts' : {
            browseButton : '#js_setup_import_key_browse',
            keyAscii : '#js_setup_import_key_text',
            errorFeedback : '#KeyErrorMessage',
            createButton: '#js_setup_goto_define_key'
        },
        'options': {
            'infoTemplate': null,
            // The workflow name is useful to know if we should check
            // whether the key exist on the server, or whether it doesn't exist.
            // install case: the key fingerprint is not supposed to exist.
            // recover case: the key fingerprint is supposed to exist.
            'workflow': 'install'
        },
        data: {

        }
    };

    /* ==================================================================================
     *  Content code events.
     * ================================================================================== */

    step.onBrowseClick = function() {
        step.browseKey()
            .then(function(data) {
                step.elts.$keyAscii.val(data).change();
                step.elts.$errorFeedback.addClass('hidden');
            });
    };

    step.onKeyInputChange = function() {
        if($.trim($(this).val()) == '') {
            passbolt.setup.setActionState('submit', 'disabled');
        } else {
            passbolt.setup.setActionState('submit', 'enabled');
        }
    };

    step.onError = function(errorMessage) {
        step.elts.$errorFeedback
            .removeClass('hidden')
            .html(errorMessage);
        passbolt.setup.setActionState('submit', 'enabled');
    };

    /* ==================================================================================
     *  Core functions (Implements()).
     * ================================================================================== */

    /**
     * Implements init().
     * @returns {*}
     */
     step.init = function() {
         var def = $.Deferred();
         def.resolve();
         return def;
    };

    /**
     * Implements start().
     */
    step.start = function() {
        // If info template is provided, display it.
        // We use this space to display side information to the user.
        if (step.options.infoTemplate != undefined && step.options.infoTemplate != null) {
            getTpl('./tpl/setup/' + step.options.infoTemplate, function (tpl) {
                $('#js_step_content .sideInfo').html(new EJS({text: tpl}).render());
            });
        }

        //// Bind the go back to create a new key button.
        step.elts.$createButton.click(function(ev) {
            ev.preventDefault();
            passbolt.setup.switchToStep('define_key');
        });

        // When the textarea displaying the key to import is filled.
        step.elts.$keyAscii.on('input change', step.onKeyInputChange);

        // Bind the browse filepicker button.
        step.elts.$browseButton.click(step.onBrowseClick);
    };

    /**
     * Implements submit().
     * @returns {*}
     */
    step.submit = function() {
        passbolt.setup.setActionState('submit', 'processing');

        var key = $('#js_setup_import_key_text').val();

        step.elts.$errorFeedback.addClass('hidden');

        return step.extractKeyInfo(key)
            .then(step.validateKeyExistance)
            .then(step.setPrivateKey)
            .then(step.extractPublicKey)
            .then(function(publicKeyArmored) {
                passbolt.setup.set('key.publicKeyArmored', publicKeyArmored);
            })
            .then(null, function(error) {
                step.onError(error);
            });
    };

    /**
     * Implements cancel().
     * @returns {*}
     */
    step.cancel = function() {
        passbolt.setup.setActionState('cancel', 'processing');
        var def = $.Deferred();
        def.resolve();
        return def;
    };

    /* ==================================================================================
     *  Business functions
     * ================================================================================== */

     /**
     * Browse key and return content of the key selected.
     * @returns {string}
     */
    step.browseKey = function() {
        return passbolt.request('passbolt.file.prompt')
            .then(function(data) {
                step.data.privateKeyArmored = data;
                return data;
            });
    },

  /**
   * Extract key info from private key.
   */
    step.extractKeyInfo = function(armoredPrivateKey) {
        return passbolt.request('passbolt.keyring.public.info', armoredPrivateKey)
            .then(function(info) {
                step.data.privateKeyInfo = info;
                return armoredPrivateKey;
            });
    },

    /**
     * Check that the key doesn't already exist on server.
     * @param armoredPrivateKey
     *   armored private key
     * @return promise
     */
    step.checkKeyDontExistRemotely = function (armoredPrivateKey) {
        var def = $.Deferred();
        passbolt.request('passbolt.setup.checkKeyExistRemotely', step.data.privateKeyInfo.fingerprint)
            .then(function() {
                def.reject('This key is already used by another user');
            })
            .then(null, function() {
                def.resolve(armoredPrivateKey);
            });
        return def;
    },

    /**
     * Check that the key exists on server.
     * @param armoredPrivateKey
     *   armored private key
     * @return promise
     */
    step.checkKeyExistRemotely = function (armoredPrivateKey) {
        var def = $.Deferred();
        passbolt.request('passbolt.setup.checkKeyExistRemotely', step.data.privateKeyInfo.fingerprint)
            .then(function() {
                def.resolve(armoredPrivateKey);
            })
            .then(null, function() {
                def.reject('This key doesn\'t match any account.');
            });
        return def;
    },

    /**
     * Check key existance depending on the workflow.
     * install case: check that the key doesn't exist remotely.
     * recover case: check that the key exist remotely.
     */
    step.validateKeyExistance = function(armoredPrivateKey) {
        if (step.options.workflow == 'install') {
            return step.checkKeyDontExistRemotely(armoredPrivateKey)
                .then(function() {
                   return armoredPrivateKey;
                });
        }
        else if (step.options.workflow == 'recover') {
            return step.checkKeyExistRemotely(armoredPrivateKey)
                .then(function() {
                    return armoredPrivateKey;
                });
        }
    },

    /**
     * Set the private key in the setup info.
     * @param armoredPrivateKey
     * @returns {*}
     */
    step.setPrivateKey = function(armoredPrivateKey) {
        return passbolt.request('passbolt.setup.set', 'key.privateKeyArmored', armoredPrivateKey)
            .then(function() {
                step.data.privateKeyArmored = armoredPrivateKey;
                return armoredPrivateKey;
            });
    };

    /**
     * Extract public key.
     * @param armoredPrivateKey
     * @returns {string}
     *   armored public key
     */
    step.extractPublicKey = function(armoredPrivateKey) {
        return passbolt.request('passbolt.keyring.public.extract', armoredPrivateKey)
            .then(function(publicKeyArmored) {
                step.data.publicKeyArmored = publicKeyArmored;
                return publicKeyArmored;
            });
    };

    passbolt.setup.steps[step.id] = step;

})( passbolt );
