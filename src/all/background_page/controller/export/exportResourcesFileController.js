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
import ResourceTypeModel from "../../model/resourceType/resourceTypeModel";
import ResourceModel from "../../model/resource/resourceModel";
import GetPassphraseService from "../../service/passphrase/getPassphraseService";
import GetDecryptedUserPrivateKeyService from "../../service/account/getDecryptedUserPrivateKeyService";
import FolderModel from "../../model/folder/folderModel";
import ExternalFoldersCollection from "../../model/entity/folder/external/externalFoldersCollection";
import ProgressService from "../../service/progress/progressService";
import ResourcesExporter from "../../model/export/resourcesExporter";
import ExternalResourcesCollection from "../../model/entity/resource/external/externalResourcesCollection";
import ExportResourcesFileEntity from "../../model/entity/export/exportResourcesFileEntity";
import i18n from "../../sdk/i18n";
import FileService from "../../service/file/fileService";
import DecryptAndParseResourceSecretService from "../../service/secret/decryptAndParseResourceSecretService";
import TotpEntity from "../../model/entity/totp/totpEntity";

const INITIAL_PROGRESS_GOAL = 100;
class ExportResourcesFileController {
  /**
   * ExportResourcesFileController constructor
   * @param {Worker} worker
   * @param {ApiClientOptions} apiClientOptions the api client options
   * @param {AccountEntity} account the account associated to the worker
   */
  constructor(worker, apiClientOptions, account) {
    this.worker = worker;

    // Models
    this.resourceTypeModel = new ResourceTypeModel(apiClientOptions);
    this.resourceModel = new ResourceModel(apiClientOptions, account);
    this.folderModel = new FolderModel(apiClientOptions);

    this.progressService = new ProgressService(this.worker, i18n.t("Exporting ..."));
    this.getPassphraseService = new GetPassphraseService(account);
  }

  /**
   * Main execution function.
   * @return {Promise}
   */
  async exec(exportResourcesFileDto) {
    try {
      this.progressService.start(INITIAL_PROGRESS_GOAL, i18n.t("Generate file"));
      const exportEntity = new ExportResourcesFileEntity(exportResourcesFileDto);
      await this.prepareExportContent(exportEntity);
      const privateKey = await this.getPrivateKey();
      await this.decryptSecrets(exportEntity, privateKey);
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
    const passphrase = await this.getPassphraseService.getPassphrase(this.worker);
    return GetDecryptedUserPrivateKeyService.getKey(passphrase);
  }

  /**
   * Decrypt the secrets.
   * @param {ExportResourcesFileEntity} exportEntity The export object
   * @param {openpgp.PrivateKey} privateKey the encrypted private key for resource decryption
   * @returns {Promise<void>}
   * @todo UserId variable does not seem to be used.
   */
  async decryptSecrets(exportEntity, privateKey) {
    let i = 0;
    for (const exportResourceEntity of exportEntity.exportResources.items) {
      i++;
      await this.progressService.finishStep(i18n.t('Decrypting {{counter}}/{{total}}', {counter: i, total: exportEntity.exportResources.items.length}));

      const secretSchema = await this.resourceTypeModel.getSecretSchemaById(exportResourceEntity.resourceTypeId);
      const plaintextSecret = await DecryptAndParseResourceSecretService.decryptAndParse(exportResourceEntity.secrets.items[0], secretSchema, privateKey);
      exportResourceEntity.secretClear = plaintextSecret.password || "";
      exportResourceEntity.description = plaintextSecret?.description || exportResourceEntity.description || "";
      if (plaintextSecret.totp) {
        exportResourceEntity.totp = new TotpEntity(plaintextSecret.totp);
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
