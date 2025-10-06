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
 * @since         4.10.0
 */

import ImportError from "../../../error/importError";
import ExternalFoldersCollection from "../../../model/entity/folder/external/externalFoldersCollection";
import ResourcesCollection from "../../../model/entity/resource/resourcesCollection";
import ResourceSecretsCollection from "../../../model/entity/secret/resource/resourceSecretsCollection";
import SecretEntity from "../../../model/entity/secret/secretEntity";
import TagsCollection from "../../../model/entity/tag/tagsCollection";
import FolderModel from "../../../model/folder/folderModel";
import ResourcesImportParser from "../../../model/import/resourcesImportParser";
import Keyring from "../../../model/keyring";
import ResourceModel from "../../../model/resource/resourceModel";
import ResourceTypeModel from "../../../model/resourceType/resourceTypeModel";
import TagModel from "../../../model/tag/tagModel";
import {OpenpgpAssertion} from "../../../utils/openpgp/openpgpAssertions";
import ResourceService from "../../api/resource/resourceService";
import EncryptMessageService from "../../crypto/encryptMessageService";
import ExecuteConcurrentlyService from "../../execute/executeConcurrentlyService";
import ResourceLocalStorage from "../../local_storage/resourceLocalStorage";
import User from "../../../model/user";
import i18n from "../../../sdk/i18n";
import GetOrFindMetadataSettingsService from "../../metadata/getOrFindMetadataSettingsService";
import EncryptMetadataService from "../../metadata/encryptMetadataService";
import DecryptPrivateKeyService from "../../crypto/decryptPrivateKeyService";
import DecryptMetadataService from "../../metadata/decryptMetadataService";
import ResourceMetadataEntity from "passbolt-styleguide/src/shared/models/entity/resource/metadata/resourceMetadataEntity";

/**
 * The service aim to import the resources from a file and save it to the API / localstorage.
 */
class ImportResourcesService {
  /**
   * @constructor
   * @param {ApiClientOptions} apiClientOptions The api client options
   * @param {ProgressService} progressService the progress service initialised by the controller
   */
  constructor(account, apiClientOptions, progressService) {
    //Crypto
    this.keyring = new Keyring();
    //Models
    this.resourceModel = new ResourceModel(apiClientOptions, account);
    this.folderModel = new FolderModel(apiClientOptions, account);
    this.tagModel = new TagModel(apiClientOptions, account);
    this.resourceTypeModel = new ResourceTypeModel(apiClientOptions);
    //Services
    this.resourceService = new ResourceService(apiClientOptions);
    this.executeConcurrentlyService = new ExecuteConcurrentlyService();
    this.progressService = progressService;
    this.getOrFindMetadataSettingsService = new GetOrFindMetadataSettingsService(account, apiClientOptions);
    this.encryptMetadataService = new EncryptMetadataService(apiClientOptions, account);
    this.decryptMetadataService = new DecryptMetadataService(apiClientOptions, account);
    this.account = account;
  }

  /**
   * Import the resource file and save it into the API and local storage.
   * @param {ImportResourcesFileEntity} importResourcesFile The import resource entity.
   * @param {String} passphrase the user passphrase
   * @return {Promise<ImportResourcesFileEntity>}
   */
  async importFile(importResourcesFile, passphrase) {
    const userId = User.getInstance().get().id;

    const privateKey = await DecryptPrivateKeyService.decryptArmoredKey(this.account.userPrivateArmoredKey, passphrase);
    await this.encryptSecrets(importResourcesFile, userId, privateKey);
    importResourcesFile.mustImportFolders && await this.bulkImportFolders(importResourcesFile);
    const resourceToImportDto = importResourcesFile.importResources.toResourceCollectionImportDto();
    const resourcesCollection = new ResourcesCollection(resourceToImportDto);
    const clearTextMetadataResourcesCollection = new ResourcesCollection(resourceToImportDto);
    await this.encryptMetadata(resourcesCollection, passphrase);
    await this.bulkImportResources(importResourcesFile, resourcesCollection, clearTextMetadataResourcesCollection);
    importResourcesFile.mustTag && await this.bulkTagResources(importResourcesFile);
    await this.progressService.finishStep(null, true);
    return importResourcesFile;
  }

