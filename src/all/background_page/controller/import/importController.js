/**
 * Import passwords controller.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const Worker = require('../../model/worker');
const fileController = require('../../controller/fileController');
const KeepassDb = require('../../model/keepassDb/keepassDb').KeepassDb;
const CsvDb = require('../../model/csvDb').CsvDb;
const Keyring = require('../../model/keyring').Keyring;
const Resource = require('../../model/resource').Resource;
const Crypto = require('../../model/crypto').Crypto;
const progressController = require('../progress/progressController');
const User = require('../../model/user').User;
const {FolderModel} = require('../../model/folder/folderModel');
const {FolderEntity} = require('../../model/entity/folder/folderEntity');

class ImportController {
  /**
   * ImportController constructor
   *
   * @param {Worker} worker
   * @param {ApiClientOptions} clientOptions
   * @param options object
   *  * bool foldersIntegration
   *  * bool tagsIntegration
   *  * bool importFolders
   *  * bool importTags
   *  * object credentials
   *      password: the password if any
   *      keyFile: the keyFile content in base 64
   * @param fileType string kdbx or csv
   * @param fileB64Content content of the file in base 64
   */
  constructor(worker, clientOptions, options, fileType, fileB64Content) {
    this.worker = worker;
    this.clientOptions = clientOptions;

    // this.requestId = requestId;
    this.options = options;
    this.fileType = fileType;
    this.fileB64Content = fileB64Content;

    this.progressStatus = 0;
    this.resources = [];
    this.uniqueImportTag = ImportController._generateUniqueImportTag(this.fileType);

    // Will contain the list of folders that have been created, organized by path.
    // example:
    // /root/category1 : { folder entity }
    this.folders = {};

    this.items = {
      'resources': [],
      'foldersPaths': []
    }
  }

  /**
   * Main exec function.
   * @return {Promise<{folders, importTag: *, resources}>}
   */
  async exec() {
    if (this.fileType === 'kdbx') {
      await this.initFromKdbx();
    } else if(this.fileType === 'csv') {
      await this.initFromCsv();
    }

    this._prepareFolders();

    this.progressObjective = this.items.resources.length;
    if (this.options.importFolders) {
      this.progressObjective +=  this.items.foldersPaths.length;
    }

    await progressController.open(this.worker, 'Importing ...', this.progressObjective, "Preparing import");
    try {
      await this.encryptSecretsAndAddToResources();
      let folders = [];
      if (this.options.importFolders) {
        folders = await this.saveFolders();
      }
      const resources = await this.saveResources();

      await progressController.close(this.worker);

      const result = {
        "resources": resources,
        "folders": folders,
        "importTag": this.uniqueImportTag,
      };

      return result;
    } catch(e) {
      await progressController.close(this.worker);
      throw Error(e);
    }
  }

  /**
   * Initialize passwords controller from a kdbx file.
   * @returns {*}
   */
  async initFromKdbx () {
    const kdbxFile = fileController.b64ToBlob(this.fileB64Content);
    if (this.options.credentials.keyFile !== null && this.options.credentials.keyFile !== undefined) {
      credentials.keyFile = fileController.b64ToBlob(this.options.credentials.keyFile);
    }

    const keepassDb = new KeepassDb();
    return await keepassDb.loadDb(kdbxFile, this.options.credentials.password, this.options.credentials.keyFile)
    .then(db => {
      this.items = keepassDb.toItems(db);
      return this.items;
    });
  };

  /**
   * Initialize controller from a csv file.
   * @returns {*}
   */
  async initFromCsv () {
    const csvFile = fileController.b64ToBlob(this.fileB64Content);
    const csvDb = new CsvDb();
    return await csvDb.loadDb(csvFile)
    .then(async db => {
      this.items.resources = await csvDb.toResources(db);
      console.log('csv resources', this.items.resources);
    });
  };

  /**
   * Encrypt a resource clear password into an armored message.
   * @returns {*}
   */
  async encryptSecretsAndAddToResources() {
    const keyring = new Keyring(),
      user = User.getInstance();

    this.resources = this.items.resources;
    this.progressObjective = this.resources.length * 2;

    const currentUser = user.get(),
      userId = currentUser.id;

    // Sync the keyring with the server.
    await keyring.sync();
    const armoredSecrets = await this._encryptSecretsForUser(userId);
    return this._enrichResourcesWithArmoredSecret(armoredSecrets);
  };

  /**
   * Initialize the list of folders. Add root and make sure they are in their final form.
   * @private
   */
  _prepareFolders() {
    // Extract folders list from resources.
    this.items.foldersPaths = this.items.foldersPaths.map((path) => {
      return this._getConsolidatedPath(path);
    });
    const rootPath = this._getConsolidatedPath('/');
    if (!this.items.foldersPaths.includes(rootPath)) {
      this.items.foldersPaths.unshift(rootPath);
    }

    this.items.foldersPaths.sort();
  }

  /**
   * Retrieve a folder from its path (during the import process).
   * Will return either a folder object, or undefined if the folder has not been created yet.
   * @param path
   * @return {*}
   */
  getFolderFromPath (path) {
    if (this.folders[path]) {
      return this.folders[path];
    }

    return undefined;
  };

  /**
   * Get consolidated path.
   * @param path
   * @return {string|*}
   * @private
   */
  _getConsolidatedPath(path) {
    let res = '/' + path;

    if (!path || path === '/') {
      res = '/' + this.uniqueImportTag;
    } else if (path.includes('/Root/')) {
      // If there is a root folder, we replace it with the unique tag name.
      res = path.replace("/Root/", "/" + this.uniqueImportTag + "/", );
    } else {
      // Else, we add the unique tag name at the beginning of
      res = "/" + this.uniqueImportTag + '/' + path;
    }

    return res;
  }

  /**
   * Import all folders for resource.
   * @param resources
   * @return Array
   * @private
   */
  async saveFolders () {
    const folderModel = new FolderModel(this.clientOptions);
    const importFoldersResults = {
      "created" : [],
      "errors" : []
    };


   const allPaths = this.items.foldersPaths;

    const totalFolders = allPaths.length;
    // Create folders.
    for(let i in allPaths) {
      const currentFolderPath = allPaths[i],
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
          folderE.folderParentId = parentFolder.id;
        }

        await progressController.update(this.worker, ++this.progressStatus, `Importing folder...  ${i}/${totalFolders}`);
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
   * @param array resourcesBatch batch of resources to save.
   * @param int batchNumber batch number
   * @param int batchSize maximum number of resources a batch can contain
   * @return Promise
   */
  async _importBatchResources (resourcesBatch, batchNumber, batchSize) {
    let counter = batchNumber * batchSize + 1;
    let importResults = {
      "created" : [],
      "errors" : []
    };
    const promises = [];

    for (let i in resourcesBatch) {
      const resource = resourcesBatch[i];

      // Manage parent folder if exists (has been created).
      let folderPath = this._getConsolidatedPath(resource.folderParentPath);
      let folderExist = this.getFolderFromPath(folderPath);
      if (this.options.importFolders && folderExist) {
        resource["folder_parent_id"] = folderExist.id;
      }

      const promise = Resource.import(resource)
      .then(importedResource => {
        importResults.created.push({"resource": importedResource});
        const totalResources = this.items.resources.length;
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
  async saveResources () {
    let importResourcesResults = {
      "created": [],
      "errors": []
    };

    const importResults =  importResourcesResults;

    // Split the resources in batches of equal size.
    const batchSize = 5;
    const chunks = this.items.resources.length / batchSize;
    const batches = [];
    for (let i = 0, j = 0; i < chunks; i++, j += batchSize) {
      batches.push(this.items.resources.slice(j, j + batchSize));
    }

    let batchNumber = 0;
    // Import the batches sequentially
    for (let i in batches) {
      const importBatchResult = await this._importBatchResources(batches[i], batchNumber++, batchSize);
      importResourcesResults.created = [...importResourcesResults.created, ...importBatchResult.created];
      importResourcesResults.errors = [...importResourcesResults.errors, ...importBatchResult.errors];
    }

    return importResults;
  };

  /**
   * Encrypt a list of secrets for a given user id.
   * @param userId
   * @returns {promise}
   * @private
   */
  async _encryptSecretsForUser (userId) {
    const crypto = new Crypto();

    // Format resources for the format expected by encryptAll.
    this.items.resources = ImportController._prepareResources(this.items.resources, userId);

    // Encrypt all the messages.
    return crypto.encryptAll(
      this.items.resources,
      // On complete.
       () => {
        progressController.update(this.worker, this.progressStatus++);
      },
      // On start.
      (position) => {
        progressController.update(this.worker, this.progressStatus, 'Encrypting ' + (parseInt(position) + 1) + '/' + this.items.resources.length);
      });
  };

  /**
   * Add given armored secrets to the resources.
   * @param armoredSecrets
   * @private
   */
  async _enrichResourcesWithArmoredSecret (armoredSecrets) {
    if (armoredSecrets.length !== this.items.resources.length) {
      throw Error('There was a problem while encrypting the secrets');
    }
    for (let i in armoredSecrets) {
      if (this.items.resources[i].message !== '') {
        this.items.resources[i].secrets = [
          {
            data : armoredSecrets[i],
          }
        ];
      }
      // Remove data that were added by _prepareResources().
      delete this.items.resources[i].message;
      delete this.items.resources[i].userId;
    }
  };

  //////////////////////// Static /////////////////////////

  /**
   * Get unique import tag (will be used as the parent folder name).
   * It's the tag / folder name that will be associated to the resources imported.
   * looks like import-filetype-yyyymmddhhiiss
   * @param fileType
   * @return {string}
   */
  static _generateUniqueImportTag (fileType) {
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
   * Prepare resources for encryption. (Put them in the expected format).
   * @param resources
   * @param userId
   * @returns {*|Array}
   * @private
   */
  static _prepareResources = function(resources, userId) {
    const resourcesToEncrypt = resources.map(function(resource) {
      resource.userId = userId;
      resource.message = resource.secretClear;
      delete resource.secretClear;
      return resource;
    });
    return resourcesToEncrypt;
  };
}


exports.ImportController = ImportController;
