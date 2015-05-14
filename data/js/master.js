// When the page has been initialized.
$(document).bind('template-ready', function() {

  // Wrong master password.
  passbolt.message('passbolt.keyring.master.request.complete')
    .subscribe(function(token, status, attempts) {
      if (status == 'ERROR') {
        if (attempts < 3) {
          $('label[for="js_master_password"]').html('Please enter a valid master password.')
            .addClass('error');
        } else {
          getTpl('./tpl/keyring/master-password-failure.ejs', function(tpl) {
            // Render the page template.
            var html = new EJS({text: tpl}).render();
            $('.js_dialog_content').html(html);
          });
        }
      }
    });

  // Get config regarding security token, and display it.
  passbolt.request('passbolt.config.readAll', ['securityTokenColor', 'securityTokenTextColor', 'securityTokenCode'])
    .then(function(config) {
      // Load color styles.
      var styles = "#js_master_password:focus," +
        "#js_master_password + .security-token {" +
        "background: " + config.securityTokenColor + ";" +
        "color:" + config.securityTokenTextColor + ";" +
        "}" +
        "#js_master_password:focus + .security-token {" +
        "background:" + config.securityTokenTextColor + ";" +
        "color:" + config.securityTokenColor + ";" +
        "}";
      $('head').append('<style>' + styles + '</style>');
      $('.security-token').text(config.securityTokenCode);
    });

  // The user clicks on OK.
  $('#master-password-submit').on('click', function() {
    var masterPassword = $('#js_master_password').val();
    self.port.emit("passbolt.keyring.master.request.submit", passbolt.context.token, masterPassword);
  });

  // The user wants to close the dialog.
  $('body').on('click', '.js-dialog-close', function(ev) {
    ev.preventDefault();
    passbolt.messageOn('App', 'passbolt.keyring.master.request.close');
  });

});

// Init the page with a template.
initPageTpl();
