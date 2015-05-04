/**
 * Passbolt setup step.
 */
var passbolt = passbolt || {};
passbolt.setup = passbolt.setup || {};
passbolt.setup.steps = passbolt.setup.steps || {};

(function (passbolt) {

  var step = {
    'id': 'key_info',
    'label': '3. Review key info',
    'title': 'Let\'s make sure you imported the right key',
    'parents': ['import_key'],
    'next': 'security_token',
    'viewData': {},
    'keyinfo': {},
    'status': ''
  };

  step.init = function() {
    passbolt.request('passbolt.keyring.privateKeyInfo')
      .then(function(keyInfo) {
        var fieldsDetails = {},
          status = 'success';

        // Name different from the one defined by the administrator.
        if (passbolt.setup.data.firstName + ' ' + passbolt.setup.data.lastName != keyInfo.userIds[0].name) {
          fieldsDetails['name'] = {
            status: 'warning',
            rule: 'match',
            original: passbolt.setup.data.firstName + ' ' + passbolt.setup.data.lastName
          };
          if (status != 'error' || status != 'warning') status = 'warning';
        }

        // Email different from the one defined by the administrator.
        if (passbolt.setup.data.username != keyInfo.userIds[0].email) {
          fieldsDetails['email'] = {
            status: 'warning',
            rule: 'match',
            original: passbolt.setup.data.username
          };
          if (status != 'error' || status != 'warning') status = 'warning';
        }

        // Key expired.
        // @todo key expired in key info page

        // Pass the key info to the view.
        step.keyInfo = keyInfo;
        step.viewData.keyInfo = keyInfo;

        // Pass the fields details to the view.
        step.viewData.fieldsDetails = fieldsDetails;

        // Pass the status to the view.
        step.status = status;
        step.viewData.status = status;
      });
  };

  step.start = function() {
    if (step.status == 'error') {
      passbolt.setup.setActionState('submit', 'disabled');
    }
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