  /**
   * Parse the file
   * @param {ImportResourcesFileEntity} importResourcesFile The import entity
   * @returns {Promise<void>}
   */
  async parseFile(importResourcesFile) {
    const metadataTypesSettings = await this.getOrFindMetadataSettingsService.getOrFindTypesSettings();
    const importParser = new ResourcesImportParser();
    const resourceTypesCollection = await this.resourceTypeModel.getOrFindAll();
    await importParser.parseImport(importResourcesFile, resourceTypesCollection, metadataTypesSettings);

    // Now that we know about the content of the import, update the progress bar goals.
    const progressGoal = 1 // Initialization
      + (importResourcesFile.mustImportFolders ? importResourcesFile.importFolders.items.length : 0) // #folders create API calls
      + importResourcesFile.importResources.items.length * 2 // #resource to encrypt + #resource create API calls
      + 1 // #resource metadata encryption
      + (importResourcesFile.mustTag ? importResourcesFile.importResources.items.length : 0); // #resources tag API calls
    this.progressService.updateGoals(progressGoal);
  }


  /**
   * Encrypts the metadata of resources in a collection using the provided passphrase.
   *
   * @param {ResourcesCollection} resourcesCollection - The collection of resources to be encrypted.
   * @param {string} passphrase - The passphrase used for encryption.
   * @returns {Promise<void>} A promise that resolves when the encryption process is complete.
   */
  async encryptMetadata(resourcesCollection, passphrase) {
    await this.progressService.finishStep(i18n.t('Encrypting {{total}} metadata', {total: resourcesCollection.items.length}));
    await this.encryptMetadataService.encryptAllFromForeignModels(resourcesCollection, passphrase);
  }

  /**
   * Encrypt the secrets
   * @param {ImportResourcesFileEntity} importResourcesFile The import object
   * @param {string} userId uuid
   * @param {openpgp.PrivateKey} privateKey
   * @returns {Promise<void>}
   * @private
   */
  async encryptSecrets(importResourcesFile, userId, privateKey) {
    let i = 0;
    const userPublicArmoredKey = this.keyring.findPublic(userId).armoredKey;
    const userPublicKey = await OpenpgpAssertion.readKeyOrFail(userPublicArmoredKey);
    const resourceTypes = await this.resourceTypeModel.getOrFindAll();
    for (const importResourceEntity of importResourcesFile.importResources) {
      i++;
      await this.progressService.finishStep(i18n.t('Encrypting {{counter}}/{{total}}', {counter: i, total: importResourcesFile.importResources.items.length}));
      const resourceType = importResourceEntity.resourceTypeId ? resourceTypes.getFirstById(importResourceEntity.resourceTypeId) : null;
      const secretDto = importResourceEntity.toSecretDto(resourceType);
      importResourceEntity.resetSecretProps(resourceType); //
      const serializedPlaintextDto = await this.resourceModel.serializePlaintextDto(importResourceEntity.resourceTypeId, secretDto);
      const data = await EncryptMessageService.encrypt(serializedPlaintextDto, userPublicKey, [privateKey]);
      const secret = new SecretEntity({data: data});
      importResourceEntity.secrets = new ResourceSecretsCollection([secret]);
    }
  }

