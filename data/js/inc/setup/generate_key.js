/**
 * Passbolt setup step.
 */
var passbolt = passbolt || {};
passbolt.setup = passbolt.setup || {};
passbolt.setup.steps = passbolt.setup.steps || {};

(function (passbolt) {

  var step = {
    'id': 'generate_key',
    'title': 'Give us a second while we crunch them numbers!',
    'label': '',
    'parents': ['secret'],
    'next': 'backup_key',
    'subStep': true,
    'viewData': {}
  };

  step.init = function() {

  };

  step.start = function() {
    passbolt.setup.setActionState('submit', 'processing');
    setTimeout(function() {
        passbolt.request("passbolt.gpgkey.generate_key_pair", passbolt.setup.data.keyInfo)
          .then(function(key) {
            var privateKey = key.privateKeyArmored,
              publicKey = key.publicKeyArmored;

            passbolt.setup.data.publicKey = publicKey;
            passbolt.keyring.importPrivate(privateKey)
              .then(function() {
                passbolt.setup.data.key = privateKey;
                passbolt.setup.setActionState('submit', 'enabled');
                passbolt.setup.goForward('backup_key');
              })
              .fail(function(error) {
                alert('Something went wrong with the key import');
                console.log(error);
              });
          })
          .fail(function(error) {
            alert('Something went wrong with the key generation. See debug for now.');
            console.log(error);
          });
    },
    500);
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
    def.reject();
    return def;
  };

  passbolt.setup.steps[step.id] = step;

})( passbolt );
