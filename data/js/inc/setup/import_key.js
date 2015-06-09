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
    $('#js_setup_import_key_browse').click(function(){
      passbolt.file.prompt()
        .then(function(data) {
          passbolt.setup.data.key = data;
          $('#js_setup_import_key_text').val(data).change();
          $('#KeyErrorMessage').addClass("hidden");
        });
    });
  };

  step.submit = function() {
    passbolt.setup.setActionState('submit', 'processing');

    var def = $.Deferred(),
      key = $('#js_setup_import_key_text').val();

    passbolt.keyring.importPrivate(key)
      .then(function() {
        $('#KeyErrorMessage').addClass("hidden");
        passbolt.setup.data.key = key;
        // Extract public key.
        passbolt.request('passbolt.keyring.extractPublicKey', key)
          .then(function(publicKeyArmored) {
            passbolt.setup.data.publicKey = publicKeyArmored;
          });
        def.resolve();
      })
      .fail(function(error) {
        $('#KeyErrorMessage').removeClass("hidden").html('The key selected has an invalid format.');
        console.log(error);
        passbolt.setup.setActionState('submit', 'enabled');
        def.fail();
      });
    return def;
  };

  step.cancel = function() {
    passbolt.setup.setActionState('cancel', 'processing');
    var def = $.Deferred();
    def.resolve();
    return def;
  };

  passbolt.setup.steps[step.id] = step;

})( passbolt );
