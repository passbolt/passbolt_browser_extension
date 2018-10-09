/**
 * Permission model.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

var User = require('./user').User;
var __ = require('../sdk/l10n').get;

/**
 * The class that deals with permissions.
 */
class Permission {}

/**
 * Find the permissions of a resource.
 * @param {string} resourceId
 * @returns {array}
 */
Permission.findResourcePermissions = async function(resourceId) {
  const user = User.getInstance();
  const domain = user.settings.getDomain();
  const fetchOptions = {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
      'content-type': 'application/json'
    }
  };
  let url = new URL(`${domain}/permissions/resource/` + resourceId + `.json?api-version=2`);
  url.searchParams.append('contain[user.profile]', '1');
  url.searchParams.append('contain[group]', '1');
  let response, json;

  try {
    response = await fetch(url, fetchOptions);
    json = await response.json();
  } catch (error) {
    console.error(error);
    return new Error(__('There was a problem when trying to retrieve the permissions of the resource'));
  }

  return json.body;
};

// Exports the Permission object.
exports.Permission = Permission;
