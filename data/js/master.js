// When the page has been initialized.
$(document).bind('template-ready', function() {

  $('#master-password-submit').on('click', function() {
    var masterPassword = $('#js_master_password').val();
    self.port.emit("passbolt.keyring.master.request.submit", passbolt.context.token, masterPassword);
  });

  $('#close').on('click', function() {
    passbolt.messageOn('App', 'passbolt.dialog.close_latest');
  });

});

// Init the page with a template.
initPageTpl();
