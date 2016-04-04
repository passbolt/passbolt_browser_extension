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
        'label': '2. Import your key',
        'title': 'Import an existing key or <a id="js_setup_goto_define_key" href="#" class="button primary">create</a> a new one!',
        'parents': ['domain_check'],
        'next': 'key_info',
        'defaultActions': {
            'submit': 'disabled',
            'cancel': 'enabled'
        },
        'viewData': {},
        'elts' : {
            browseButton : '#js_setup_import_key_browse',
            keyAscii : '#js_setup_import_key_text',
            errorFeedback : '#KeyErrorMessage',
            createButton: '#js_setup_goto_define_key'
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

        return step.importPrivateKey(key)
            .then(step.extractPublicKey)
            .then(function(publicKeyArmored) {
                passbolt.setup.set('key.publicKeyArmored', publicKeyArmored);
            })
            .fail(function(error) {
                step.onError(error);
                passbolt.setup.setActionState('submit', 'enabled');
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
    };

    /**
     * Import a private key in the keyring.
     * @param armoredPrivateKey
     * @returns {string}
     *   armored private key
     */
    step.importPrivateKey = function(armoredPrivateKey) {
        return passbolt.request('passbolt.keyring.private.import', armoredPrivateKey)
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
