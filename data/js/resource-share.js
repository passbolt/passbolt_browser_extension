// When the page has been initialized.
$(document).bind('template-ready', function () {
	// The list of users the secret will be encrypted for.
	var encryptSecretFor = [],
	// The current search timeout reference.
		currentSearchTimeout = null;

	// DOM Elements.
	var $autocomplete = $('#js_perm_create_form_aro_auto_cplt'),
		$securityToken = $('.security-token');

	// Listen when the user deletes a permission.
	// The user shouldn't be listed anymore by the autocomplete list if the permission is not a temporary permission.
	passbolt.message('passbolt.share.remove_permission')
		.subscribe(function(userId, isTemporaryPermission) {
			// If the permission was a temporary permission, the user can be included in the autocomplete results.
			if (isTemporaryPermission) {
				passbolt.messageOn('ShareAutocomplete', 'passbolt.share.include_user', userId);
			}
			// Otherwise exclude the user from the autocomplete results.
			else {
				passbolt.messageOn('ShareAutocomplete', 'passbolt.share.exclude_user', userId);
			}
		});

	// Listen when the user wants to save its permissions changes.
	// Encrypt the secret for the new users.
	passbolt.message('passbolt.share.encrypt')
		.subscribe(function (tokenShareEncrypt, usersIds) {

			// Update the list of users the secret should be encrypted for regarding the list of users
			// given by the application.
			//
			// The application information cannot be trusted and should be used only to check if a temporary
			// permission has been removed. The secret shouldn't be encrypted for the temporary permissions
			// that have been removed.
			for (var i in encryptSecretFor) {
				if (usersIds.indexOf(encryptSecretFor[i]) == -1) {
					encryptSecretFor.splice(i, 1);
				}
			}

			// If there is new user to share the secret with.
			if (encryptSecretFor.length) {

				// Decrypt the secret which has to be encrypted for new users.
				passbolt.request('passbolt.secret.decrypt', passbolt.context.armored)
					.then(function (secret) {

						// Open the progression dialog.
						passbolt.requestOn('App', 'passbolt.progress_dialog.init', 'Encrypting ...', encryptSecretFor.length)
							.then(function (tokenProgress) {

								// Request the encryption of the secret for the selected users.
								passbolt.request('passbolt.secret.encrypt', secret, encryptSecretFor)
									.progress(function (armored, userId, completedGoals) {

										// Update the progress dialog.
										passbolt.messageOn('Progress', 'passbolt.progress_dialog.progress', tokenProgress, 'Encrypted for ' + userId, completedGoals);
									})
									.then(function (armoreds) {

										// Clean list of users the secret has to be encrypted for.
										encryptSecretFor = [];
										// Close the progress dialog.
										passbolt.messageOn('App', 'passbolt.progress_dialog.close');
										// Resolve the "passbolt.share.encrypt" request promise and return the armoreds secrets.
										passbolt.message('passbolt.share.encrypt.complete')
											.publish(tokenShareEncrypt, 'SUCCESS', armoreds);
									});
							});
					});
			} else {

				passbolt.message('passbolt.share.encrypt.complete')
					.publish(tokenShareEncrypt, 'SUCCESS', {});
			}
		});

	// A user has been selected in the autocomplete results component.
	passbolt.message('passbolt.share.user_selected')
		.subscribe(function (user) {
			// Add the permission to the list of changes to apply.
			addTemporaryPermission(user);
			// Empty the autocomplete input field.
			$autocomplete.val('');
			// Exclude the user from the autocomplete results.
			passbolt.messageOn('ShareAutocomplete', 'passbolt.share.exclude_user', user.User.id);
		});

	/**
	 * Add a temporary permission to the list of permission.
	 * @param user The user the permission will be added for
	 */
	var addTemporaryPermission = function (user) {
		// Add the user to the list of users to encrypt the secret for.
		encryptSecretFor.push(user.User.id);

		// Add the temporary permission to the app permissions list component.
		var permission = {
			is_new: true,
			aco: 'Resource',
			aco_foreign_key: passbolt.context['resourceId'],
			aro: 'User',
			aro_foreign_key: user.User.id,
			type: 1,
			User: user
		};
		passbolt.messageOn('App', 'passbolt.share.add_permission', permission);
	};

	/**
	 * Initialize the form.
	 */
	var initForm = function () {
		$autocomplete.bind('input', function (ev) {
			var keywords = $(this).val();
			// If a search has been already scheduled, delete it.
			if (currentSearchTimeout != null) {
				clearTimeout(currentSearchTimeout);
			}
			// Postpone the search to avoid a request on each very closed input.
			currentSearchTimeout = setTimeout(function() {
				// Search user.
				passbolt.messageOn('App', 'passbolt.share.input_changed', passbolt.context.resourceId, keywords);
			}, 300);
		});
	};

	/**
	 * Initialize the share component.
	 */
	var init = function () {
		// Get config regarding security token, and display it.
		passbolt.request('passbolt.user.settings.get.securityToken')
			.then(
			function success(securityToken) {
				$securityToken.text(securityToken.code);
				securityToken.id = '#js_perm_create_form_aro_auto_cplt';
				getTpl('./tpl/secret/securitytoken-style.ejs', function (tpl) {
					var html = new EJS({text: tpl}).render(securityToken);
					$('head').append(html);
				});
			},
			function fail(error) {
				throw error;
			}
		);

		// Initialize the form.
		initForm();

		// Resize the iframe container regarding the iframe content.
		passbolt.helper.html.resizeIframe('#passbolt-iframe-password-share', {
			width: '100%'
		});
	};

	init();
});

// Init the page with a template.
initPageTpl();
