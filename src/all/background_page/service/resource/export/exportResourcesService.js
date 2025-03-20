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
 * @since         4.10.1
 */

import ExternalFoldersCollection from "../../../model/entity/folder/external/externalFoldersCollection";
import ExternalResourcesCollection from "../../../model/entity/resource/external/externalResourcesCollection";
import ExternalTotpEntity from "../../../model/entity/totp/externalTotpEntity";
import ResourcesExporter from "../../../model/export/resourcesExporter";
import FolderModel from "../../../model/folder/folderModel";
import ResourceTypeModel from "../../../model/resourceType/resourceTypeModel";
import i18n from "../../../sdk/i18n";
import DecryptPrivateKeyService from "../../crypto/decryptPrivateKeyService";
import DecryptMetadataService from "../../metadata/decryptMetadataService";
import DecryptAndParseResourceSecretService from "../../secret/decryptAndParseResourceSecretService";
import FindResourcesService from "../findResourcesService";

/**
 * The service aim to export the resources to a file.
 */
class ExportResourcesService {
  /**
   * @constructor
   * @param {ApiClientOptions} apiClientOptions The api client options
   * @param {ProgressService} progressService the progress service initialised by the controller
   */
  constructor(account, apiClientOptions, progressService) {
    this.apiClientOptions = apiClientOptions;
    this.progressService = progressService;
    this.account = account;
    this.findResourcesService = new FindResourcesService(account, apiClientOptions);
    this.decryptMetadataService = new DecryptMetadataService(apiClientOptions, account);
    // Models
    this.resourceTypeModel = new ResourceTypeModel(apiClientOptions);
    this.folderModel = new FolderModel(apiClientOptions, account);
  }

  /**
   * Export resources to file and return the exported format
   * @param {ExportResourcesFileEntity} exportResourcesFileEntity The export entity
   * @param {String} passphrase the user passphrase
   * @return {Promise<void>}
   */
  async exportToFile(exportResourcesFileEntity, passphrase) {
    const privateKey = await DecryptPrivateKeyService.decryptArmoredKey(this.account.userPrivateArmoredKey, passphrase);
    await this.decryptSecrets(exportResourcesFileEntity, privateKey);
    await this.export(exportResourcesFileEntity);
  }

  /**
   * Retrieve the content to export.
   * @param {ExportResourcesFileEntity} exportResourcesFileEntity The export entity
   * @param {String} passphrase the user passphrase
   * @returns {Promise<void>}
   */
  async prepareExportContent(exportResourcesFileEntity, passphrase) {
    const progressGoals = exportResourcesFileEntity.resourcesIds.length + 2; // 1 (initialize & find secrets) + #secrets (to encrypt) + 1 (Complete operation)
    this.progressService.updateGoals(progressGoals);
    await this.progressService.finishStep(i18n.t('Initialize'), true);

    const foldersCollection = await this.folderModel.getAllByIds(exportResourcesFileEntity.foldersIds);
    const exportFoldersCollection = ExternalFoldersCollection.constructFromFoldersCollection(foldersCollection);
    const resourcesCollection = await this.findResourcesService.findAllForDecrypt(exportResourcesFileEntity.resourcesIds);
    await this.decryptMetadataService.decryptAllFromForeignModels(resourcesCollection, passphrase);

    const exportResourcesCollection = ExternalResourcesCollection.constructFromResourcesCollection(resourcesCollection, exportFoldersCollection);
    exportResourcesFileEntity.exportFolders = exportFoldersCollection;
    exportResourcesFileEntity.exportResources = exportResourcesCollection;
  }

  /**
   * Decrypt the secrets.
   * @param {ExportResourcesFileEntity} exportResourcesFileEntity The export object
   * @param {openpgp.PrivateKey} privateKey the encrypted private key for resource decryption
   * @returns {Promise<void>}
   * @private
   */
  async decryptSecrets(exportResourcesFileEntity, privateKey) {
    let i = 0;

    const resourceTypesCollection  = await this.resourceTypeModel.getOrFindAll();
    for (const exportResourceEntity of exportResourcesFileEntity.exportResources.items) {
      i++;
      await this.progressService.finishStep(i18n.t('Decrypting {{counter}}/{{total}}', {counter: i, total: exportResourcesFileEntity.exportResources.items.length}));
      const type = resourceTypesCollection.getFirst('id', exportResourceEntity.resourceTypeId);
      const secretSchema =  type?.definition?.secret;
      const plaintextSecret = await DecryptAndParseResourceSecretService.decryptAndParse(exportResourceEntity.secrets.items[0], secretSchema, privateKey);
      exportResourceEntity.secretClear = plaintextSecret.password || "";
      exportResourceEntity.description = plaintextSecret?.description || exportResourceEntity.description || "";
      if (plaintextSecret.totp) {
        exportResourceEntity.totp = new ExternalTotpEntity(plaintextSecret.totp);
      }
    }
  }

  /**
   * Export
   * @param {ExportResourcesFileEntity} exportResourcesFileEntity The export object
   * @returns {Promise<void>}
   * @private
   */
  async export(exportResourcesFileEntity) {
    const exporter = new ResourcesExporter();
    await exporter.export(exportResourcesFileEntity);
  }
}

export default ExportResourcesService;
