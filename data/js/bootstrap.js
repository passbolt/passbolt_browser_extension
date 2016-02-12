/**
 * Bootstrap.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

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

	// check if it is a passbolt app instance on the login page
	if($('html.passbolt .login.page').length) {
		passbolt.request('passbolt.bootstrap.login')
			.then(
			function success(refresh) {
				if (refresh) {
					location.reload();
				}
			}
		);
	}

	// check if it is a passbolt app instance on the debug page
	if($('html.passbolt .debug.page').length) {
		passbolt.request('passbolt.bootstrap.debug');
	}

})(jQuery);
