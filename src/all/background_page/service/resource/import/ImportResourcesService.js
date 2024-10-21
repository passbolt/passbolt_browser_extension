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
import ResourceEntity from "../../../model/entity/resource/resourceEntity";
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
  }

  /**
   * Import the resource file and save it into the API and local storage.
   * @param {ImportResourcesFileEntity} importResourcesFile The import resource entity.
   * @param {openpgp.PrivateKey} privateKey the user private key
   * @return {Promise<ImportResourcesFileEntity>}
   */
  async importFile(importResourcesFile, privateKey) {
    const userId = User.getInstance().get().id;

    await this.parseFile(importResourcesFile);
    await this.encryptSecrets(importResourcesFile, userId, privateKey);
    importResourcesFile.mustImportFolders && await this.bulkImportFolders(importResourcesFile);
    await this.bulkImportResources(importResourcesFile);
    importResourcesFile.mustTag && await this.bulkTagResources(importResourcesFile);
    await this.progressService.finishStep(null, true);
    return importResourcesFile;
  }

  /**
   * Parse the file
   * @param {ImportResourcesFileEntity} importResourcesFile The import entity
   * @returns {Promise<void>}
   * @private
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
      + (importResourcesFile.mustTag ? importResourcesFile.importResources.items.length : 0); // #resources tag API calls
    this.progressService.updateGoals(progressGoal);
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
    for (const importResourcesEntity of importResourcesFile.importResources) {
      i++;
      await this.progressService.finishStep(i18n.t('Encrypting {{counter}}/{{total}}', {counter: i, total: importResourcesFile.importResources.items.length}));
      // @todo The secret DTO could be carried by the external resource entity. It can be done when we arrange the external resource entity schema validation.
      const secretDto = this.buildSecretDto(importResourcesEntity);
      const serializedPlaintextDto = await this.resourceModel.serializePlaintextDto(importResourcesEntity.resourceTypeId, secretDto);
      const userPublicArmoredKey = this.keyring.findPublic(userId).armoredKey;
      const userPublicKey = await OpenpgpAssertion.readKeyOrFail(userPublicArmoredKey);
      const data = await EncryptMessageService.encrypt(serializedPlaintextDto, userPublicKey, [privateKey]);
      const secret = new SecretEntity({data: data});
      importResourcesEntity.secrets = new ResourceSecretsCollection([secret]);
    }
  }

  /**
   * Build the secret DTO.
   * @param {ExternalResourceEntity} importResourcesFile The resource to import
   * @returns {string|{password: string, description: *}}
   * @private
   */
  buildSecretDto(importResourcesFile) {
    // @todo sloppy. If the resources types are present, we consider that by default the description should be encrypted.
    if (importResourcesFile.resourceTypeId) {
      const dto = {
        password: importResourcesFile.secretClear || "",
        description: importResourcesFile.description || "",
        totp: importResourcesFile.totp || ""
      };
      // @todo sloppy. We remove the clear secret fields here, but it should be done at a parsing level.
      importResourcesFile.secretClear = "";
      importResourcesFile.description = "";
      importResourcesFile.totp = null;
      return dto;
    }
    return importResourcesFile.secretClear;
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
   * @param {ImportResourcesFileEntity} importResourcesFile The import object
   * @returns {Promise<void>}
   * @private
   */
  async bulkImportResources(importResourcesFile) {
    const resourcesCollection = new ResourcesCollection(
      importResourcesFile.importResources.toResourceCollectionImportDto()
    );
    let importedCount = 0;
    console.log(importedCount);
    const callbacks = resourcesCollection.resources.map((resourceEntity, index) => async() => {
      try {
        const data = resourceEntity.toV4Dto({secrets: true});
        const contain = {permission: true, favorite: true, tags: true, folder: true};
        const resourceDto = await this.resourceService.create(data, contain);
        const createdResourceEntity = new ResourceEntity(resourceDto);
        this.handleImportResourceSuccess(importResourcesFile, ++importedCount, createdResourceEntity, importResourcesFile.importResources.items[index]);

        return createdResourceEntity;
      } catch (error) {
        console.error(error);
        this.handleImportResourceError(importResourcesFile, ++importedCount, error, importResourcesFile.importResources.items[index]
        );
      }
    });

    if (callbacks.length > 0) {
      const createdResources = await this.executeConcurrentlyService.execute(callbacks, 5);
      await ResourceLocalStorage.addResources(createdResources);
    }
  }


  /**
   * Handle resource import success
   * @param {ImportResourcesFileEntity} importResourcesFile The import
   * @param {int} importedCount The number of resource imported (with success or no)
   * @param {ResourceEntity} resourceEntity The created resource
   * @param {ExternalResourceEntity} externalResourceEntity The external resource entity at the source of the create
   * @private
   */
  async handleImportResourceSuccess(importResourcesFile, importedCount, resourceEntity, externalResourceEntity) {
    externalResourceEntity.id = resourceEntity.id;
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
