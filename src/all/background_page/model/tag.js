/**
 * Tag model.
 *
 * Provides utility functions to handle tags.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const __ = require('../sdk/l10n').get;
const Request = require('./request').Request;
const TagService = require("../service/tag").TagService;
const User = require('./user').User;

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
Tag.add = function(resourceId, tags) {
  var user = User.getInstance(),
    domain = user.settings.getDomain();

  var body = {
    Tags: tags
  };

  const url = domain + '/tags/' + resourceId + '.json?api-version=2';
  const fetchOptions = {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(body),
    headers: {
      'Accept': 'application/json',
      'content-type': 'application/json'
    }
  };
  Request.setCsrfHeader(fetchOptions);

  return new Promise(function(resolve, reject) {
    fetch(url, fetchOptions)
    .then(
      function success(response) {
        response.json()
        .then(function (json) {
          resolve(json.body);
        });
      },
      function error() {
        reject(new Error(__('There was a problem while trying to save the tag')));
      }
    );
  });
};

/**
 * Find all tag
 * @param {object} options Options to apply to the find request
 * @return {Promise}
 */
Tag.findAll = async function(options) {
  return await TagService.findAll(options);
}

// Exports the Keyring object.
exports.Tag = Tag;

