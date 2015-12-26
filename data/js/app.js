/* ==================================================================================
 *  Add-on Code Events Listeners
 * ================================================================================== */

// Close the latest opened dialog message.
passbolt.message('passbolt.keyring.master.request.close')
  .subscribe(function() {
    $('#passbolt-iframe-master-password').remove();
  });

// Intercept the request passbolt.keyring.master.request.
// Display a popup to request the user master password.
passbolt.message('passbolt.keyring.master.request')
  .subscribe(function(token) {
    // Inject the master password dialog into the web page DOM.
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

// Close the latest opened dialog message.
passbolt.message('passbolt.progress_dialog.close')
  .subscribe(function() {
    setTimeout(function() {
      $('#passbolt-iframe-progress-dialog').fadeOut(500, function() {
        $(this).remove();
      });
    }, 2000);
  });

// Intercept the request passbolt.progress_dialog.init.
// Display a dialog to notify the user about the current step.
passbolt.message('passbolt.progress_dialog.init')
  .subscribe(function(token, title, goals) {
    // Inject the progress dialog into the web page DOM.
    var $iframe = $('<iframe/>', {
      id: 'passbolt-iframe-progress-dialog',
      src: 'about:blank?passbolt=progressInline',
      frameBorder: 0
    });
    $iframe.appendTo('body')
      .addClass('passbolt-plugin-dialog');

    // When the iframe is ready pass it some variables.
    // @todo ATTENTION, is the lib which will intercept the events will be loaded at that point in the iframe ?
    $iframe.on('load', function() {
      passbolt.event.dispatchContext('Progress', 'title', title);
      passbolt.event.dispatchContext('Progress', 'goals', goals);
      // Notify the request, if there is one, that the dialog has been initialized.`
      passbolt.message('passbolt.progress_dialog.init.complete')
        .publish(token, 'SUCCESS', token);
    });
  });

// A permission has been added through the share iframe.
passbolt.message('passbolt.share.add_permission')
	.subscribe(function(permission) {
		passbolt.event.triggerToPage('resource_share_add_permission', permission);
	});

// The user is filling the share autocomplete input field.
passbolt.message('passbolt.share.input_changed')
	.subscribe(function(resourceId, keywords) {
		// Forward the event to the ShareAutocomplete Worker.
		passbolt.messageOn('ShareAutocomplete', 'passbolt.share.input_changed', resourceId, keywords);

		// Listen when a click occurred on an element of the Application DOM.
		// Hide the iframe in charge of displaying the autocomplete results.
		// @todo each time the user will change the autocomplete input, a handler will be bound to any window click.
		// @todo it's not critical, but a small refactoring will help.
		// @todo the whole function can be moved to another place.
		$(window).one('click', function() {
			$('#passbolt-iframe-password-share-autocomplete').addClass('hidden');
		});
	});

/* ==================================================================================
 *  JS Application Events Listeners
 * ================================================================================== */

// Intercept the application window resize.
// Notify all workers regarding the application window resize.
window.addEventListener('passbolt.html_helper.window_resized', function(event) {
	var cssClasses = $('body').attr('class').split(' ');
	passbolt.message('passbolt.html_helper.app_window_resized')
		.broadcast(cssClasses);
});

// Intercept the request passbolt.secret.decrypt
// Decrypt the secret, and stores it into the clipboard.
window.addEventListener('passbolt.secret.decrypt', function(event) {
  var armoredSecret = event.detail;
  // Decrypt the armored secret.
  passbolt.request('passbolt.secret.decrypt', armoredSecret)
    .then(function(secret) {
      // Copy the secret into the clipboard.
      passbolt.clipboard.copy(secret);
      // Notify the user.
      passbolt.event.triggerToPage('passbolt_notify', {
        'status': 'success',
        'title': 'plugin_secret_copy_success'
      });
    });
});

// Intercept the request passbolt.clipboard
// Copy data into the clipboard.
window.addEventListener('passbolt.clipboard', function(event) {
  var toCopy = event.detail.data;
  var name = event.detail.name;
  // Copy the secret into the clipboard.
  passbolt.clipboard.copy(toCopy);
  // Notify the user.
  passbolt.event.triggerToPage('passbolt_notify', {
    'status': 'success',
    'title': 'plugin_clipboard_copy_success',
      'data': event.detail
  });
});

// When the user wants to save the changes on his resource, he will ask the plugin to encrypt the
// secret for the users the resource is shared with.
// Dispatch this event to the secret edition iframe which will take care of the encryption.
window.addEventListener('passbolt.secret_edition.encrypt', function(event) {

  passbolt.requestOn('Secret', 'passbolt.secret_edition.is_updated')
    .then(function( updated ) {
      if ( ! updated ) {
        passbolt.event.triggerToPage('secret_edition_secret_encrypted', []);
        return;
      }

      var usersIds = event.detail;
      // Open the progression dialog.
      // @todo #consistency RequestOn, because request doesn't publish the request on the current worker, it has been made to
      // 			 call add-on code mainly, and tranformed to call function on other worker, and now on the current worker.
      passbolt.requestOn('App', 'passbolt.progress_dialog.init', 'Encrypting ...', usersIds.length)
        .then(function(token) {
          // Request the secret worker to encrypt the new secret.
          passbolt.requestOn('Secret', 'passbolt.secret_edition.encrypt', usersIds)
            .progress(function(armored, userId, completedGoals) {
              // Notify the progress dialog on progression.
              passbolt.messageOn('Progress', 'passbolt.progress_dialog.progress', token, 'Encrypted for ' + userId, completedGoals);
            })
            .then(function(armoreds, usersIds) {
              var armoreds = [armoreds];
              passbolt.event.triggerToPage('secret_edition_secret_encrypted', armoreds);
              // Close the progress dialog.
              passbolt.message('passbolt.progress_dialog.close')
                .publish(token);
            });
        });
    });
});

// When the user wants to share a password with other people.
// secret for the users the resource is shared with.
// Dispatch this event to the share iframe which will take care of the encryption.
window.addEventListener('passbolt.share.encrypt', function(event) {
	var data = event.detail,
		// The new users the secret should be encrypted for. Untrusted information.
		usersIds = data.usersIds;

	// Request the share dialog to encrypt the secret for the new users.
	passbolt.requestOn('Share', 'passbolt.share.encrypt', usersIds).then(function(armoreds) {
		// Notify the App with the encrypted secret.
		passbolt.event.triggerToPage('resource_share_encrypted', armoreds);
	});
});

// When a permission is deleted, the user shouldn't be listed anymore by the autocomplete list.
window.addEventListener('passbolt.share.remove_permission', function(event) {
	var data = event.detail,
		// The user the permission has been deleted for.
		userId = data.userId,
		// Is the permission temporary
		isTemporaryPermission = data.isTemporaryPermission;

	// Notify the share dialog about this change
	passbolt.messageOn('Share', 'passbolt.share.remove_permission', userId, isTemporaryPermission);
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

// Listen when the user requests a backup of his private key.
window.addEventListener("passbolt.settings.download_private_key", function() {
    passbolt.request('passbolt.keyring.private.get').then(function(key) {
        passbolt.request('passbolt.keyring.key.backup', key.key, 'passbolt_private.asc').then(function () {
                // The key has been saved.
            });
        });
});

// Listen when the user requests a backup of his public key.
window.addEventListener("passbolt.settings.download_public_key", function() {
    passbolt.request('passbolt.keyring.private.get').then(function(key) {
        passbolt.request('passbolt.keyring.public.extract', key.key).then(function(publicKeyArmored){
            passbolt.request('passbolt.keyring.key.backup', publicKeyArmored, 'passbolt_public.asc').then(function () {
                // The key has been saved.
            });
        })
    });
});

// Listen when the password share dialog is opened and inject the the plugin share
// dialog.
window.addEventListener("passbolt.plugin.resource_share", function(event) {
	var data = event.detail,
		$wrapper = $('.js_plugin_share_wrapper'),
		// The resource id to share.
		resourceId = data.resourceId,
		// The secret encrypted for the current user.
		armored = data.armored;

	// Add an Iframe to allow the user to share its password in a safe environment.
	var $iframeShare = $('<iframe/>', {
		id: 'passbolt-iframe-password-share',
		src: 'about:blank?passbolt=shareInline',
		frameBorder: 0,
		marginwidth: 0,
		marginheight: 0,
		hspace: 0,
		vspace: 0
	});
	$iframeShare.prependTo($wrapper);

	// When the iframe is ready pass it some variables.
	// @todo ATTENTION, is the lib which will intercept the events will be loaded at that point.
	// @todo Clean this code, make something generic.
	$iframeShare.on('load', function() {
		passbolt.event.dispatchContext('Share', 'resourceId', resourceId);
		passbolt.event.dispatchContext('Share', 'armored', armored);
	});

	// Add an iframe controlled by the plugin to display the results of the autocomplete research.
	var $iframeAutocomplete = $('<iframe/>', {
		id: 'passbolt-iframe-password-share-autocomplete',
		src: 'about:blank?passbolt=shareAutocompleteInline',
		class: 'hidden',
		frameBorder: 0,
		marginwidth: 0,
		marginheight: 0,
		hspace: 0,
		vspace: 0
	});
	$iframeAutocomplete.appendTo($('#passbolt-password-share-autocomplete-wrapper', $wrapper));
}, false);
