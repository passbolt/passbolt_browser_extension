(function() {
  // Collect the domain and redirect the user to the second step.
  var domain = '',
    location = window.location.href;

  // If this script is loaded, that means the current page is targeting the first step of
  // the wizard installer. The step which is provided by the backend of passbolt.
  domain = location.substr(0, location.indexOf(self.options.config.setupBootstrapUrl));

  // Notify the add-on that the user perform a plugin check operation, either by clicking
  // on the retry button after he installed the plugin, or loading the server setup bootstrap
  // with the plugin already installed.
  // What will redirect him to the second step of the wizard.
  self.port.emit('passbolt.setup.plugin_check', domain);
})();
