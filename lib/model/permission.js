/**
 * Permission model.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

const { defer } = require('sdk/core/promise');
var Validator = require('../vendors/validator');
var Config = require("./config");
var Request = require("sdk/request").Request;
var Settings = require("./settings").Settings;
var __ = require("sdk/l10n").get;

/**
 * The class that deals with permissions.
 */
var Permission = function() {

	// see model/settings
	this.settings = new Settings();
};

/**
 * Search users that can be granted for a given permissonable instance.
 * @param model
 * @param instanceId
 * @param keywords
 * @param excludedUsers
 * @returns {deferred.promise}
 */
Permission.prototype.searchUsers = function(model, instanceId, keywords, excludedUsers) {
	var self = this,
		deferred = defer(),
		url = null;

	// Check if there is a trusted domain.
	try {
		url = self.settings.getDomain() + '/share/search-users/' + model + '/' + instanceId + '.json?keywords=' + keywords + '&excludedUsers=' + encodeURIComponent(JSON.stringify(excludedUsers));
	} catch(e) {
		deferred.reject(__('The application domain is not set'));
	}

	// Retrieve the users from the server.
	Request({
		url: url,
		onComplete: function (raw) {
			if(raw.status === 200) {
				var response = JSON.parse(raw.text);
				if (response.header.status == 'success') {
					deferred.resolve(response.body);
				} else {
					deferred.reject(response);
				}
			} else {
				deferred.reject();
			}
		}
	}).get();

	return deferred.promise;
};

// Exports the Permission object.
exports.Permission = Permission;
