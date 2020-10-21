/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         2.13.0
 */
const __ = require('../../sdk/l10n').get;
const Worker = require('../../model/worker');

const {Keyring} = require('../../model/keyring');
const {Crypto} = require('../../model/crypto');
const {User} = require('../../model/user');
const {CsvDb} = require('../../model/importExport/csvDb/csvDb');
const {KeepassDb} = require('../../model/importExport/keepassDb/keepassDb');

const {FolderEntity} = require('../../model/entity/folder/folderEntity');
const {FolderModel} = require('../../model/folder/folderModel');
const {ResourceModel} = require('../../model/resource/resourceModel');
const {ResourceEntity} = require('../../model/entity/resource/resourceEntity');
const {TagModel} = require('../../model/tag/tagModel');
const {TagEntity} = require('../../model/entity/tag/tagEntity');
const {TagsCollection} = require('../../model/entity/tag/tagsCollection');

const progressController = require('../progress/progressController');
const passphraseController = require('../passphrase/passphraseController');
const fileController = require('../../controller/fileController');

class ImportController {
  /**
   * ImportController constructor
   *
   * @param {Worker} worker
   * @param {ApiClientOptions} clientOptions
   * @param options object
   *  * bool hasFoldersPlugin
   *  * bool hasTagsPlugin
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
    this.resourceModel = new ResourceModel(clientOptions);

    this.options = options;
    this.fileType = fileType;
    this.fileB64Content = fileB64Content;

    this.resources = [];
    this.uniqueImportTag = ImportController._generateUniqueImportTag(this.fileType);

    // Batch size for the import, in order to throttle the calls to server.
    this.batchSize = 5;

    // Count of number of items to be imported.
    this.itemsCount = 0;

    // Count of operations to be executed during import.
    this.operationsCount = 0;

    // Keep count of the current operation number.
    this.currentOperationNumber = 0;

    // Current batch. To be used at runtime by the progress bar.
    this.currentBatchNumber = 0;

    // current item number.
    this.currentItemNumber = 0;

    // Will contain the list of folders that have been created, organized by path.
    // example:
    // /root/category1 : { folder entity }
    this.folders = {};

    // Contains items to import.
    // It is composed of:
    // - resources Array of resoures
    // - foldersPaths: Array of string folders paths (example of path:'/path1/path2')
    this.items = {
      'resources': [],
      'foldersPaths': []
    }

    this.keyring = new Keyring();
    this.crypto = new Crypto(this.keyring);
  }

  /**
   * Main exec function.
   * @return {Promise<{folders, importTag: *, resources}>}
   */
  async exec() {
    let passphrase;
    let privateKey;

    if (this.fileType === 'kdbx') {
      await this.initFromKdbx();
    } else if(this.fileType === 'csv') {
      await this.initFromCsv();
    }

    // Get the passphrase if needed and decrypt secret key
    try {
      passphrase = await passphraseController.get(this.worker);
      privateKey = await this.crypto.getAndDecryptPrivateKey(passphrase);
    } catch (error) {
      console.error(error);
      throw error;
    }

    this._prepareFolders();
    this.prepareProgressCounter();

    await progressController.open(this.worker, __('Importing ...'), this.operationsCount, __("Preparing import"));
    try {
      await this.encryptSecretsAndAddToResources(privateKey);
      let folders;
      if (this.options.importFolders) {
        const folderBatches = this.prepareFoldersBatches(this.items.foldersPaths);
        folders = await this.processBatches(folderBatches, this.saveFolder.bind(this));
      }

      // Save resources.
      const resourceBatches = this.prepareBatches(this.items.resources);
      const resources = await this.processBatches(resourceBatches, this.saveResource.bind(this));

      // Save tags for resources.
      let tags;
      if (this.options.importTags && resources.created.length > 0) {
        // Add the number of extra goals for tags import.
        this.operationsCount += resources.created.length;
        this.itemsCount += resources.created.length;
        progressController.updateGoals(this.worker, this.operationsCount);
        const tagsBatches = this.prepareBatches(resources.created);
        tags = await this.processBatches(tagsBatches, this.saveTags.bind(this));
        // crassette
        if (!folders || !folders.length) {
          Worker.get('App', this.worker.tab.id).port.emit('passbolt.import-passwords.complete', {tag: this.uniqueImportTag.slug});
        }
      }

      await progressController.close(this.worker);

      return {
        "resources": resources,
        "folders": folders,
        "tags": tags,
        "importTag": this.uniqueImportTag.slug,
        "options": this.options
      };
    } catch(e) {
      await progressController.close(this.worker);
      throw Error(e);
    }
  }

  /**
   * Import the tags associated to an imported resource
   *
   * @param {object} resource
   * @return {Promise}
   * @private
   */
  async saveTags(resource) {
    let tagsCollection = new TagsCollection([this.uniqueImportTag.toDto()]);
    let tagModel = new TagModel(this.clientOptions);
    return tagModel.updateResourceTags(resource.id, tagsCollection);
  };

