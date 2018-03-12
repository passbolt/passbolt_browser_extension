/**
 * Permission model.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

var Config = require('./config');
var UserSettings = require('./userSettings').UserSettings;
var __ = require('../sdk/l10n').get;

/**
 * The class that deals with permissions.
 */
var Permission = function () {
	// see model/settings
	this.settings = new UserSettings();
};

/**
 * Search users that could be granted to access a given resource.
 *
 * @param model {string} The type of instance
 * @param instanceId {string} The instance to search on
 * @param keywords {string} Filter the search on keywords
 * @param excludedUsers {array} Exclude some users from the search result
 * @returns {Promise}
 */
Permission.prototype.searchUsers = function(model, instanceId, keywords, excludedUsers) {
	var _this = this,
    _response = {},
    url = null;

	return new Promise (function (resolve, reject) {
    // Check if there is a trusted domain.
    try {
      url = _this.settings.getDomain() + '/share/search-users/' + model + '/' + instanceId + '.json';
      url += '?api-version=v1';
      url += '&keywords=' + keywords;
    } catch (e) {
      reject(__('The application domain is not set'));
      return;
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
      .then(function (response) {
        _response = response;
        return response.json();
      })
      .then(function (json) {
        // Check response status
        if (!_response.ok) {
          var msg = __('Could not get the users. The server responded with an error.');
          if (json.headers.msg != undefined) {
            msg += ' ' + json.headers.msg;
          }
          msg += ' (' + _response.status + ')';
          reject(new Error(msg));
        } else {
        	resolve(json.body);
        }
      })
      .catch(function (error) {
        reject(error);
      });
  });
};

// Exports the Permission object.
exports.Permission = Permission;