  /**
   * Import the folders.
   * @param {ImportResourcesFileEntity} importResourcesFile The import object
   * @returns {Promise<void>}
   * @private
   */
  async bulkImportFolders(importResourcesFile) {
    let importedCount = 0;
    // Import level by level, starting by the root.
    let depth = 0;
    do {
      const externalFolderChunk = importResourcesFile.importFolders.getByDepth(depth);
      if (!externalFolderChunk.length) {
        break;
      }
      const foldersCollection = ExternalFoldersCollection.toFoldersCollection(externalFolderChunk);
      const successCallback = (folderEntity, index) => this.handleImportFolderSuccess.bind(this)(importResourcesFile, ++importedCount, folderEntity, externalFolderChunk[index]);
      const errorCallback = (error, index) => this.handleImportFolderError.bind(this)(importResourcesFile, ++importedCount, error, externalFolderChunk[index]);
      await this.folderModel.bulkCreate(foldersCollection, {successCallback: successCallback, errorCallback: errorCallback});
    } while (++depth);

    // Set import folder reference
    const importFolderReferenceEntity = importResourcesFile.importFolders.getByPath(importResourcesFile.ref);
    if (importFolderReferenceEntity) {
      const referenceFolderEntity = await this.folderModel.getById(importFolderReferenceEntity.id);
      importResourcesFile.referenceFolder = referenceFolderEntity;
    }
  }

  /**
   * Handle folder import success
   * @param {ImportResourcesFileEntity} importResourcesFile The import
   * @param {int} importedCount The number of folder imported (with success or no)
   * @param {FolderEntity} folderEntity The created folder
   * @param {ExternalFolderEntity} externalFolderEntity The external folder entity at the source of the create
   * @private
   */
  async handleImportFolderSuccess(importResourcesFile, importedCount, folderEntity, externalFolderEntity) {
    externalFolderEntity.id = folderEntity.id;
    importResourcesFile.importFolders.setFolderParentIdsByPath(externalFolderEntity.path, externalFolderEntity.id);
    importResourcesFile.importResources.setFolderParentIdsByPath(externalFolderEntity.path, externalFolderEntity.id);
    await this.progressService.finishStep(i18n.t('Importing folders {{importedCount}}/{{total}}', {importedCount: importedCount, total: importResourcesFile.importFolders.items.length}));
  }

  /**
   * Handle folder import error
   * @param {ImportResourcesFileEntity} importResourcesFile The import
   * @param {int} importedCount The number of folder imported (with success or no)
   * @param {Error} error The encountered error
   * @param {ExternalFolderEntity} externalFolderEntity The external folder entity at the source of the create
   * @private
   */
  async handleImportFolderError(importResourcesFile, importedCount, error, externalFolderEntity) {
    await this.progressService.finishStep(i18n.t('Importing folders {{importedCount}}/{{total}}', {importedCount: importedCount, total: importResourcesFile.importFolders.items.length}));
    importResourcesFile.importFoldersErrors.push(new ImportError("Cannot import folder", externalFolderEntity, error));
    importResourcesFile.importFolders.removeByPath(externalFolderEntity.path);
    importResourcesFile.importResources.removeByPath(externalFolderEntity.path);
  }

  /**
   * Tag the resources.
   * @param {ImportResourcesFileEntity} importResourcesFile The import object
   * @returns {Promise<void>}
   * @private
   */
  async bulkTagResources(importResourcesFile) {
    const tagsCollection = new TagsCollection([{slug: importResourcesFile.ref}]);
    const resourcesIds = importResourcesFile.importResources.items.filter(importResourceEntity => importResourceEntity.id)
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
    const successCallback = () => this.handleTagResourceSuccess(importResourcesFile, ++taggedCount);
    const errorCallback = () => this.handleTagResourceError(importResourcesFile, ++taggedCount);
    await this.tagModel.bulkTagResources(resourcesIds, tagsCollection, {successCallback: successCallback, errorCallback: errorCallback});
  }

  /**
   * Handle resource tag success
   * @param {ImportResourcesFileEntity} importResourcesFile The import
   * @param {int} taggedCount The number of resource tagged (with success or no)
   * @private
   */
  async handleTagResourceSuccess(importResourcesFile, taggedCount) {
    await this.progressService.finishStep(i18n.t('Tagging passwords {{taggedCount}}/{{total}}', {taggedCount: taggedCount, total: importResourcesFile.importResources.items.length}));
  }

