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
 */
const __ = require('../../sdk/l10n').get;
const Worker = require('../../model/worker');

const {Keyring} = require('../../model/keyring');
const {Crypto} = require('../../model/crypto');
const {User} = require('../../model/user');

const {FileTypeError} = require("../../error/fileTypeError");

const progressController = require('../progress/progressController');
const passphraseController = require('../passphrase/passphraseController');
const {ImportError} = require("../../error/importError");

const {ResourcesImportParser} = require("../../model/import/resourcesImportParser");
const {FolderModel} = require('../../model/folder/folderModel');
const {ResourceTypeModel} = require("../../model/resourceType/resourceTypeModel");
const {ResourceModel} = require('../../model/resource/resourceModel');
const {TagModel} = require('../../model/tag/tagModel');

const {ResourcesCollection} = require("../../model/entity/resource/resourcesCollection");
const {FoldersCollection} = require("../../model/entity/folder/foldersCollection");
const {TagsCollection} = require('../../model/entity/tag/tagsCollection');
const {ResourceSecretsCollection} = require("../../model/entity/secret/resource/resourceSecretsCollection");
const {ImportResourcesFileEntity} = require("../../model/entity/import/importResourcesFileEntity");
const {SecretEntity} = require("../../model/entity/secret/secretEntity");

const PROGRESS_DIALOG_TITLE = "Importing ...";

class ImportResourcesFileController {
  /**
   * ImportResourcesFileController constructor
   * @param {Worker} worker
   * @param {ApiClientOptions} clientOptions
   */
  constructor(worker, clientOptions) {
    this.worker = worker;

    // Crypto
    this.keyring = new Keyring();
    this.crypto = new Crypto(this.keyring);

    // Models
    this.resourceTypeModel = new ResourceTypeModel(clientOptions);
    this.resourceModel = new ResourceModel(clientOptions);
    this.folderModel = new FolderModel(clientOptions);
    this.tagModel = new TagModel(clientOptions);

    // Progress
    this.progressGoal = 100;
    this.progress = 0;
  }

  /**
   * Main exec function
   * @param {string} fileType The file type.
   * @param {string} file The file in base64
   * @param {object?} options (optional) The import options
   * @returns {Promise<object>} The result of the import
   */
  async exec(fileType, file, options) {
    const userId = User.getInstance().get().id;

    await progressController.open(this.worker, PROGRESS_DIALOG_TITLE, this.progressGoal, __('Initialize'));
    await progressController.update(this.worker, ++this.progress);

    try {
      const importEntity = this.buildImportEntity(fileType, file, options);
      await this.parseFile(importEntity);
      const privateKey = await this.getPrivateKey();
      await this.encryptSecrets(importEntity, userId, privateKey);
      importEntity.mustImportFolders && await this.bulkImportFolders(importEntity);
      await this.bulkImportResources(importEntity);
      importEntity.mustTag && await this.bulkTagResources(importEntity);
      await progressController.update(this.worker, this.progressGoal);
      await progressController.close(this.worker);
      return importEntity;
    } catch (error) {
      await progressController.close(this.worker);
      throw error;
    }
  }

  /**
   * Build the import entity
   * @param {string} fileType The file to import type
   * @param {string} file The file to import (Encoded in base64)
   * @param {object?} options (Optional) The import options
   * @returns {ImportResourcesFileEntity}
   * @throws {FileTypeError} If the file type is not supported
   */
  buildImportEntity(fileType, file, options) {
    const ref = this.generateImportReference();
    const importResourcesDto = {file_type: fileType, file, options, ref};
    return new ImportResourcesFileEntity(importResourcesDto);
  }

  /**
   * Generate the import reference.
   * @returns {string} ie. import-YYMMDDhhii
   */
  generateImportReference() {
    const dateRef = (new Date()).toISOString()
      .split('.')[0]
      .replace(/\D/g, '');
    return `import-${dateRef}`;
  }

  /**
   * Parse the file
   * @param {ImportResourcesFileEntity} importEntity The import entity
   * @returns {Promise<ImportResourcesFileEntity>}
   */
  async parseFile(importEntity) {
    const importParser = new ResourcesImportParser();
    const resourceTypesCollection = await this.resourceTypeModel.getOrFindAll();
    await importParser.parseImport(importEntity, resourceTypesCollection);

    // Now that we know about the content of the import, update the progress bar goals.
    this.progressGoal = 1 // Initialization
      + (importEntity.mustImportFolders ? importEntity.importFolders.items.length : 0) // #folders create API calls
      + importEntity.importResources.items.length * 2 // #resource to encrypt + #resource create API calls
      + (importEntity.mustTag ? importEntity.importResources.items.length : 0); // #resources tag API calls
    await progressController.updateGoals(this.worker, this.progressGoal);

    return importEntity;
  }

