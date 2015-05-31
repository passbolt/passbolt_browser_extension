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
    'viewData': {}
  };

  step.init = function() {
    step.viewData.firstName = passbolt.setup.data.firstName || null;
    step.viewData.lastName = passbolt.setup.data.lastName || null;
    step.viewData.domain = passbolt.setup.data.domain || null;
    step.viewData.username = passbolt.setup.data.username || null;
  };

  step.start = function() {
    passbolt.setup.setActionState('submit', 'enabled');

    // Bind the go to import an existing key button.
    $('#js_setup_goto_import_key').click(function(ev) {
      ev.preventDefault();
      passbolt.setup.switchToStep('import_key');
    });
  };

  step.submit = function() {
    // Save value in data.
		// @todo validate data
		// @todo same new name / update on server
    passbolt.setup.data.keyInfo = {};
    passbolt.setup.data.keyInfo.name = $("#OwnerName").val();
    passbolt.setup.data.keyInfo.email = passbolt.setup.data.username;
    passbolt.setup.data.keyInfo.comment = $("#KeyComment").val();
    passbolt.setup.data.keyInfo.lgth = $("#KeyLength").val();
    // Process submit.
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
