/**
 * Passbolt setup step.
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
        'viewData': {}
    };

    /**
     * Browse key and return content of the key selected.
     * @returns {string}
     */
    step.browseKey = function() {
        return passbolt.request('passbolt.file.prompt')
            .then(function(data) {
                passbolt.setup.data.key = data;
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
                passbolt.setup.data.key = armoredPrivateKey;
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
                passbolt.setup.data.publicKey = publicKeyArmored;
                return publicKeyArmored;
            });
    };

    step.init = function() {
        passbolt.setup.data.key = passbolt.setup.data.key ? passbolt.setup.data.key : '';
        step.viewData.key = passbolt.setup.data.key;
    };

    step.start = function() {
        // If no key has already been given, disable the submit button.
        if (!passbolt.setup.data.key.length) {
            passbolt.setup.setActionState('submit', 'disabled');
        }

        // Bind the go back to create a new key button.
        $('#js_setup_goto_define_key').click(function(ev) {
            ev.preventDefault();
            passbolt.setup.switchToStep('define_key');
        });

        // When the textarea displaying the key to import is filled.
        $('#js_setup_import_key_text').on('input change', function() {
            if($.trim($(this).val()) == '') {
                passbolt.setup.setActionState('submit', 'disabled');
            } else {
                passbolt.setup.setActionState('submit', 'enabled');
            }
        });

        // Bind the browse filepicker button.
        $('#js_setup_import_key_browse').click(function() {
            step.browseKey()
                .then(function(data) {
                    $('#js_setup_import_key_text').val(data).change();
                    $('#KeyErrorMessage').addClass('hidden');
                });
        });
    };

    step.submit = function() {
        passbolt.setup.setActionState('submit', 'processing');

        var key = $('#js_setup_import_key_text').val();

        $('#KeyErrorMessage').addClass('hidden');
        return step.importPrivateKey(key)
            .then(step.extractPublicKey)
            .then(function() {
                console.log('key imported succesfully');
            })
            .fail(function(error) {
                $('#KeyErrorMessage').removeClass('hidden').html('The key selected has an invalid format.');
                console.log(error);
                passbolt.setup.setActionState('submit', 'enabled');
            });
    };

    step.cancel = function() {
        passbolt.setup.setActionState('cancel', 'processing');
        var def = $.Deferred();
        def.resolve();
        return def;
    };

    passbolt.setup.steps[step.id] = step;

})( passbolt );
