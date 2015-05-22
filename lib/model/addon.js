var Config = require("model/config");

/**
 * Check if the plugin is configured
 * The app is configured if Domain, Token and Userkeys are set
 * @return bool
 */
var isConfigured = function() {
	if (
		(typeof Config.read('securityTokenColor') == 'undefined') ||
		(typeof Config.read('securityTokenTextColor') == 'undefined') ||
		(typeof Config.read('securityTokenCode') == 'undefined') ||
		(typeof Config.read('baseUrl') == 'undefined') //||
		// @TODO check the keys also
		//(typeof Config.read('key') === undefined)
	) {
		return false;
	} else {
		return true;
	}
};
exports.isConfigured = isConfigured;
