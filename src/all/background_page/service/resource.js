/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SARL (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         2.7.0
 */
const __ = require('../sdk/l10n').get;
const {PassboltApiFetchError} = require('../error/passboltApiFetchError');
const {PassboltBadResponseError} = require('../error/passboltBadResponseError');
const {PassboltServiceUnavailableError} = require('../error/passboltServiceUnavailableError');
const {Request} = require('../model/request');
const {User} = require('../model/user');

class ResourceService { }

/**
 * Find all the resources with given resources ids
 *
 * @param {array} resourcesIds The list of resources to find
 * @returns {array} The list of resources
 * @throws PassboltServiceUnavailableError on connection issue
 * @throws PassboltBadResponseError on response format issue
 * @throws PassboltApiFetchError on application error
 */
ResourceService.findAllByResourcesIds = async function (resourcesIds, options) {
  // Retrieve by batch to avoid any 414 response.
  const batchSize = 80;
  let resources = [];
  const totalBatches = Math.ceil(resourcesIds.length / batchSize);
  for (let i = 0; i < totalBatches; i++) {
    const resourcesIdsPart = resourcesIds.splice(0, batchSize);
    const optionsPart = Object.assign({ filter: { hasId: resourcesIdsPart } }, options);
    const resourcesPart = await ResourceService.findAll(optionsPart);
    resources = [...resources, ...resourcesPart];
  }

  return resources;
};

/**
 * Find a resource by id
 *
 * @param {string} resourceId uuid
 * @param {Object} options Optional parameters
 * {
 *   contain: {
 *     secret: bool
 *   }
 * }
 * @param {Object} options Optional parameters
 * @returns {Object} The requested resource
 * @throws PassboltServiceUnavailableError on connection issue
 * @throws PassboltBadResponseError on response format issue
 * @throws PassboltApiFetchError on application error
 */
ResourceService.findOne = async function (resourceId, options) {
  options = options || {};
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
  const url = new URL(`${domain}/resources/${resourceId}.json?api-version=2`);
  if (options.contain && options.contain.secret) {
    url.searchParams.append('contain[secret]', '1');
  }
  let response, responseJson;

  try {
    response = await fetch(url, fetchOptions);
  } catch (error) {
    // Catch Network error such as connection lost.
    throw new PassboltApiFetchError(error.message);
  }

  try {
    responseJson = await response.json();
  } catch (error) {
    // If the response cannot be parsed, it's not a Passbolt API response. It can be a nginx error (504).
    throw new PassboltApiFetchError(response.statusText, { code: response.status });
  }

  if (!response.ok) {
    const message = responseJson.header.message;
    throw new PassboltApiFetchError(message, {
      code: response.status,
      body: responseJson.body
    });
  }

  return responseJson.body;
};

/**
 * Find all the resources
 *
 * @param {Object} options Optional parameters
 * {
 *   contain: {
 *     permission: bool,
 *     tag: bool,
 *     favorite: bool,
 *     secret: bool
 *   },
 *   filter: {
 *     hasId: [string, ...],          // resources uuids
 *     is-shared-with-group: string,  // group uuid
 *     has-tag: string,               // tag slug
 *     is-owned-by-me: bool,
 *     is-favorite: bool,
 *     is-shared-with-me: bool
 *   },
 *   order: {
 *     modifiedDesc: bool
 *   }
 * }
 * @returns {array} The list of resources
 * @throws PassboltServiceUnavailableError on connection issue
 * @throws PassboltBadResponseError on response format issue
 * @throws PassboltApiFetchError on application error
 */
ResourceService.findAll = async function (options) {
  options = options || {};
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
  const url = new URL(`${domain}/resources.json?api-version=2`);
  if (options.contain && options.contain.permission) {
    url.searchParams.append('contain[permission]', '1');
  }
  if (options.contain && options.contain.favorite) {
    url.searchParams.append('contain[favorite]', '1');
  }
  if (options.contain && options.contain.secret) {
    url.searchParams.append('contain[secret]', '1');
  }
  if (options.contain && options.contain.tags) {
    url.searchParams.append('contain[tag]', '1');
  }
  if (options.filter && options.filter.hasId) {
    options.filter.hasId.forEach(resourceId => {
      url.searchParams.append(`filter[has-id][]`, resourceId);
    });
  }
  if (options.filter && options.filter.isSharedWithGroup) {
    url.searchParams.append("filter[is-shared-with-group]", options.filter.isSharedWithGroup);
  }
  if (options.filter && options.filter.hasTag) {
    url.searchParams.append("filter[has-tag]", options.filter.hasTag);
  }
  if (options.filter && options.filter.isFavorite) {
    url.searchParams.append("filter[is-favorite]", true);
  }
  if (options.filter && options.filter.isOwnedByMe) {
    url.searchParams.append("filter[is-owned-by-me]", true);
  }
  if (options.filter && options.filter.isSharedWithMe) {
    url.searchParams.append("filter[is-shared-with-me]", true);
  }
  if (options.order && options.order.modifiedDesc) {
    url.searchParams.append("order[]", "Resource.modified DESC");
  }
  let response, responseJson;

  try {
    response = await fetch(url, fetchOptions);
  } catch (error) {
    // Catch Network error such as connection lost.
    throw new PassboltApiFetchError(error.message);
  }

  try {
    responseJson = await response.json();
  } catch (error) {
    // If the response cannot be parsed, it's not a Passbolt API response. It can be a nginx error (504).
    throw new PassboltApiFetchError(response.statusText, { code: response.status });
  }

  if (!response.ok) {
    const message = responseJson.header.message;
    throw new PassboltApiFetchError(message, {
      code: response.status,
      body: responseJson.body
    });
  }

  return responseJson.body;
};

/**
 * Save/Create a new resource
 *
 * @param {Object} data The resource data
 * @return {Object} response body, the new resource if successful or validation errors
 * @throws PassboltServiceUnavailableError on connection issue
 * @throws PassboltBadResponseError on response format issue
 * @throws PassboltApiFetchError on application error
 */
ResourceService.save = async function (data) {
  data = data || {};
  const user = User.getInstance();
  const domain = user.settings.getDomain();
  const fetchOptions = {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(data),
    headers: {
      'Accept': 'application/json',
      'content-type': 'application/json'
    }
  };
  await Request.setCsrfHeader(fetchOptions, user);
  const url = `${domain}/resources.json?api-version=v2`;
  let response, responseJson;

  try {
    response = await fetch(url, fetchOptions);
  } catch (error) {
    // Catch Network error such as connection lost.
    throw new PassboltServiceUnavailableError(error.message);
  }

  try {
    responseJson = await response.json();
  } catch (error) {
    // If the response cannot be parsed, it's not a Passbolt API response. It can be a nginx error (504).
    throw new PassboltBadResponseError(response.statusText, { code: response.status });
  }

  if (!response.ok) {
    const message = responseJson.header.message;
    throw new PassboltApiFetchError(message, {
      code: response.status,
      body: responseJson.body
    });
  }

  return responseJson.body;
};

/**
 * Update a resource
 *
 * @param {Object} data The resource data
 * @return {Object} response body, the updated resource if successful or validation errors
 * @throws PassboltServiceUnavailableError on connection issue
 * @throws PassboltBadResponseError on response format issue
 * @throws PassboltApiFetchError on application error
 */
ResourceService.update = async function (data) {
  data = data || {};
  const user = User.getInstance();
  const domain = user.settings.getDomain();
  const fetchOptions = {
    method: 'PUT',
    credentials: 'include',
    body: JSON.stringify(data),
    headers: {
      'Accept': 'application/json',
      'content-type': 'application/json'
    }
  };
  await Request.setCsrfHeader(fetchOptions, user);
  const url = `${domain}/resources/${data.id}.json?api-version=v2`;
  let response, responseJson;

  try {
    response = await fetch(url, fetchOptions);
  } catch (error) {
    // Catch Network error such as connection lost.
    throw new PassboltServiceUnavailableError(error.message);
  }

  try {
    responseJson = await response.json();
  } catch (error) {
    // If the response cannot be parsed, it's not a Passbolt API response. It can be a nginx error (504).
    throw new PassboltBadResponseError(response.statusText, { code: response.status });
  }

  if (!response.ok) {
    const message = responseJson.header.message;
    throw new PassboltApiFetchError(message, {
      code: response.status,
      body: responseJson.body
    });
  }

  return responseJson.body;
};

/**
 * Delete a resource.
 *
 * @param {string} resourceId The resource uuid
 * @return {Object} response body (null if successful)
 * @throws PassboltServiceUnavailableError on connection issue
 * @throws PassboltBadResponseError on response format issue
 * @throws PassboltApiFetchError on application error
 */
ResourceService.delete = async function (resourceId) {
  const user = User.getInstance();
  const domain = user.settings.getDomain();
  const fetchOptions = {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
      'content-type': 'application/json'
    }
  };
  await Request.setCsrfHeader(fetchOptions, user);
  const url = `${domain}/resources/${resourceId}.json?api-version=v2`;
  let response, responseJson;

  try {
    response = await fetch(url, fetchOptions);
  } catch (error) {
    // Catch Network error such as connection lost.
    throw new PassboltServiceUnavailableError(error.message);
  }

  try {
    responseJson = await response.json();
  } catch (error) {
    // If the response cannot be parsed, it's not a Passbolt API response. It can be a nginx error (504).
    throw new PassboltBadResponseError(response.statusText, { code: response.status });
  }

  if (!response.ok) {
    const message = responseJson.header.message;
    throw new PassboltApiFetchError(message, {
      code: response.status,
      body: responseJson.body
    });
  }

  return responseJson.body;
};

