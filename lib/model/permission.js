/**
 * Permission model.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

var Config = require("./config");
var Settings = require("./settings").Settings;

const { defer } = require('sdk/core/promise');
var __ = require("sdk/l10n").get;

var Validator = require('../vendors/validator');
var fetch = require('../vendors/window').fetch;

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
		var deferred = defer(),
				_response = {},
				url = null;

		// Check if there is a trusted domain.
		try {
				url = this.settings.getDomain() + '/share/search-users/' + model + '/' + instanceId + '.json';
				url += '?keywords=' + keywords + '&excludedUsers=' + encodeURIComponent(JSON.stringify(excludedUsers));
		} catch(e) {
				return deferred.reject(__('The application domain is not set'));
		}

		// Retrieve the users from the server.
		fetch(
				url, {
				method: 'GET',
				credentials: 'include',
				headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json'
				}
		})
		.then(function(response) {
				_response = response;
				return response.json();
		})
		.then(function(json) {
				// Check response status
				if(!_response.ok) {
						var msg = __('Could not get the users. The server responded with an error.');
						if(json.headers.msg != undefined) {
								msg += ' ' + json.headers.msg;
						}
						msg += ' (' + _response.status + ')';
						return deferred.reject(new Error(msg));
				}
				return deferred.resolve(json.body);
		})
		.catch(function(error) {
				return deferred.reject(error);
		});

		return deferred.promise;
};

// Exports the Permission object.
exports.Permission = Permission;