  /**
   * Progress counter helper
   */
  prepareProgressCounter() {
    // The default objective is the number of resources multiplied by 2 because:
    // - we will first encrypt each resource secret. Each encryption succeeded is one step.
    // - then we will save each secret. Each save is one step.
    this.operationsCount += this.items.resources.length * 2;
    this.itemsCount = this.items.resources.length;

    // Each folder also counts as a step.
    if (this.options.importFolders) {
      this.operationsCount +=  this.items.foldersPaths.length;
      this.itemsCount += this.items.foldersPaths.length;
    }

    // If tags are imported, then one more operation per tag.
    if (this.options.importTags) {
      this.operationsCount +=  this.items.resources.length;
    }
  }

  /**
   * Initialize passwords controller from a kdbx file.
   * @returns {*}
   */
  async initFromKdbx() {
    const kdbxFile = fileController.b64ToBlob(this.fileB64Content);
    const password = this.options.credentials.password;
    let keyFile = null;
    if (this.options.credentials.keyFile !== null && this.options.credentials.keyFile !== undefined) {
      keyFile = fileController.b64ToBlob(this.options.credentials.keyFile);
    }

    const keepassDb = new KeepassDb();
    const db = await keepassDb.loadDb(kdbxFile, password, keyFile);
    this.items = keepassDb.toItems(db);

    return this.items;
  };

  /**
   * Initialize controller from a csv file.
   * @returns {*}
   */
  async initFromCsv() {
    const csvFile = fileController.b64ToBlob(this.fileB64Content);
    const csvDb = new CsvDb();
    return await csvDb.loadDb(csvFile)
    .then(async db => {
      this.items = await csvDb.toItems(db);
    });
  };

  /**
   * Encrypt a resource clear password into an armored message.
   * @param {openpgp.key.Key} privateKey decrypted private key
   * @returns {*}
   */
  async encryptSecretsAndAddToResources(privateKey) {
    const user = User.getInstance();

    this.resources = this.items.resources;
    this.operationsCount = this.resources.length * 2;

    const currentUser = user.get(),
      userId = currentUser.id;

    // Sync the keyring with the server.
    await this.keyring.sync();
    const armoredSecrets = await this._encryptSecretsForUser(userId, privateKey);
    return this._enrichResourcesWithArmoredSecret(armoredSecrets);
  };

  /**
   * Initialize the list of folders. Add root and make sure their paths is in their final form.
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
   * @param {string} path
   * @return {*}
   */
  getFolderFromPath(path) {
    if (this.folders[path]) {
      return this.folders[path];
    }

    return undefined;
  };

  /**
   * Get consolidated path.
   * @param {string} path
   * @return {string|*}
   * @private
   */
  _getConsolidatedPath(path) {
    let res = '';

    if (!path || path === '/') {
      res = '/' + this.uniqueImportTag.slug;
    } else if (path.match(/^Root/)) {
      // If there is a root folder, we replace it with the unique tag name.
      res = path.replace(/^Root/, "/" + this.uniqueImportTag.slug);
    } else {
      // Else, we add the unique tag name at the beginning of
      res = "/" + this.uniqueImportTag.slug + '/' + path;
    }

    return res;
  }

