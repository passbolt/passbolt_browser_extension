/**
 * Passbolt setup step.
 */
var passbolt = passbolt || {};
passbolt.setup = passbolt.setup || {};
passbolt.setup.steps = passbolt.setup.steps || {};

(function (passbolt) {

  var step = {
    'id': 'password',
    'title' : 'Alright sparky, it\'s time to log in!',
    'label': '5. Login !',
    'parents': ['security_token'],
    'viewData': {}
  };

  step.init = function() {

  };

  step.start = function() {
    // Disable submit button at the beginning.
    passbolt.setup.setActionState('submit', 'processing');
      step.submit();
  };

  step.goToLogin = function() {
      console.log('enter goToLogin');
      var loginUrl = passbolt.setup.data.domain + "/auth/login";
      setTimeout(
          function() {
              console.log('actually redirect');
              window.location.href = loginUrl;
          },
          1000);
  };

  // Submit step.
  step.submit = function() {
    var def = $.Deferred();

      // TODO : change that, and remove password from entry point.
    passbolt.setup.data.password = 'password';
    passbolt.request('passbolt.setup.save', passbolt.setup.data)
        .then(function() {
            console.log('call goto login');
            // Autologin.
            step.goToLogin();
        })
        .fail(function(error) {
            console.log('error while saving information', error);
            alert("could not save information");
        });

    return def;
  };

  // Cancel step.
  step.cancel = function() {
    passbolt.setup.setActionState('cancel', 'processing');
    var def = $.Deferred();
    def.resolve();
    return def;
  };

  passbolt.setup.steps[step.id] = step;

})( passbolt );
