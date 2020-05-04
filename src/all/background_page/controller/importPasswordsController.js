/**
 * Import passwords controller.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const Worker = require('../model/worker');
const fileController = require('../controller/fileController');
const KeepassDb = require('../model/keepassDb').KeepassDb;
const CsvDb = require('../model/csvDb').CsvDb;
const Keyring = require('../model/keyring').Keyring;
const Resource = require('../model/resource').Resource;
const Crypto = require('../model/crypto').Crypto;
const progressController = require('./progress/progressController');
const User = require('../model/user').User;
const FolderModel = require('../model/folderModel').FolderModel;
const FolderEntity = require('../model/entity/folder/folderEntity').FolderEntity;

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
  this.uniqueImportTag = '';

  // Will contain the list of folders that have been created, organized by path.
  // example:
  // /root/category1 : { folder entity }
  this.folders = {};
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
  const kdbxFile = fileController.b64ToBlob(b64FileContent);
  if (credentials.keyFile !== null && credentials.keyFile !== undefined) {
    credentials.keyFile = fileController.b64ToBlob(credentials.keyFile);
  }

  const keepassDb = new KeepassDb();
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
  const csvFile = fileController.b64ToBlob(b64FileContent);
  const csvDb = new CsvDb();
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
ImportPasswordsController.prototype.encryptSecrets = async function(resources) {
  const keyring = new Keyring(),
    user = User.getInstance(),
    self= this;

  this.resources = resources;
  this.progressObjective = this.resources.length * 2;

  await progressController.start(this.worker, 'Encrypting ...', this.progressObjective);

  const currentUser = user.get(),
    userId = currentUser.id;

  // Sync the keyring with the server.
  await keyring.sync();
  const armoredSecrets = await self._encryptSecrets(userId);
  return self._addArmoredSecretsToResources(armoredSecrets);
};

/**
 * Get unique import tag (will be used as the parent folder name).
 * It's the tag / folder name that will be associated to the resources imported.
 * looks like import-filetype-yyyymmddhhiiss
 * @param fileType
 * @return {string}
 */
ImportPasswordsController._generateUniqueImportTag = function(fileType) {
  // Today's date in format yyyymmddhhiiss
  const today = new Date();
  const importDate = today.getFullYear().toString() +
    ("0" + (today.getMonth() + 1)).slice(-2).toString() +
    (("0" + today.getDate()).slice(-2)).toString() +
    today.getHours().toString() +
    today.getMinutes().toString() +
    today.getSeconds().toString();

  return 'import-' + fileType + '-' + importDate;
};

/**
 * Retrieve a folder from its path (during the import process).
 * Will return either a folder object, or undefined if the folder has not been created yet.
 * @param path
 * @return {*}
 */
ImportPasswordsController.prototype.getFolderFromPath = function(path) {
  if (this.folders[path]) {
   return this.folders[path];
  }

  return undefined;
};

/**
 * Extract the list of folders corresponding to a list of resources.
 * The main idea is to reconstruct the tree that we will need to recreate later.
 * @param resources
 * @param options
 * @return {any[]}
 * @private
 */
