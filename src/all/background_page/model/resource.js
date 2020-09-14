/**
 * Resource model.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const __ = require('../sdk/l10n').get;
const Request = require('./request').Request;
const User = require('./user').User;
const {ResourceLocalStorage} = require('../service/local_storage/resourceLocalStorage');
const {ResourceEntity} = require('./entity/resource/resourceEntity');

/**
 * The class that deals with resources.
 */
const Resource = function () {
  this.name = "";
  this.uri = "";
  this.username = "";
  this.secretClear = "";
  this.description = "";
  this.folderParentPath = "";
  this.secrets = [
    // Here a list of secrets.
  ];

  // Name to use if the name provided is empty. (validation rules don't permit an empty name).
  this._defaultName = '(no name)';
};

/**
 * Build a Resource object from a kdbxEntry object.
 * @param {KdbxEntry} kdbxEntry
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
 * @param {Array} csvEntry
 * @param {Array} mapping mapping rules
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
 * @param {Array} resource
 * @param {Array} mapping mapping rules
 * @returns object CSV entry
 */
Resource.prototype.toCsvEntry = function (resource, mapping) {
  const csvEntry = {};
  for (let fieldName in mapping) {
    csvEntry[mapping[fieldName]] = resource[fieldName];
  }
  return csvEntry;
};

/**
 * Import a resource on the server.
 * Import is different than save here because we will use a different passbolt pro entry point.
 *
 * @param resource
 * @TODO user resourceAdd from model
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
            .then(async function (json) {
              if (response.ok) {
                const updatedResourceEntity = new ResourceEntity(json.body);
                await ResourceLocalStorage.addResource(updatedResourceEntity);
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

exports.Resource = Resource;
