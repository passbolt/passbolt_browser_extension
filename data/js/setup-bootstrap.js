(function($) {
  // If the expected username field is not provided, do not launch the setup.
  if (!$('#js_setup_user_username').length) {
    return;
  }

  // Collect the setup information and redirect the user to the second step.
  var data = {
    domain : '',
    userId : '',
    token : '',
    username : '',
    firstName : '',
    lastName : ''
  };

  // If this script is loaded, that means the current page is targeting the first step of
  // the wizard installer. The step which is provided by the backend of passbolt.
  // Retrieve all the information we need from the url.
  // @TODO move that up to addon code
  var regex = new RegExp(self.options.setupBootstrapRegex);
  var matches = regex.exec(window.location.href);

  if (matches != null) {
    data.domain = matches[1];
    data.userId = matches[2];
    data.token = matches[3];

    // Retrieve the user information given on the page.
    data.username = $('#js_setup_user_username').val();
    data.lastName = $('#js_setup_user_last_name').val();
    data.firstName = $('#js_setup_user_first_name').val();

    // Notify the add-on that the user perform a plugin check operation, either by clicking
    // on the retry button after he installed the plugin, or loading the server setup bootstrap
    // with the plugin already installed.
    // What will redirect him onto the second step of the wizard.
    console.log('setup-bootstrap.js');
    self.port.emit('passbolt.setup.plugin_check', data);

  }

})(jQuery);
