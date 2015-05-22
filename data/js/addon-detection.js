var passbolt = passbolt || {};

(function($) {

	// check if the plugin is configured
	passbolt.request('passbolt.addon.isConfigured')
		.then(function (response) {
			if (response !== true) {
				$('html')
					.addClass('no-passboltplugin-config')
					.removeClass('passboltplugin-config');
			} else {
				$('html')
					.addClass('passboltplugin-config')
					.removeClass('no-passboltplugin-config');
			}
		});

	// Add classes relative to plugin.
	$('html')
		.removeClass('no-passboltplugin')
		.addClass('passboltplugin');

})(jQuery);