  /**
   * Get the user private key decrypted
   * @returns {Promise<openpgp.key.Key>}
   */
  async getPrivateKey() {
    const passphrase = await passphraseController.get(this.worker);
    return this.crypto.getAndDecryptPrivateKey(passphrase);
  }

  /**
   * Encrypt the secrets.
   * @param {ImportResourcesFileEntity} importEntity The import object
   * @param {string} userId uuid
   * @param {openpgp.key.Key} privateKey
   * @returns {Promise<void>}
   */
  async encryptSecrets(importEntity, userId, privateKey) {
    let i = 0;
    for (let importResourceEntity of importEntity.importResources) {
      progressController.update(this.worker, this.progress++, __(`Encrypting ${++i}/${importEntity.importResources.items.length}`));
      // @todo The secret DTO could be carried by the external resource entity. It can be done when we arrange the external resource entity schema validation.
      const secretDto = this.buildSecretDto(importResourceEntity);
      const serializedPlaintextDto = await this.resourceModel.serializePlaintextDto(importResourceEntity.resourceTypeId, secretDto);
      const data = await this.crypto.encrypt(serializedPlaintextDto, userId, privateKey);
      const secret = new SecretEntity({data});
      importResourceEntity.secrets = new ResourceSecretsCollection([secret]);
    }
  }

  /**
   * Build the secret DTO.
   * @param {ExternalResourceEntity} importResourceEntity The resource to import
   * @returns {string|{password: string, description: *}}
   */
  buildSecretDto(importResourceEntity) {
    // @todo sloppy. If the resources types are present, we consider that by default the description should be encrypted.
    if (importResourceEntity.resourceTypeId) {
      const dto = {
        password: importResourceEntity.secretClear || "",
        description: importResourceEntity.description || ""
      }
      // @todo sloppy. We remove the clear description here, but it should be done at a parsing level.
      importResourceEntity.description = "";
      return dto;
    }
    return importResourceEntity.secretClear;
  }

  /**
   * Import the folders.
   * @param {ImportResourcesFileEntity} importEntity The import object
   * @returns {Promise<void>}
   */
  async bulkImportFolders(importEntity) {
    let importedCount = 0;

    // Import level by level, starting by the root.
    let depth = 0;
    do {
      const externalFolderChunk = importEntity.importFolders.getByDepth(depth);
      if (!externalFolderChunk.length) {
        break;
      }
      const foldersCollection = new FoldersCollection(externalFolderChunk);
      const successCallback = (folderEntity, index) => this.handleImportFolderSuccess.bind(this)(importEntity, ++importedCount, folderEntity, externalFolderChunk[index]);
      const errorCallback = (error, index) => this.handleImportFolderError.bind(this)(importEntity, ++importedCount, error, externalFolderChunk[index]);
      await this.folderModel.bulkCreate(foldersCollection, {successCallback, errorCallback});
    } while(++depth);

    // Set import folder reference
    const importFolderReferenceEntity = importEntity.importFolders.getByPath(importEntity.ref);
    if (importFolderReferenceEntity) {
      const referenceFolderEntity = await this.folderModel.getById(importFolderReferenceEntity.id);
      importEntity.referenceFolder = referenceFolderEntity;
    }
  }

  /**
   * Handle folder import success
   * @param {ImportResourcesFileEntity} importEntity The import
   * @param {int} importedCount The number of folder imported (with success or no)
   * @param {FolderEntity} folderEntity The created folder
   * @param {ExternalFolderEntity} externalFolderEntity The external folder entity at the source of the create
   */
  handleImportFolderSuccess(importEntity, importedCount, folderEntity, externalFolderEntity) {
    externalFolderEntity.id = folderEntity.id;
    importEntity.importFolders.setFolderParentIdsByPath(externalFolderEntity.path, externalFolderEntity.id);
    importEntity.importResources.setFolderParentIdsByPath(externalFolderEntity.path, externalFolderEntity.id);
    progressController.update(this.worker, this.progress++, __(`Importing folders ${importedCount}/${importEntity.importFolders.items.length}`));
  }

  /**
   * Handle folder import error
   * @param {ImportResourcesFileEntity} importEntity The import
   * @param {int} importedCount The number of folder imported (with success or no)
   * @param {Error} error The encountered error
   * @param {ExternalFolderEntity} externalFolderEntity The external folder entity at the source of the create
   */
  handleImportFolderError(importEntity, importedCount, error, externalFolderEntity) {
    progressController.update(this.worker, this.progress++, __(`Importing folders ${importedCount}/${importEntity.importFolders.items.length}`));
    importEntity.importFoldersErrors.push(new ImportError("Cannot import folder", externalFolderEntity, error));
    importEntity.importFolders.removeByPath(externalFolderEntity.path);
    importEntity.importResources.removeByPath(externalFolderEntity.path);
  }

