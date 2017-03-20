/**
 * Group model.
 *
 * @copyright (c) 2017-present Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

var Config = require("./config");
var Settings = require("./settings").Settings;

var fetch = require('../vendors/window').fetch;

const { defer } = require('sdk/core/promise');

var __ = require("sdk/l10n").get;

/**
 * The class that deals with groups.
 */
var Group = function () {
    // see model/settings
    this.settings = new Settings();
};

/**
 * Save a group.
 *
 * @param group
 * @returns {*}
 */
Group.prototype.save = function(group) {
    var deferred = defer();

    // Build Json query string.
    var groupParamStr = JSON.stringify(group);

    fetch(
        this.settings.getDomain() + '/groups.json', {
            method: 'POST',
            credentials: 'include',
            body: groupParamStr,
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
            // Check response status.

            // Response is an error. We return the error.
            if(!_response.ok) {
                json.header.status_code = _response.status;
                return deferred.reject(json);
            }

            // Response is ok.
            var group = json.body;
            return deferred.resolve(group);
        })
        .catch(function (error) {
            return deferred.reject(error);
        });

    return deferred.promise;
};

// Exports the Group object.
exports.Group = Group;