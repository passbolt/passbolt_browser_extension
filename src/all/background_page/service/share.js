/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SARL (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SARL (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         2.4.0
 */
const User = require('../model/user').User;
const Request = require('../model/request').Request;

class ShareService {}

/**
 * Search aros to share resources with.
 * @param {string} keywords The keywords to search
 * @returns {array}
 * Return users or groups objects.
 */
ShareService.searchAros = async function (keywords) {
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
  let url = new URL(`${domain}/share/search-aros?api-version=2`);
  url.searchParams.append('filter[search]', keywords);
  let response, json;

  try {
    response = await fetch(url, fetchOptions);
    json = await response.json();
  } catch (error) {
    console.error(error);
    return new Error(__('There was a problem when trying to search the aros'));
  }

  return json.body;
};

/**
 * Search aros to share a resource with.
 * @param {string} keywords The keywords to search
 * @returns {array}
 * Return users or groups objects.
 * @deprecated since v2.4.0 will be removed in v3.0
 * replaced by the ShareService.searchAros
 */
ShareService.searchResourceAros = async function(resourceId, keywords) {
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
  let url = new URL(`${domain}/share/search-users/resource/` + resourceId + `?api-version=2`);
  url.searchParams.append('filter[search]', keywords);
  let response, json;

  try {
    response = await fetch(url, fetchOptions);
    json = await response.json();
  } catch (error) {
    console.error(error);
    return new Error(__('There was a problem when trying to search the aros'));
  }

  return json.body;
};

/**
 * Share a resource
 * @param {string} resourceId The resource id to share
 * @param {object} data The request body data
 * @returns {*}
 */
ShareService.share = async function(resourceId, data) {
  const user = User.getInstance();
  const domain = user.settings.getDomain();
  const fetchOptions = {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
      'content-type': 'application/json'
    },
    body: JSON.stringify(data)
  };
  Request.setCsrfHeader(fetchOptions);
  const url = new URL(`${domain}/share/resource/` + resourceId + `.json?api-version=v1`);
  let response, json;

  try {
    response = await fetch(url, fetchOptions);
    json = await response.json();
  } catch (error) {
    console.error(error);
    return new Error(__('There was a problem when trying to share'));
  }

  return json.body;
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
ShareService.simulateShare = async function (resourceId, permissions) {
  const user = User.getInstance();
  const domain = user.settings.getDomain();
  const url = new URL(`${domain}/share/simulate/resource/${resourceId}.json?api-version=2`);
  const body = {permissions: permissions};
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
  let response, json;

  try {
    response = await fetch(url, fetchOptions);
    json = await response.json();
  } catch (error) {
    console.error(error);
    return new Error(__('There was a problem when trying to simulate the share'));
  }

  return json.body;
};

exports.ShareService = ShareService;
