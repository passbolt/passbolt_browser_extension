/**
 * Import passwords controller.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var Worker = require('../model/worker');
var fileController = require('../controller/fileController');
var KeepassDb = require('../model/keepassDb').KeepassDb;
var CsvDb = require('../model/csvDb').CsvDb;
var Keyring = require('../model/keyring').Keyring;
var Resource = require('../model/resource').Resource;
var Crypto = require('../model/crypto').Crypto;
var progressController = require('./progress/progressController');
var User = require('../model/user').User;
var Tag = require('../model/tag').Tag;

/**
 * Controller for Import passwords.
 * @param {Worker} worker
 * @constructor
 */
var ImportPasswordsController = function(worker) {
  this.worker = worker;
  this.progressObjective = 0;
  this.progressStatus = 0;
  this.resources = [];
  this.fileType = null;
};

/**
 * Initialize passwords controller from a kdbx file.
 * @param string b64FileContent kdbx file content in base 64
 * @param object credentials
 *   password: the password if any
 *   keyFile: the keyFile content in base 64
 * @returns {*}
 */
ImportPasswordsController.prototype.initFromKdbx = function(b64FileContent, credentials) {
  // Convert base 64 files into Blob.
  var kdbxFile = fileController.b64ToBlob(b64FileContent);
  if (credentials.keyFile !== null && credentials.keyFile !== undefined) {
    credentials.keyFile = fileController.b64ToBlob(credentials.keyFile);
  }

  var keepassDb = new KeepassDb();
  return keepassDb.loadDb(kdbxFile, credentials.password, credentials.keyFile)
  .then(function(db) {
    return keepassDb.toResources(db);
  });
};

/**
 * Initialize controller from a csv file.
 * @param string b64FileContent csv file content in base 64
 * @param object options
 * @returns {*}
 */
ImportPasswordsController.prototype.initFromCsv = function(b64FileContent, options) {
  var csvFile = fileController.b64ToBlob(b64FileContent);
  var csvDb = new CsvDb();
  return csvDb.loadDb(csvFile)
  .then(function(db) {
    return csvDb.toResources(db);
  });
};

/**
 * Encrypt a resource clear password into an armored message.
 * @param resources
 * @returns {*}
 */
ImportPasswordsController.prototype.encryptSecrets = function(resources) {
  var keyring = new Keyring(),
    user = User.getInstance(),
    self= this;

  this.resources = resources;
  this.progressObjective = this.resources.length * 2;

  progressController.start(this.worker, 'Encrypting ...', this.progressObjective);

  var currentUser = user.get(),
    userId = currentUser.id;

  // Sync the keyring with the server.
  return keyring.sync()
  // Once the keyring is synced, encrypt the secret for each resource
  .then(function () {
    return self._encryptSecrets(userId);
  })
  .then(function(armoredSecrets) {
    return self._addArmoredSecretsToResources(armoredSecrets);
  });
};

/**
 * Get unique import tag.
 * It's the tag that will be associated to the resources imported.
 * looks like import-filetype-yyyymmddhhiiss
 * @param fileType
 * @return {string}
 */
ImportPasswordsController._getUniqueImportTag = function(fileType) {
  // Today's date in format yyyymmddhhiiss
  const today = new Date();
  var importDate = today.getFullYear().toString() +
    ("0" + (today.getMonth() + 1)).slice(-2).toString() +
    (("0" + today.getDate()).slice(-2)).toString() +
    today.getHours().toString() +
    today.getMinutes().toString() +
    today.getSeconds().toString();

  var importTag = 'import-' + fileType + '-' + importDate;
  return importTag;
};

/**
 * Import the tags associated to an imported resource
 * @param string resourceId the resource identifier
 * @param array categories the resource categories that will be converted in tags
 * @param object options
 *  * bool categoriesAsTags
 * @private
 */
