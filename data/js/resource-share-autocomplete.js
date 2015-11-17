// When the page has been initialized.
$(document).bind('template-ready', function() {

	// Autocomplete item template.
	var itemTpl = null,
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
			setState('loading');

			// Search users.
			passbolt.request('passbolt.share.search_users', 'resource', resourceId,  keywords, excludedUsers)
				.then(function(users) {
					setState('loaded');
					load(users);
				});
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
	 * Load a list of users.
	 * @param users
	 */
	var load = function(users) {
		// Store the retrieved users.
		currentUsers = {};
		// Empty the list.
		$('ul').empty();
		// Load the users in the list.
		for (var i in users) {
			currentUsers[users[i].User.id] = users[i];
			var html = new EJS({text: itemTpl}).render({user: users[i]});
			$('ul').append(html);
		}
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
				break;
			case 'loaded':
				$('body').removeClass('loading').addClass('loaded');
				passbolt.messageOn('App', 'passbolt.html_helper.remove_class', '#passbolt-iframe-password-share-autocomplete', 'loading');
				passbolt.messageOn('App', 'passbolt.html_helper.add_class', '#passbolt-iframe-password-share-autocomplete', 'loaded');
				break;
			case 'hidden':
				$('body').removeClass('loading loaded').addClass('hidden');
				passbolt.messageOn('App', 'passbolt.html_helper.remove_class', '#passbolt-iframe-password-share-autocomplete', 'loaded');
				passbolt.messageOn('App', 'passbolt.html_helper.remove_class', '#passbolt-iframe-password-share-autocomplete', 'loading');
				passbolt.messageOn('App', 'passbolt.html_helper.add_class', '#passbolt-iframe-password-share-autocomplete', 'hidden');
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
	};

	// Init the component.
	init();
});

// Init the page with a template.
initPageTpl();