  /**
   * Save a folder from its path.
   * Store the result in this.folders[path] for reference.
   * @param folderPath
   * @return {Promise<void>}
   */
  async saveFolder(folderPath) {
    const folderModel = new FolderModel(this.clientOptions);
    const folderSplit = folderPath.replace(/^\//, '').split('/'),
      folderName = folderSplit.pop(),
      folderParent = folderSplit.length ? "/" + folderSplit.join("/") : "";

    let folderE = new FolderEntity({ "name": folderName });
    if (folderParent !== "") {
      const parentFolder = this.getFolderFromPath(folderParent);
      if (!parentFolder) {
        return;
      }

      folderE.folderParentId = parentFolder.id;
    }

    this.folders[folderPath] = await folderModel.create(folderE);

    return this.folders[folderPath];
  }

  /**
   * Save resource
   * @param {object} resourceDto
   * @returns {Promise<unknown>}
   */
  async saveResource(resourceDto) {
    // Manage parent folder if exists (has been created).
    let folderPath = this._getConsolidatedPath(resourceDto.folderParentPath);
    let folderExist = this.getFolderFromPath(folderPath);
    if (this.options.importFolders && folderExist) {
      resourceDto["folder_parent_id"] = folderExist.id;
    }

    try {
      let resourceEntity = new ResourceEntity(resourceDto);
      resourceEntity = await this.resourceModel.create(resourceEntity);
      return resourceEntity.toDto();
    } catch(error) {
      console.error(error);
      throw error;
    }
  }

  /**
   * Import a batch of resources.
   *
   * @param {array} resourcesBatch batch of resources to save.
   * @param {int} batchNumber batch number
   * @param {function} importFn import function callback
   * @return {Promise}
   */
  async importBatch(resourcesBatch, batchNumber, importFn) {
    this.currentBatchNumber++;
    const importResults = {
      "created" : [],
      "errors" : []
    };

    const promises = resourcesBatch.map(resource => {
      return importFn(resource)
      .then(resource => {
        this.currentItemNumber++;
        this.currentOperationNumber++;
        progressController.update(this.worker, this.currentOperationNumber, `Importing...  ${this.currentItemNumber}/${this.itemsCount}`);
        importResults.created.push(resource);
      })
      .catch(e => {
        this.currentItemNumber++;
        this.currentOperationNumber++;
        progressController.update(this.worker, this.currentOperationNumber, `Importing...  ${this.currentItemNumber}/${this.itemsCount}`);
        importResults.errors.push({
          "error": e.header.message,
          "resource": resource,
        });
      });
    });

    await Promise.all(promises);

    return importResults;
  };

  /**
   * Split a list of folders into batches.
   * Batches are organized by level and for given size.
   * By instance :
   * [
   *   /import-kdbx-2020060518538
   *   /import-kdbx-2020060518538/folderA
   *   /import-kdbx-2020060518538/folderA/subFolderA
   *   /import-kdbx-2020060518538/folderB
   * ]
   * will return:
   * [
   *   [
   *     /import-kdbx-2020060518538
   *   ], [
   *     /import-kdbx-2020060518538/folderA
   *     /import-kdbx-2020060518538/folderB
   *   ], [
   *     /import-kdbx-2020060518538/folderA/subFolderA
   *   ]
   * ]
   * @param {array} folderPaths The list of folders paths
   * @return {Array}
   */
  prepareFoldersBatches(folderPaths) {
    const folderPathsByLevels = [];
    const batches = [];

    folderPaths.forEach(folderPath => {
      const level = folderPath.split('/').length;
      if (!folderPathsByLevels[level]) {
        folderPathsByLevels[level] = [];
      }
      folderPathsByLevels[level].push(folderPath);
    });

    folderPathsByLevels.forEach(folderPathsByLevel => {
      batches.push([]);
      folderPathsByLevel.forEach(folderPath => {
        if(batches[batches.length - 1].length === this.batchSize) {
          batches.push([]);
        }
        batches[batches.length - 1].push(folderPath);
      });
    });

    return batches;
  }

  /**
   * Split a list of items into batches.
   * For example: 15 items with a batchSize of 5 will return 3 arrays of 5 items.
   * @param items
   * @return {Array}
   */
  prepareBatches(items) {
    const batches = [];
    const chunks = items.length / this.batchSize;
    for (let i = 0, j = 0; i < chunks; i++, j += this.batchSize) {
      batches.push(items.slice(j, j + this.batchSize));
    }

    return batches;
  }

  /**
   * Process batches of an import.
   * Batches is an array of batch
   * A batch is an array of items.
   * importFn is the callback to a function that knows how to import an item.
   * @param batches Array
   * @param importFn function
   * @return {Promise<{created: Array, errors: Array}>}
   */
  async processBatches(batches, importFn) {
    let batchResults = {
      "created": [],
      "errors": []
    };

    let batchNumber = 0;
    // Import the batches sequentially
    for (let i in batches) {
      if (batches.hasOwnProperty(i)) {
        const batch = batches[i];
        const importBatchResult = await this.importBatch(batch, batchNumber++, importFn);
        batchResults.created = [...batchResults.created, ...importBatchResult.created];
        batchResults.errors = [...batchResults.errors, ...importBatchResult.errors];
      }
    }

    return batchResults;
  }

  /**
   * Encrypt a list of secrets for a given user id.
   * @param {string} userId
   * @param {openpgp.key.Key} privateKey decrypted private key
   * @returns {promise}
   * @private
   */
  async _encryptSecretsForUser (userId, privateKey) {
    // Format resources for the format expected by encryptAll.
    this.items.resources = ImportController._prepareResources(this.items.resources, userId);

    // Encrypt all the messages.
    return this.crypto.encryptAll(
      this.items.resources,
      privateKey,
      // On complete.
       () => {
        progressController.update(this.worker, this.currentOperationNumber++);
      },
      // On start.
      (position) => {
        const message = 'Encrypting ' + (parseInt(position) + 1) + '/' + this.items.resources.length;
        progressController.update(this.worker, this.currentOperationNumber, message);
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
      if (armoredSecrets.hasOwnProperty(i)) {
        if (this.items.resources[i].message !== '') {
          this.items.resources[i].secrets = [{data : armoredSecrets[i]}];
        }
        // Remove data that were added by _prepareResources().
        delete this.items.resources[i].message;
        delete this.items.resources[i].userId;
      }
    }
  };

  //////////////////////// Static /////////////////////////

  /**
   * Get unique import tag (will be used as the parent folder name).
   * It's the tag / folder name that will be associated to the resources imported.
   * looks like import-filetype-yyyymmddhhiiss
   * @param fileType
   * @return {TagEntity}
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

    return new TagEntity({slug: 'import-' + fileType + '-' + importDate, is_shared: false});
  };

  /**
   * Prepare resources for encryption. (Put them in the expected format).
   * @param resources
   * @param userId
   * @returns {*|Array}
   * @private
   */
  static _prepareResources (resources, userId) {
    return resources.map(function(resource) {
      resource.userId = userId;
      resource.message = resource.secretClear;
      delete resource.secretClear;
      return resource;
    });
  };
}


exports.ImportController = ImportController;
