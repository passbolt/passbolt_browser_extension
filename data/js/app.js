// Close the latest opened dialog message.
passbolt.message('passbolt.keyring.master.request.close')
  .subscribe(function() {
    $('#passbolt-iframe-master-password').remove();
  });

// Intercept the request passbolt.keyring.master.request.
// Display a popup to request the user master password.
passbolt.message('passbolt.keyring.master.request')
  .subscribe(function(token) {
    // Ibject the master password dialog into the web page DOM.
    var $iframe = $('<iframe/>', {
      id: 'passbolt-iframe-master-password',
      src: 'about:blank?passbolt=masterInline',
      frameBorder: 0
    });
    $iframe.appendTo('body')
      .addClass('passbolt-plugin-dialog');

    // When the iframe is ready pass it some variables.
    // @todo ATTENTION, is the lib which will intercept the events will be loaded at that point in the iframe ?
    $iframe.on('load', function() {
      passbolt.event.dispatchContext('MasterPassword', 'token', token);
    });
  });

// Decrypt a password when the user is clicking on a pwd cell of the password browser component.
// Copy it in the clipboard.
$('body').on('click', '#js_wsp_pwd_browser .password',  function() {
  var armoredSecret = $('pre', this).html();
  // Decrypt the armored secret.
  passbolt.cipher.decrypt(armoredSecret)
    .then(function(secret) {
      // Copy the secret into the clipboard.
      passbolt.clipboard.copy(secret);
      // Notify the user.
      passbolt.event.triggerToPage('passbolt_notify', {
        'status': 'success',
        'title': 'The secret has been copied in your clipboard'
      });
    });
});

// When the user wants to save the changes on his resource, he will ask the plugin to encrypt the
// secret for the users the resource is shared with.
// Dispatch this event to the secret edition iframe which will take care of the encryption.
window.addEventListener('passbolt.secret_edition.encrypt', function(event) {
  var usersIds = event.detail;
  passbolt.requestOn('Secret', 'passbolt.secret_edition.encrypt', usersIds)
    .then(function(armoreds, usersIds) {
      var armoreds = [armoreds];
      passbolt.event.triggerToPage('secret_edition_secret_encrypted', armoreds);
    });
});

// Listen when a resource is edited and inject the passbolt secret field component.
window.addEventListener("passbolt.plugin.resource_edition", function() {
  var $wrapper = $('.js_form_secret_wrapper'),
    // @todo Should the plugin trust this variable ????!!!! No way ---> []
    armoredSecret = $('.js_secret_edit_form textarea', $wrapper).val();

  // Add an Iframe to allow the user to edit its secret in a safe environment.
  var $iframe = $('<iframe/>', {
    id: 'passbolt-iframe-secret-edition',
    src: 'about:blank?passbolt=decryptInline',
    frameBorder: 0
  });
  $iframe.appendTo($wrapper);

  // When the iframe is ready pass it some variables.
  // @todo ATTENTION, is the lib which will intercept the events will be loaded at that point.
  // @todo Clean this code, make something generic.
  $iframe.on('load', function() {
    passbolt.event.dispatchContext('Secret', 'armoredSecret', armoredSecret);
  });
}, false);