  /**
   * Handle resource tag error
   * @param {ImportResourcesFileEntity} importResourcesFile The import
   * @param {int} taggedCount The number of resource tagged (with success or no)
   * @private
   */
  async handleTagResourceError(importResourcesFile, taggedCount) {
    await this.progressService.finishStep(i18n.t('Tagging passwords {{taggedCount}}/{{total}}', {taggedCount: taggedCount, total: importResourcesFile.importResources.items.length}));
  }

  /**
   * Import the resources.
   * @param {ImportResourcesFileEntity} importResourcesFile The import
   * @param {ResourcesCollection} resourcesCollection The collection to import
   * @param {ResourcesCollection} clearTextMetadataResourcesCollection The collection of resources with their metadata
   * decrypted, the collection resources index should match the collection with encrypted metadata.
   * @returns {Promise<void>}
   * @private
   */
  async bulkImportResources(importResourcesFile, resourcesCollection, clearTextMetadataResourcesCollection) {
    let importedCount = 0;
    const resourceTypesCollection = await this.resourceTypeModel.getOrFindAll();

    const callbacks = resourcesCollection.items.map((resourceEntity, index) => async() => {
      try {
        let data;
        const resourceType = resourceTypesCollection.getFirstById(resourceEntity.resourceTypeId);

        if (resourceType.isV4()) {
          data = resourceEntity.toV4Dto({secrets: true});
        } else {
          data = resourceEntity.toDto({secrets: true});
        }

        const contain = {permission: true, favorite: true, tags: true, folder: true};
        const createdResourceDto = await this.resourceService.create(data, contain);
        // Reuse the original non decrypted resource metadata.
        createdResourceDto.metadata = clearTextMetadataResourcesCollection.items[index].metadata.toDto(ResourceMetadataEntity.DEFAULT_CONTAIN);
        this.handleImportResourceSuccess(importResourcesFile, ++importedCount, createdResourceDto, importResourcesFile.importResources.items[index]);

        return createdResourceDto;
      } catch (error) {
        console.error(error);
        this.handleImportResourceError(importResourcesFile, ++importedCount, error, importResourcesFile.importResources.items[index]
        );
      }
    });

    if (callbacks.length > 0) {
      const createdResourcesDto = await this.executeConcurrentlyService.execute(callbacks, 5);
      const createResourcesCollection = new ResourcesCollection(createdResourcesDto);
      await ResourceLocalStorage.addResources(createResourcesCollection);
    }
  }

  /**
   * Handle resource import success
   * @param {ImportResourcesFileEntity} importResourcesFile The import
   * @param {int} importedCount The number of resource imported (with success or no)
   * @param {object} createdResourceDto The created resource dto.
   * @param {ExternalResourceEntity} externalResourceEntity The external resource entity at the source of the create
   * @private
   */
  async handleImportResourceSuccess(importResourcesFile, importedCount, createdResourceDto, externalResourceEntity) {
    externalResourceEntity.id = createdResourceDto.id;
    await this.progressService.finishStep(i18n.t('Importing passwords {{importedCount}}/{{total}}', {importedCount: importedCount, total: importResourcesFile.importResources.items.length}));
  }

  /**
   * Handle resource import error
   * @param {ImportResourcesFileEntity} importResourcesFile The import
   * @param {int} importedCount The number of resource imported (with success or no)
   * @param {Error} error The encountered error
   * @param {ExternalResourceEntity} externalResourceEntity The external resource entity at the source of the create
   * @private
   */
  async handleImportResourceError(importResourcesFile, importedCount, error, externalResourceEntity) {
    await this.progressService.finishStep(i18n.t('Importing passwords {{importedCount}}/{{total}}', {importedCount: importedCount, total: importResourcesFile.importResources.items.length}));
    importResourcesFile.importResourcesErrors.push(new ImportError("Cannot import resource", externalResourceEntity, error));
  }
}

export default ImportResourcesService;