  /**
   * Import the resources.
   * @param {ImportResourcesFileEntity} importEntity The import object
   * @returns {Promise<void>}
   */
  async bulkImportResources(importEntity) {
    let importedCount = 0;
    const resourcesCollection = new ResourcesCollection(importEntity.importResources.toJSON());
    const successCallback = (resourceEntity, index) => this.handleImportResourceSuccess(importEntity, ++importedCount, resourceEntity, importEntity.importResources.items[index]);
    const errorCallback = (error, index) => this.handleImportResourceError(importEntity, ++importedCount, error, importEntity.importResources.items[index]);
    await this.resourceModel.bulkCreate(resourcesCollection, {successCallback, errorCallback});
  }

  /**
   * Handle resource import success
   * @param {ImportResourcesFileEntity} importEntity The import
   * @param {int} importedCount The number of resource imported (with success or no)
   * @param {ResourceEntity} resourceEntity The created resource
   * @param {ExternalResourceEntity} externalResourceEntity The external resource entity at the source of the create
   */
  handleImportResourceSuccess(importEntity, importedCount, resourceEntity, externalResourceEntity) {
    externalResourceEntity.id = resourceEntity.id;
    progressController.update(this.worker, this.progress++, __(`Importing passwords ${importedCount}/${importEntity.importResources.items.length}`));
  }

  /**
   * Handle resource import error
   * @param {ImportResourcesFileEntity} importEntity The import
   * @param {int} importedCount The number of resource imported (with success or no)
   * @param {Error} error The encountered error
   * @param {ExternalResourceEntity} externalResourceEntity The external resource entity at the source of the create
   */
  handleImportResourceError(importEntity, importedCount, error, externalResourceEntity) {
    progressController.update(this.worker, this.progress++, __(`Importing passwords ${importedCount}/${importEntity.importResources.items.length}`));
    importEntity.importResourcesErrors.push(new ImportError("Cannot import resource", externalResourceEntity, error));
  }

  /**
   * Tag the resources.
   * @param {ImportResourcesFileEntity} importEntity The import object
   * @returns {Promise<void>}
   */
  async bulkTagResources(importEntity) {
    const tagsCollection = new TagsCollection([{slug: importEntity.ref}]);
    const resourcesIds = importEntity.importResources.items.filter(importResourceEntity => importResourceEntity.id)
      // Do not tag resource which failed.
      .map(importResourceEntity => importResourceEntity.id);

    if (!resourcesIds.length) {
      return;
    }

    /**
     * Tag the first resource to ensure the API is not creating 2 tags with the same name.
     * It happens with version <= v2.13 that 2 tags were created when tagging multiple resource in bulk and that leads to
     * unexpected behavior.
     * @todo investigate the API resource tag entry point and remove this hack.
     */
    await this.tagModel.updateResourceTags(resourcesIds[0], tagsCollection);
    resourcesIds.splice(0, 1);

    // If there was only one resource, exit.
    if (!resourcesIds.length) {
      return;
    }

    // Bulk tag the resources.
    let taggedCount = 0;
    const successCallback = () => this.handleTagResourceSuccess(importEntity, ++taggedCount);
    const errorCallback = () => this.handleTagResourceError(importEntity, ++taggedCount);
    const resourcesEntities = await this.tagModel.bulkTagResources(resourcesIds, tagsCollection, {successCallback, errorCallback});

    // Retrieve the reference tag and update the import entity.
    if (resourcesEntities && resourcesEntities.length) {
      importEntity.referenceTag = resourcesEntities[0].tags.items[0];
    }
  }

  /**
   * Handle resource tag success
   * @param {ImportResourcesFileEntity} importEntity The import
   * @param {int} taggedCount The number of resource tagged (with success or no)
   */
  handleTagResourceSuccess(importEntity, taggedCount) {
    progressController.update(this.worker, this.progress++, __(`Tagging passwords ${taggedCount}/${importEntity.importResources.items.length}`));
  }

  /**
   * Handle resource tag error
   * @param {ImportResourcesFileEntity} importEntity The import
   * @param {int} taggedCount The number of resource tagged (with success or no)
   */
  handleTagResourceError(importEntity, taggedCount) {
    progressController.update(this.worker, this.progress++, __(`Tagging passwords ${taggedCount}/${importEntity.importResources.items.length}`));
  }
}

exports.ImportResourcesFileController = ImportResourcesFileController;
