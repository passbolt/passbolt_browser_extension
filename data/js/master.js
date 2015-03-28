// When the page has been initialized.
$(document).bind('template-ready', function() {

// Wrong master password.
  passbolt.message('passbolt.keyring.master.request.complete')
    .subscribe(function(token, status) {
      if (status == 'ERROR') {
        $('label[for="js_master_password"]').html('Please enter a valid master password.')
          .addClass('error');
      }
    });

  // The user clicks on OK.
  $('#master-password-submit').on('click', function() {
    var masterPassword = $('#js_master_password').val();
    self.port.emit("passbolt.keyring.master.request.submit", passbolt.context.token, masterPassword);
  });

  // The user wants to close the dialog.
  $('.js-dialog-close').on('click', function(ev) {
    ev.preventDefault();
    passbolt.messageOn('App', 'passbolt.keyring.master.request.close');
  });

});

// Init the page with a template.
initPageTpl();
