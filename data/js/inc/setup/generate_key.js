/**
 * Passbolt setup step.
 */
var passbolt = passbolt || {};
passbolt.setup = passbolt.setup || {};
passbolt.setup.steps = passbolt.setup.steps || {};

(function (passbolt) {

  var step = {
    'id': 'generate_key',
    'label': '',
    'parents': ['secret'],
    'next': 'key_info',
    'subStep': true,
    'viewData': {}
  };

  step.init = function() {

  };

  step.start = function() {
    passbolt.setup.setActionState('submit', 'disabled');
    passbolt.request("passbolt.gpgkey.generate_key_pair", passbolt.setup.data.keyInfo)
      .then(function(key) {
        console.log("key generated with success");
        console.log(key);
        $('#keyGenerationStatus').html("Key has been generated");
        var privateKey = key.privateKeyArmored;
        passbolt.keyring.importPrivate(privateKey)
          .then(function() {
            passbolt.setup.data.key = privateKey;
            console.log("key has been imported");
            $('#keyGenerationStatus').html("Congratulations, key has been imported");
            passbolt.setup.setActionState('submit', 'enabled');
          })
          .fail(function(error) {
            alert('Something went wrong with the key import');
            console.log(error);
            passbolt.setup.setActionState('submit', 'enabled');
          });

      })
      .fail(function(error) {
        alert('Something went wrong with the key you want to import, see debug for now.');
        console.log(error);
      });
  };

  step.submit = function() {
    passbolt.setup.setActionState('submit', 'processing');
    var def = $.Deferred();
    def.resolve();
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
