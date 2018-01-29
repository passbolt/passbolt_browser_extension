/**
 * Resource model.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var __ = require('../sdk/l10n').get;
var User = require('./user').User;

/**
 * The class that deals with resources.
 */
var Resource = function () {
  this.name = null;
  this.url = null;
  this.username = null;
  this.secretClear = null;
  this.description = null;
};

/**
 * Build a Resource object from a kdbxEntry object.
 * @param KdbxEntry kdbxEntry
 * @returns {Resource}
 */
Resource.prototype.fromKdbxEntry = function(kdbxEntry) {
  this.name = kdbxEntry.fields.Title;
  this.url = kdbxEntry.fields.URL;
  this.username = kdbxEntry.fields.UserName;
  if (typeof kdbxEntry.fields.Password == 'object') {
    this.secretClear = kdbxEntry.fields.Password.getText();
  }
  this.description = kdbxEntry.fields.Notes;

  return this;
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
  var user = new User(),
    domain = user.settings.getDomain(),
    body = {Permissions: permissions};

  return new Promise(function(resolve, reject) {
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
              resolve(json.body);
            });
        },
        function error() {
          reject(new Error(__('There was a problem when trying to get simulate the new permissions')));
        }
      );
  });
};

// Exports the Resource object.
exports.Resource = Resource;