ImportPasswordsController._extractFoldersFromResources = function(resources, options) {
  const folders = Array(),
    // Top parent should have a unique name.
    importTag = options.importTag;

  // Extract folders list, and transform it if necessary (to include unique parent folder).
  resources.forEach(resource => {
    // If there is no folder mentioned, the importTag becomes the parent folder.
    if (!resource.tags[0]) {
      resource.tags[0] = "/" + importTag;
    }
    if (resource.tags[0].includes('/Root/')) {
      // If there is a root folder, we replace it with the unique tag name.
      resource.tags[0] = resource.tags[0].replace("/Root/", "/" + importTag + "/", );
    } else {
      // Else, we add the unique tag name at the beginning of
      resource.tags[0] = "/" + importTag + resource.tags[0];
    }

    let subPaths = resource.tags[0].replace(/^\//, '').split("/");
    let path = "";
    subPaths.forEach(subPath => {
      path += "/" + subPath;
      if (!folders.find(e => e === path)) {
        folders.push(path);
      }
    });
  });

  return folders;
};

/**
 * Import all folders for resource.
 * @param resources
 * @return Array
 * @private
 */
ImportPasswordsController.prototype._importFolders = async function(resources, options) {
  const folderModel = new FolderModel(await User.getInstance().getApiClientOptions());
  const importFoldersResults = {
    "created" : [],
    "errors" : []
  };

  // Extract folders list from resources.
  const folders = ImportPasswordsController._extractFoldersFromResources(resources, options);

  // Create folders.
  for(let i in folders) {
    const currentFolderPath = folders[i],
      currentFolderSplit = currentFolderPath.replace(/^\//, '').split('/'),
      currentFolderName = currentFolderSplit.pop(),
      currentFolderParent = currentFolderSplit.length ? "/" + currentFolderSplit.join("/") : "";

    try {
      let folderE = new FolderEntity({ "name": currentFolderName });
      if (currentFolderParent !== "") {
        const parentFolder = this.getFolderFromPath(currentFolderParent);
        if (!parentFolder) {
          return;
        }
        folderE.setFolderParentId(parentFolder.id);
      }

      this.folders[currentFolderPath] = await folderModel.create(folderE);
      importFoldersResults.created.push({
        "path": currentFolderPath,
        "folder": this.folders[currentFolderPath]
      });
    } catch(e) {
      importFoldersResults.errors.push({
        "path": currentFolderPath,
        "error": e.message
      });
    }
  }

  return importFoldersResults;

};

/**
 * Import a batch of resources.
 * @param array resources batch of resources to save.
 * @param int batchNumber batch number
 * @param int batchSize maximum number of resources a batch can contain
 * @param int totalResources total number of resources to import
 * @param object options
 *  * bool foldersIntegration
 *  * bool tagsIntegration
 *  * bool importFolders
 *  * bool importTags
 * @return Promise
 */
ImportPasswordsController.prototype._importBatchResources = async function(resources, batchNumber, batchSize, totalResources, options) {
  let counter = batchNumber * batchSize + 1;
  let importResults = {
    "created" : [],
    "errors" : []
  };
  const promises = [];

  for (let i in resources) {
    const resource = resources[i];

    // Manage parent folder if exists (has been created).
    let folderPath = resource.tags[0];
    let folderExist = this.getFolderFromPath(folderPath);
    if (folderExist) {
      resource["folder_parent_id"] = folderExist.id;
    }

    const promise = Resource.import(resource)
      .then(importedResource => {
        importResults.created.push({"resource": importedResource});
        progressController.update(this.worker, this.progressStatus++, `Importing...  ${counter++}/${totalResources}`)
      }, error => {
        importResults.errors.push({
          "error": error.header.message,
          "resource": resource,
        });
      });
    promises.push(promise);
  }

  await Promise.all(promises);

  return importResults;
};

/**
 * Import a list of resources.
 * @param array resources list of resources to save.
 * @param object options
 *  * bool foldersIntegration
 *  * bool tagsIntegration
 *  * bool importFolders
 *  * bool importTags
 * @return Promise
 */
ImportPasswordsController.prototype.saveResources = async function(resources, options) {
  options = options || {};
  let importFoldersResults = {};
  let importResourcesResults = {
    "created": [],
    "errors": []
  };

  const importResults = {
    "resources": importResourcesResults,
  };

  if (options.importFolders !== undefined && options.importFolders === true) {
    // Import folders first.
    importFoldersResults = await this._importFolders(resources, options);
    importResults.folders = importFoldersResults;
  }

  // Split the resources in batches of equal size.
  const batchSize = 5;
  const chunks = resources.length / batchSize;
  const batches = [];
  for (let i = 0, j = 0; i < chunks; i++, j += batchSize) {
    batches.push(resources.slice(j, j + batchSize));
  }

  let batchNumber = 0;
  // Import the batches sequentially
  for (let i in batches) {
    const importBatchResult = await this._importBatchResources(batches[i], batchNumber++, batchSize, resources.length, options);
    importResourcesResults.created = [...importResourcesResults.created, ...importBatchResult.created];
    importResourcesResults.errors = [...importResourcesResults.errors, ...importBatchResult.errors];
  }

  await progressController.complete(this.worker);

  return importResults;
};

/**
 * Encrypt a list of secrets for a given user id.
 * @param userId
 * @returns {promise}
 * @private
 */
ImportPasswordsController.prototype._encryptSecrets = function(userId) {
  const self = this,
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
  const self = this;
  return new Promise(function(resolve, reject) {
    if (armoredSecrets.length !== self.resources.length) {
      reject('There was a problem while encrypting the secrets');
    }
    for (let i in armoredSecrets) {
      if (self.resources[i].message !== '') {
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
  const resourcesToEncrypt = resources.map(function(resource) {
    resource.userId = userId;
    resource.message = resource.secretClear;
    delete resource.secretClear;
    return resource;
  });
  return resourcesToEncrypt;
};

exports.ImportPasswordsController = ImportPasswordsController;
