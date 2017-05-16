/**
 * Resource model.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var __ = require('sdk/l10n').get;
const defer = require('sdk/core/promise').defer;
var fetch = require('../vendors/window').fetch;

var User = require('./user').User;

/**
 * The class that deals with resources.
 */
var Resource = function () {
};

/**
 * Simulate share permissions update.
 *
 * It is helpful to :
 *  - Ensure that the changes won't compromise the data integrity;
 *  - Get the lists of added and removed users (Used for later encryption).
 *
 * @param resourceId
 * @param permissions
 * @returns {*}
 */
Resource.simulateShare = function (resourceId, permissions) {
  var deferred = defer(),
    user = new User(),
    domain = user.settings.getDomain(),
    body = {Permissions: permissions};

  fetch(
    domain + '/share/simulate/resource/' + resourceId + '.json', {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify(body),
      headers: {
        'Accept': 'application/json',
        'content-type': 'application/json'
      }
    })
    .then(
      function success(response) {
        response.json()
          .then(function (json) {
            deferred.resolve(json.body);
          });
      },
      function error() {
        deferred.reject(new Error(
          __('There was a problem trying to get the ')));
      }
    );

  return deferred.promise;
};

// Exports the Resource object.
exports.Resource = Resource;
