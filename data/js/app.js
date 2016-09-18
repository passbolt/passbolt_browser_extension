/**
 * Main App.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

/* ==================================================================================
 *  Add-on Code Events Listeners
 * ================================================================================== */

// Add a css class to an html element
passbolt.message.on('passbolt.passbolt-page.add-class', function (selector, cssClass) {
  $(selector).addClass(cssClass);
});

// Remove a css class to an html element
passbolt.message.on('passbolt.passbolt-page.remove-class', function (selector, cssClass) {
  $(selector).removeClass(cssClass);
});

// Ask the passbolt page to release its focus
passbolt.message.on('passbolt.passbolt-page.remove_all_focuses', function () {
  passbolt.event.triggerToPage('remove_all_focuses');
});

// A permission has been added through the share iframe.
passbolt.message.on('passbolt.share.add-permission', function (permission) {
  passbolt.event.triggerToPage('resource_share_add_permission', permission);
});

/* ==================================================================================
 *  JS Application Events Listeners
 * ================================================================================== */

// Intercept the application window resize.
// Notify all workers regarding the application window resize.
window.addEventListener('passbolt.html_helper.window_resized', function (event) {
  var cssClasses = $('body').attr('class').split(' ');
  passbolt.message.emit('passbolt.html_helper.app_window_resized', cssClasses);
});

// Intercept the request passbolt.secret.decrypt
// Decrypt the secret, and stores it into the clipboard.
window.addEventListener('passbolt.secret.decrypt', function (event) {
  var armoredSecret = event.detail;
  // Decrypt the armored secret.
  passbolt.request('passbolt.secret.decrypt', armoredSecret)
    .then(function (secret) {
      // Copy the secret into the clipboard.
      passbolt.clipboard.copy(secret);
      // Notify the user.
      passbolt.event.triggerToPage('passbolt_notify', {
        status: 'success',
        title: 'plugin_secret_copy_success'
      });
    });
});

// Intercept the request passbolt.clipboard
// Copy data into the clipboard.
window.addEventListener('passbolt.clipboard', function (event) {
  var toCopy = event.detail.data;
  var name = event.detail.name;
  // Copy the secret into the clipboard.
  passbolt.clipboard.copy(toCopy);
  // Notify the user.
  passbolt.event.triggerToPage('passbolt_notify', {
    status: 'success',
    title: 'plugin_clipboard_copy_success',
    data: event.detail
  });
});

// When the user wants to save the changes on his resource, the application
// requests the plugin to encrypt the secret for all the users the resource
// is shared with.
window.addEventListener('passbolt.plugin.secret-edit.encrypt', function (event) {
  var usersIds = event.detail;
  passbolt.request('passbolt.secret-edit.encrypt', usersIds)
    .then(function (armoreds) {
      passbolt.event.triggerToPage('passbolt.plugin.secret-edit.encrypted', armoreds);
    });
});

// The validation can have been ordered by another worker.
// Such as the secret that request a validation.
// In this case the application should display the right feedback to the user.
passbolt.message.on('passbolt.secret-edit.validate-success', function () {
  $('.js_form_element_wrapper.js_form_secret_wrapper').removeClass('error');
});
passbolt.message.on('passbolt.secret-edit.validate-error', function () {
  $('.js_form_element_wrapper.js_form_secret_wrapper').addClass('error');
});

// Before encrypting the edited secret, ensure the secret is valid.
window.addEventListener('passbolt.plugin.secret-edit.validate', function (event) {
  passbolt.request('passbolt.secret-edit.validate')
    .then(function () {
      passbolt.event.triggerToPage('passbolt.plugin.secret-edit.validated', [true]);
    }, function () {
      passbolt.event.triggerToPage('passbolt.plugin.secret-edit.validated', [false]);
    });
});

// Intercept the request passbolt.secret.focus
// And transfer the event to the appropriate component.
window.addEventListener('passbolt.secret.focus', function (event) {
  // Transfer the event to Secret listener.
  passbolt.requestOn('Secret', 'passbolt.secret.focus')
    .then(function () {
      // Nothing.
    });
});

// When the user wants to share a password with other people.
// secret for the users the resource is shared with.
// Dispatch this event to the share iframe which will take care of the encryption.
window.addEventListener('passbolt.share.encrypt', function () {
  // Request the share dialog to encrypt the secret for the new users.
  passbolt.request('passbolt.share.encrypt').then(function (armoreds) {
    // Notify the App with the encrypted secret.
    passbolt.event.triggerToPage('resource_share_encrypted', armoreds);
  });
});

// When a permission is deleted, the user shouldn't be listed anymore by the autocomplete list.
window.addEventListener('passbolt.share.remove_permission', function (event) {
  var data = event.detail,
  // The user the permission has been deleted for.
    userId = data.userId;

  // Notify the share dialog about this change
  passbolt.message.emit('passbolt.share.remove-permission', userId);
});

// Listen when the user requests a backup of his private key.
window.addEventListener("passbolt.settings.download_private_key", function () {
  passbolt.request('passbolt.keyring.private.get').then(function (key) {
    passbolt.request('passbolt.keyring.key.backup', key.key, 'passbolt_private.asc').then(function () {
      // The key has been saved.
    });
  });
});

// Listen when the user requests a backup of his public key.
window.addEventListener("passbolt.settings.download_public_key", function () {
  passbolt.request('passbolt.keyring.private.get').then(function (key) {
    passbolt.request('passbolt.keyring.public.extract', key.key).then(function (publicKeyArmored) {
      passbolt.request('passbolt.keyring.key.backup', publicKeyArmored, 'passbolt_public.asc').then(function () {
        // The key has been saved.
      });
    })
  });
});
