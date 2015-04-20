(function() {
  // Collect the domain and redirect the user to the second step.
  var domain = '',
    location = window.location.href;

  // If this script is loaded, that means the current page is targeting the first step of
  // the wizard installer. The step which is provided by the backend of passbolt.
  domain = location.substr(0, location.indexOf(self.options.config.setupBootstrapUrl));

  // Redirect the user to the second page of the wizard.
  self.port.emit('passbolt.install.plugin_detected', domain);
})();
