/**
 * Tag model.
 *
 * Provides utility functions to handle tags.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var __ = require('../sdk/l10n').get;
var User = require('./user').User;

/**
 * The class that deals with keys.
 */
var Tag = function () {

};

/**
 * Add a tag to a resource.
 * @param resourceId string uuid
 * @param tags array of tag strings
 */
Tag.prototype.add = function(resourceId, tags) {
  var user = User.getInstance(),
    domain = user.settings.getDomain();

  var body = {
    "Tags" : tags
  };

  return new Promise(function(resolve, reject) {
    fetch(
      domain + '/tags/' + resourceId + '.json?api-version=2', {
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
          if (json.header !== undefined && json.header.status !== undefined && json.header.status === 'error') {
            reject(new Error(__('The tag could not be created')));
          }
          else {
            resolve(json.body);
          }
        });
      },
      function error() {
        reject(new Error(__('There was a problem while trying to save the tag')));
      }
    );
  });
};

// Exports the Keyring object.
exports.Tag = Tag;

