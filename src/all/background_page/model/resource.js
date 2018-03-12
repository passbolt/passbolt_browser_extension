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
Resource.prototype.fromKdbxEntry = function(kdbxEntry) {
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
Resource.prototype.fromCsvEntry = function(csvEntry, mapping) {
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
Resource.prototype.toCsvEntry = function(resource, mapping) {
  var csvEntry = {};
  for (var fieldName in mapping) {
    csvEntry[mapping[fieldName]] = resource[fieldName];
  }
  return csvEntry;
}

/**
 * Import a resource on the server.
 * Import is different than save here because we will use a different passbolt pro entry point.
 * @param resource
 */

Resource.import = function(resource) {
  var user = new User(),
    domain = user.settings.getDomain(),
    body = resource;

  body = {
    "Resource" : resource,
    "Secret" : resource.secrets
  };

  return new Promise(function(resolve, reject) {
    fetch(
      domain + '/import/resources.json?api-version=2', {
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
        reject(new Error(__('There was a problem while trying to save the resource')));
      }
    );
  });
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