ImportPasswordsController.prototype._importResourceTags = function(resourceId, categories, options) {
  const tagsIntegration = options.tagsIntegration || false;
  const categoriesAsTags = options.categoriesAsTags || null;
  const importTag = options.importTag || null;
  if (!tagsIntegration) {
    return;
  }

  let tags = [];
  if (importTag) {
    tags.push(importTag);
  }
  if (categoriesAsTags === true && categories != '') {
    tags = tags.concat(categories);
  }

  return Tag.add(resourceId, tags);
};

/**
 * Import a batch of resources.
 * @param array resources batch of resources to save.
 * @param int batchNumber batch number
 * @param int batchSize maximum number of resources a batch can contain
 * @param int totalResources total number of resources to import
 * @param object options
 *  * bool categoriesAsTags
 * @return Promise
 */
ImportPasswordsController.prototype._importBatchResources = async function(resources, batchNumber, batchSize, totalResources, options) {
  let counter = batchNumber * batchSize + 1;
  let importResults = [];
  const promises = [];

  for (var i in resources) {
    const resource = resources[i];
    const promise = Resource.import(resource)
      .then(importedResource => {
        importResults.push(importedResource);
        return this._importResourceTags(importedResource.id, resource.tags, options);
      }, error => {
        importResults.push(error);
      })
      .then(() => progressController.update(this.worker, this.progressStatus++, `Importing...  ${counter++}/${totalResources}`));
    promises.push(promise);
  }

  await Promise.all(promises);
  return importResults;
};

/**
 * Import a list of resources.
 * @param array resources list of resources to save.
 * @param object options
 *  * bool categoriesAsTags
 * @return Promise
 */
ImportPasswordsController.prototype.saveResources = async function(resources, options) {
  options = options || {};

  // Split the resources in batches of equal size.
  const batchSize = 5;
  const chunks = resources.length / batchSize;
  const batches = [];
  for (var i = 0, j = 0; i < chunks; i++, j += batchSize) {
    batches.push(resources.slice(j, j + batchSize));
  }

  let batchNumber = 0;
  let importResults = [];
  // Import the batches sequentially
  for (var i in batches) {
    const importBatchResult = await this._importBatchResources(batches[i], batchNumber++, batchSize, resources.length, options);
    importResults = [...importResults, ...importBatchResult];
  }

  progressController.complete(this.worker);
  return importResults;
};

/**
 * Encrypt a list of secrets for a given user id.
 * @param userId
 * @returns {promise}
 * @private
 */
ImportPasswordsController.prototype._encryptSecrets = function(userId) {
  var self = this,
    crypto = new Crypto();

  // Format resources for the format expected by encryptAll.
  self.resources = ImportPasswordsController._prepareResources(this.resources, userId);

  // Encrypt all the messages.
  return crypto.encryptAll(
    this.resources,
    // On complete.
    function () {
      progressController.update(self.worker, self.progressStatus++);
    },
    // On start.
    function (position) {
      progressController.update(self.worker, self.progressStatus, 'Encrypting ' + (parseInt(position) + 1) + '/' + self.resources.length);
    });
};

/**
 * Add given armored secrets to the resources.
 * @param armoredSecrets
 * @private
 */
ImportPasswordsController.prototype._addArmoredSecretsToResources = function(armoredSecrets) {
  var self = this;
  return new Promise(function(resolve, reject) {
    if (armoredSecrets.length != self.resources.length) {
      reject('There was a problem while encrypting the secrets');
    }
    for (var i in armoredSecrets) {
      if (self.resources[i].message != '') {
        self.resources[i].secrets = [
          {
            data : armoredSecrets[i],
          }
        ];
      }
      // Remove data that were added by _prepareResources().
      delete self.resources[i].message;
      delete self.resources[i].userId;
    }
    resolve(self.resources);
  });
};

/**
 * Prepare resources for encryption. (Put them in the expected format).
 * @param resources
 * @param userId
 * @returns {*|Array}
 * @private
 */
ImportPasswordsController._prepareResources = function(resources, userId) {
  var resourcesToEncrypt = resources.map(function(resource) {
    resource.userId = userId;
    resource.message = resource.secretClear;
    delete resource.secretClear;
    return resource;
  });
  return resourcesToEncrypt;
};

exports.ImportPasswordsController = ImportPasswordsController;
