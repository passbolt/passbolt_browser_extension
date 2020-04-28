/**
 * Resource model.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const __ = require('../sdk/l10n').get;
const Request = require('./request').Request;
const User = require('./user').User;
const {ResourceService} = require('../service/resource');
const {ResourceLocalStorage} = require('../service/local_storage/resourceLocalStorage');

/**
 * The class that deals with resources.
 */
const Resource = function () {
  this.name = "";
  this.uri = "";
  this.username = "";
  this.secretClear = "";
  this.description = "";
  this.secrets = [
    // Here a list of secrets.
  ];

  // Name to use if the name provided is empty. (validation rules don't permit an empty name).
  this._defaultName = '(no name)';
};

/**
 * Build a Resource object from a kdbxEntry object.
 * @param KdbxEntry kdbxEntry
 * @returns {Resource}
 */
Resource.prototype.fromKdbxEntry = function (kdbxEntry) {
  if (kdbxEntry.fields.Title === "") {
    this.name = this._defaultName;
  } else {
    this.name = kdbxEntry.fields.Title;
  }

  this.uri = kdbxEntry.fields.URL;
  this.username = kdbxEntry.fields.UserName;
  if (typeof kdbxEntry.fields.Password == 'object') {
    this.secretClear = kdbxEntry.fields.Password.getText();
  }
  this.description = kdbxEntry.fields.Notes;

  return this;
};


/**
 * Build a Resource object from a csv entry.
 * @param Array csvEntry
 * @param Array mapping mapping rules
 * @returns {Resource}
 */
Resource.prototype.fromCsvEntry = function (csvEntry, mapping) {
  for (var fieldName in mapping) {
    this[fieldName] = csvEntry[mapping[fieldName]];
  }
  if (this.name === "") {
    this.name = this._defaultName;
  }
  return this;
};

/**
 * Build a Csv entry object from a resource.
 * @param Array resource
 * @param Array mapping mapping rules
 * @returns object CSV entry
 */
Resource.prototype.toCsvEntry = function (resource, mapping) {
  var csvEntry = {};
  for (var fieldName in mapping) {
    csvEntry[mapping[fieldName]] = resource[fieldName];
  }
  return csvEntry;
};

/**
 * Import a resource on the server.
 * Import is different than save here because we will use a different passbolt pro entry point.
 *
 * @param resource
 */
Resource.import = function (resource) {
  const user = User.getInstance();
  const domain = user.settings.getDomain();
  const body = {
    Resource: resource,
    Secret: resource.secrets
  };
  const url = domain + '/import/resources.json?api-version=2';
  const fetchOptions = {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(body),
    headers: {
      'Accept': 'application/json',
      'content-type': 'application/json'
    }
  };
  Request.setCsrfHeader(fetchOptions, user);

  return new Promise(function (resolve, reject) {
    fetch(url, fetchOptions)
      .then(
        function success(response) {
          response.json()
            .then(function (json) {
              if (response.ok) {
                resolve(json.body);
              } else {
                reject(json);
              }
            });
        },
        function error() {
          reject(new Error(__('There was a problem while trying to connect to the API.')));
        }
      );
  });
};

/**
 * Find resource to share
 *
 * @deprecated since v2.4.0 will be removed in v3.0
 * replaced by the findAllForShare function.
 * @param resourceId
 */
Resource.findShareResource = async function (resourceId) {
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
  let url = new URL(`${domain}/resources/` + resourceId + `.json?api-version=2`);
  url.searchParams.append('contain[permission]', '1');
  url.searchParams.append('contain[permissions.user.profile]', '1');
  url.searchParams.append('contain[permissions.group]', '1');
  url.searchParams.append('contain[secret]', '1');
  let response, json;

  try {
    response = await fetch(url, fetchOptions);
    json = await response.json();
  } catch (error) {
    console.error(error);
    return new Error(__('There was a problem when trying to retrieve the resource'));
  }

  return json.body;
};

/**
 * Find resources to share
 *
 * @param {array} resourcesIds
 * @returns {array|Error}
 */
Resource.findAllForShare = async function (resourcesIds) {
  return await ResourceService.findAllForShare(resourcesIds);
};

/**
 * Update the resources local storage with the latest API resources the user has access.
 * @return {Promise}
 */
Resource.updateLocalStorage = async function () {
  const findOptions = {
    contain: {
      "permission": true,
      "favorite": true,
      "tags": true,
      "folder": true
    }
  };
  const resources = await ResourceService.findAll(findOptions);
  await ResourceLocalStorage.set(resources);
};

/**
 * Find all the resources
 *
 * @param {object} options Options to apply to the find request
 * @return {Promise}
 */
Resource.findAll = async function (options) {
  return ResourceService.findAll(options);
};

/**
 * Save a resource
 *
 * @param {object} data The resource data
 * @return {Promise}
 */
Resource.save = async function (data) {
  if (data.folderParentId) {
    data.folder_parent_id = data.folderParentId;
  }
  const resource = await ResourceService.save(data);
  await ResourceLocalStorage.addResource(resource);
  return resource;
};

/**
 * Save a resource
 *
 * @param {object} data The resource data
 * @return {Promise}
 */
Resource.update = async function (data) {
  if (data.folderParentId) {
    data.folder_parent_id = data.folderParentId;
  }
  const resource = await ResourceService.update(data);
  await ResourceLocalStorage.updateResource(resource);

  return resource;
};

/**
 * Delete all the resources
 *
 * @param {array} resourcesIds The resources ids to delete
 * @return {Promise}
 */
Resource.deleteAll = async function (resourcesIds) {
  const promise = resourcesIds.reduce((promise, resourceId) => {
    return promise.then(() => ResourceService.delete(resourceId));
  }, Promise.resolve([]));
  // Update local storage.
  promise.then(async () => {
    await ResourceLocalStorage.deleteResourcesById(resourcesIds);
  });

  return promise;
};

exports.Resource = Resource;
