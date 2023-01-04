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
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import DecryptMessageService from "../../service/crypto/decryptMessageService";
import User from "../../model/user";
import ResourceTypeModel from "../../model/resourceType/resourceTypeModel";
import ResourceModel from "../../model/resource/resourceModel";
import {PassphraseController as passphraseController} from "../passphrase/passphraseController";
import GetDecryptedUserPrivateKeyService from "../../service/account/getDecryptedUserPrivateKeyService";
import FolderModel from "../../model/folder/folderModel";
import ExternalFoldersCollection from "../../model/entity/folder/external/externalFoldersCollection";
import ProgressService from "../../service/progress/progressService";
import ResourcesExporter from "../../model/export/resourcesExporter";
import ExternalResourcesCollection from "../../model/entity/resource/external/externalResourcesCollection";
import ExportResourcesFileEntity from "../../model/entity/export/exportResourcesFileEntity";
import i18n from "../../sdk/i18n";
import FileService from "../../service/file/fileService";

const INITIAL_PROGRESS_GOAL = 100;
class ExportResourcesFileController {
  /**
   * ExportResourcesFileController constructor
   * @param {Worker} worker
   * @param {ApiClientOptions} clientOptions
   */
  constructor(worker, clientOptions) {
    this.worker = worker;

    // Models
    this.resourceTypeModel = new ResourceTypeModel(clientOptions);
    this.resourceModel = new ResourceModel(clientOptions);
    this.folderModel = new FolderModel(clientOptions);

    this.progressService = new ProgressService(this.worker, i18n.t("Exporting ..."));
  }

  /**
   * Main execution function.
   * @return {Promise}
   */
  async exec(exportResourcesFileDto) {
    const userId = User.getInstance().get().id;

    try {
      this.progressService.start(INITIAL_PROGRESS_GOAL, i18n.t("Generate file"));
      const exportEntity = new ExportResourcesFileEntity(exportResourcesFileDto);
      await this.prepareExportContent(exportEntity);
      const privateKey = await this.getPrivateKey();
      await this.decryptSecrets(exportEntity, userId, privateKey);
      await this.export(exportEntity);
      await this.download(exportEntity);
      await this.progressService.finishStep(i18n.t('Done'), true);
      await this.progressService.close();
      return exportEntity;
    } catch (error) {
      await this.progressService.close();
      throw error;
    }
  }

  /**
   * Retrieve the content to export.
   * @param {ExportResourcesFileEntity} exportEntity The export entity
   * @returns {Promise<void>}
   */
  async prepareExportContent(exportEntity) {
    const progressGoals = exportEntity.resourcesIds.length + 2; // 1 (initialize & find secrets) + #secrets (to encrypt) + 1 (Complete operation)
    this.progressService.updateGoals(progressGoals);
    await this.progressService.finishStep(i18n.t('Initialize'), true);

    const foldersCollection = await this.folderModel.getAllByIds(exportEntity.foldersIds);
    const exportFoldersCollection = ExternalFoldersCollection.constructFromFoldersCollection(foldersCollection);
    const resourcesCollection = await this.resourceModel.findAllForDecrypt(exportEntity.resourcesIds);
    const exportResourcesCollection = ExternalResourcesCollection.constructFromResourcesCollection(resourcesCollection, exportFoldersCollection);
    exportEntity.exportFolders = exportFoldersCollection;
    exportEntity.exportResources = exportResourcesCollection;
  }

  /**
   * Get the user private key decrypted
   * @returns {Promise<openpgp.PrivateKey>}
   */
  async getPrivateKey() {
    const passphrase = await passphraseController.get(this.worker);
    return GetDecryptedUserPrivateKeyService.getKey(passphrase);
  }

  /**
   * Decrypt the secrets.
   * @param {ExportResourcesFileEntity} exportEntity The export object
   * @param {string} userId The user id to decrypt the secret for
   * @param {openpgp.PrivateKey} privateKey the encrypted private key for resource decryption
   * @returns {Promise<void>}
   * @todo UserId variable does not seem to be used.
   */
  async decryptSecrets(exportEntity, userId, privateKey) {
    let i = 0;
    const resourcesTypesCollection = await this.resourceTypeModel.getOrFindAll();
    for (const exportResourceEntity of exportEntity.exportResources.items) {
      i++;
      await this.progressService.finishStep(i18n.t('Decrypting {{counter}}/{{total}}', {counter: i, total: exportEntity.exportResources.items.length}));
      const secretMessage = await OpenpgpAssertion.readMessageOrFail(exportResourceEntity.secrets.items[0].data);
      let secretClear = await DecryptMessageService.decrypt(secretMessage, privateKey);

      // @deprecated Prior to v3, resources have no resource type. Remove this condition with v4.
      if (!exportResourceEntity.resourceTypeId) {
        exportResourceEntity.secretClear = secretClear;
        continue;
      }

      const resourceType = resourcesTypesCollection.getFirst('id', exportResourceEntity.resourceTypeId);
      if (resourceType && resourceType.slug === 'password-and-description') {
        secretClear = await this.resourceModel.deserializePlaintext(exportResourceEntity.resourceTypeId, secretClear);
        exportResourceEntity.description = secretClear.description;
        exportResourceEntity.secretClear = secretClear.password;
      } else {
        exportResourceEntity.secretClear = secretClear;
      }
    }
  }

  /**
   * Export
   * @param {ExportResourcesFileEntity} exportEntity The export object
   * @returns {Promise<void>}
   */
  async export(exportEntity) {
    const exporter = new ResourcesExporter();
    await exporter.export(exportEntity);
  }

  /**
   * Get mime type from file extension.
   * @param {string} extension kdbx or csv or text/plain
   * @return {string}
   */
  getMimeType(extension) {
    let mimeType = "text/plain";
    switch (extension) {
      case "kdbx":
        mimeType = "application/x-keepass";
        break;
      case "csv":
        mimeType = "text/csv";
        break;
    }

    return mimeType;
  }

  /**
   * Propose the file to download.
   * @param {ExportResourcesFileEntity} exportEntity The export entity
   * @returns {Promise<void>}
   */
  async download(exportEntity) {
    const date = new Date().toISOString().slice(0, 10);
    const filename = `passbolt-export-${date}.${exportEntity.fileType}`;
    const mimeType = this.getMimeType(exportEntity.fileType);
    const blobFile = new Blob([exportEntity.file], {type: mimeType});
    await FileService.saveFile(filename, blobFile, mimeType, this.worker.tab.id);
  }
}


export default ExportResourcesFileController;
