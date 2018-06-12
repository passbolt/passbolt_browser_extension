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
var progressDialogController = require('../controller/progressDialogController');
var User = require('../model/user').User;
var Tag = require('../model/tag').Tag;

/**
 * Controller for Import passwords.
 * @param tabid
 * @constructor
 */
var ImportPasswordsController = function(tabid) {
  this.tabid = tabid;
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
    appWorker = Worker.get('App', this.tabid),
    user = User.getInstance(),
    self= this;

  this.resources = resources;
  this.progressObjective = this.resources.length * 2;

  progressDialogController.open(appWorker, 'Encrypting ...', this.progressObjective);

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
 * Save associated tags after a resource is saved.
 * @param resource
 * @param tags
 * @param categoriesAsTags
 * @private
 */
ImportPasswordsController.prototype._saveAssociatedTags = function(resource, tags, categoriesAsTags) {
  var tag = new Tag();

  if (categoriesAsTags === true) {
    tags = tags.concat(resource.tags);
  }
  tag.add(resource.id, tags).then(
    function(res) {
      // Do nothing.
    },
    function(e) {
      console.error('Could not save tag for resource ' + resource.id);
    }
  );
};

/**
 * Save a list of resources on the server.
 * @param resources list of resources to save.
 * @param options
 *  * bool categoriesAsTags
 * @return Promise
 */
ImportPasswordsController.prototype.saveResources = function(resources, options) {
  var appWorker = Worker.get('App', this.tabid),
    savePromises = [],
    tagsIntegration = options.tagsIntegration !== undefined && options.tagsIntegration === true;

  var counter = 1;
  for (let i in resources) {
      var p = Resource.import(resources[i]);
      savePromises.push(p);
      p.then(resource => {
        if (tagsIntegration === true) {
          var tags = [];
          if (options.importTag !== undefined) {
            tags.push(options.importTag);
          }
          resource.tags = resources[i].tags;
          this._saveAssociatedTags(resource, tags, options.categoriesAsTags);
        }
        progressDialogController.update(appWorker, this.progressStatus++, 'Importing... ' + (counter++) + '/' + this.resources.length);
      });
  }

  return new Promise(function(resolve, reject) {
    Promise.all(savePromises)
    .then(function(values) {
      progressDialogController.close(appWorker);
      resolve(values);
    })
    .catch(function(e) {
      reject(e);
    });
  });
};

/**
 * Encrypt a list of secrets for a given user id.
 * @param userId
 * @returns {promise}
 * @private
 */
ImportPasswordsController.prototype._encryptSecrets = function(userId) {
  var self = this,
    crypto = new Crypto(),
    appWorker = Worker.get('App', this.tabid);

  // Format resources for the format expected by encryptAll.
  self.resources = ImportPasswordsController._prepareResources(this.resources, userId);

  // Encrypt all the messages.
  return crypto.encryptAll(
    this.resources,
    // On complete.
    function () {
      progressDialogController.update(appWorker, self.progressStatus++);
    },
    // On start.
    function (position) {
      progressDialogController.update(appWorker, self.progressStatus, 'Encrypting ' + (parseInt(position) + 1) + '/' + self.resources.length);
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