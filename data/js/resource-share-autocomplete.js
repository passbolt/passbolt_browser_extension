// When the page has been initialized.
$(document).bind('template-ready', function() {

	// Autocomplete item template.
	var itemTpl = null,
	// Empty result template.
		emptyTpl = null,
	// The array of users retrieved from the back-end.
		currentUsers = {},
	// Users to exclude from the autocomplete search.
		excludedUsers = [];

	// Exclude user from the autocomplete results.
	passbolt.message('passbolt.share.exclude_user')
		.subscribe(function(userId) {
			excludedUsers.push(userId);
		});

	// Include user in the autocomplete results.
	passbolt.message('passbolt.share.include_user')
		.subscribe(function(userId) {
			var i = excludedUsers.indexOf(userId);
			if (i != -1) {
				excludedUsers.splice(i, 1);
			}
		});

	// The autocomplete input field has been populated.
	// Search for users that can be granted.
	passbolt.message('passbolt.share.input_changed')
		.subscribe(function(resourceId, keywords) {

			// If the component is already performing a search.
			if (stateIs('loading')) {
				setTimeout(function() {
					passbolt.message('passbolt.share.input_changed', resourceId, keywords);
				}, 500);
				return;
			}

			// Set the component in loading state.
			setState('loading');

			// Store the retrieved users.
			currentUsers = {};
			// Empty the list.
			$('ul').empty();

			// Search users.
			passbolt.request('passbolt.share.search_users', 'resource', resourceId,  keywords, excludedUsers)
				.then(function(users) {
					setState('loaded');
					load(users);
				});
		});

	// The application window has been resized.
	passbolt.message('passbolt.html_helper.app_window_resized')
		.subscribe(function(cssClasses) {
			resize(cssClasses);
		});

	// Listen when a user is selected in the list.
	$(document).on('click', 'li', function(ev) {
		ev.preventDefault();
		ev.stopPropagation();
		// Notify the share worker regarding the selected user.
		passbolt.messageOn('Share', 'passbolt.share.user_selected', currentUsers[this.id]);
		setState('hidden');
	});

	/**
	 * Check if the component is in the given state
	 * @param state The state to check
	 */
	var stateIs = function(state) {
		// @todo The DOM has state store ...
		return $('.autocomplete-content').hasClass(state);
	};

	/**
	 * Resize the iframe.
	 */
	var resize = function(cssClasses) {
		// If the resolution is too low, the iframe should not be scrollable.
		if (cssClasses.indexOf('fourfour') == -1) {
			// Resize the iframe container regarding the iframe content.
			passbolt.helper.html.resizeIframe('#passbolt-iframe-password-share-autocomplete', {
				width: '100%'
			});
		}
		// In desktop.
		else {
			// If there are less than 3 users to display, the iframe should fit the content.
			if (currentUsers.length < 3) {
				// Resize the iframe container regarding the iframe content.
				passbolt.helper.html.resizeIframe('#passbolt-iframe-password-share-autocomplete', {
					width: '100%'
				});
			}
			else {
				// Resize the iframe container, reset the height and use the default css.
				passbolt.helper.html.resizeIframe('#passbolt-iframe-password-share-autocomplete', {
					width: '100%',
					height: ''
				});
			}
		}
	};

	/**
	 * Load a list of users.
	 * @param users
	 */
	var load = function(users) {
		// Load the users in the list.
		for (var i in users) {
			currentUsers[users[i].User.id] = users[i];
			var html = new EJS({text: itemTpl}).render({user: users[i]});
			$('ul').append(html);
		}
		// If no user found.
		if (!users.length) {
			var html = new EJS({text: emptyTpl}).render();
			$('ul').append(html);
		}
		// Resize the autocomplete iframe.
		resize(['five']);
	};

	/**
	 * Change the state of the component.
	 * Mark the iframe with the state to allow other external components to work with.
	 * @param state
	 */
	var setState = function(state) {
		switch(state) {
			case 'loading':
				$('body').removeClass('hidden loaded').addClass('loading');
				passbolt.messageOn('App', 'passbolt.html_helper.remove_class', '#passbolt-iframe-password-share-autocomplete', 'hidden');
				passbolt.messageOn('App', 'passbolt.html_helper.remove_class', '#passbolt-iframe-password-share-autocomplete', 'loaded');
				passbolt.messageOn('App', 'passbolt.html_helper.add_class', '#passbolt-iframe-password-share-autocomplete', 'loading');
				$('.autocomplete-content').removeClass('loaded').addClass('loading');
				break;
			case 'loaded':
				$('body').removeClass('loading').addClass('loaded');
				passbolt.messageOn('App', 'passbolt.html_helper.remove_class', '#passbolt-iframe-password-share-autocomplete', 'loading');
				passbolt.messageOn('App', 'passbolt.html_helper.add_class', '#passbolt-iframe-password-share-autocomplete', 'loaded');
				$('.autocomplete-content').removeClass('loading').addClass('loaded');
				break;
			case 'hidden':
				$('body').removeClass('loading loaded').addClass('hidden');
				passbolt.messageOn('App', 'passbolt.html_helper.remove_class', '#passbolt-iframe-password-share-autocomplete', 'loaded');
				passbolt.messageOn('App', 'passbolt.html_helper.remove_class', '#passbolt-iframe-password-share-autocomplete', 'loading');
				passbolt.messageOn('App', 'passbolt.html_helper.add_class', '#passbolt-iframe-password-share-autocomplete', 'hidden');
				$('.autocomplete-content').removeClass('loading loaded');
				break;
		}
	};

	/**
	 * Initialize the autocomplete result component.
	 */
	var init = function() {
		// Retrieve the item template, and store it in local variable.
		getTpl('./tpl/resource/share-autocomplete-item.ejs', function (tpl) {
			itemTpl = tpl;
		});
		// Retrieve the empty template.
		getTpl('./tpl/resource/share-autocomplete-item_empty.ejs', function (tpl) {
			emptyTpl = tpl;
		});
	};

	// Init the component.
	init();
});

// Init the page with a template.
initPageTpl();