/**
 * Find all the resources for a share
 *
 * @param resourcesIds
 * @returns {Promise<[]|*>}
 */
// TODO Reuse findAll
ResourceService.findAllForShare = async function(resourcesIds) {
  // Retrieve by batch to avoid any 414 response.
  const batchSize = 80;
  if (resourcesIds.length > batchSize) {
    let resources = [];
    const totalBatches = Math.ceil(resourcesIds.length / batchSize);
    for (let i = 0; i < totalBatches; i++) {
      const resouresIdsPart = resourcesIds.splice(0, batchSize);
      const resourcesPart = await Resource.findShareResources(resouresIdsPart);
      resources = [...resources, ...resourcesPart];
    }

    return resources;
  }

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
  let url = new URL(`${domain}/resources.json?api-version=2`);
  resourcesIds.forEach(resourceId => {
    url.searchParams.append(`filter[has-id][]`, resourceId);
  });
  url.searchParams.append('contain[permission]', '1');
  url.searchParams.append('contain[permissions.user.profile]', '1');
  url.searchParams.append('contain[permissions.group]', '1');
  url.searchParams.append('contain[secret]', '1');
  let response, responseJson;

  try {
    response = await fetch(url, fetchOptions);
  } catch (error) {
    // Catch Network error such as connection lost.
    throw new PassboltServiceUnavailableError(error.message);
  }

  try {
    responseJson = await response.json();
  } catch (error) {
    // If the response cannot be parsed, it's not a Passbolt API response. It can be a nginx error (504).
    throw new PassboltBadResponseError(response.statusText, { code: response.status });
  }

  if (!response.ok) {
    const message = responseJson.header.message;
    throw new PassboltApiFetchError(message, {
      code: response.status,
      body: responseJson.body
    });
  }

  return responseJson.body;
};

exports.ResourceService = ResourceService;
