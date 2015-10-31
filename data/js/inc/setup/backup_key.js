/**
 * Passbolt setup step.
 */
var passbolt = passbolt || {};
passbolt.setup = passbolt.setup || {};
passbolt.setup.steps = passbolt.setup.steps || {};

(function (passbolt) {

  var step = {
    'id': 'backup_key',
    'title': 'Success! Your secret key is ready.',
    'label': '',
    'parents': ['secret'],
    'next': 'security_token',
    'subStep': true,
    'viewData': {}
  };

  step.init = function() {};

  step.start = function() {
    $('#js_backup_key_download').on('click', function(ev) {
      passbolt.request('passbolt.keyring.private.backup', passbolt.setup.data.key)
        .then(function() {
          // The key has been saved.
        });
    });
  };

  step.submit = function() {
    passbolt.setup.setActionState('submit', 'processing');
    passbolt.setup.data.keyInfo.masterKey = $("#js_field_password").val();

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
