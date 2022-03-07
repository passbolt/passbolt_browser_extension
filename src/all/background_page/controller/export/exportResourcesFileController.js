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
const {User} = require('../../model/user');

const progressController = require('../progress/progressController');
const passphraseController = require('../passphrase/passphraseController');
const fileController = require('../fileController');

const {ResourcesExporter} = require("../../model/export/resourcesExporter");
const {ResourceTypeModel} = require("../../model/resourceType/resourceTypeModel");
const {FolderModel} = require('../../model/folder/folderModel');
const {ResourceModel} = require('../../model/resource/resourceModel');

const {ExternalResourcesCollection} = require("../../model/entity/resource/external/externalResourcesCollection");
const {ExternalFoldersCollection} = require("../../model/entity/folder/external/externalFoldersCollection");
const {ExportResourcesFileEntity} = require("../../model/entity/export/exportResourcesFileEntity");

const {i18n} = require('../../sdk/i18n');
const {DecryptMessageService} = require("../../service/crypto/decryptMessageService");
const {GetDecryptedUserPrivateKeyService} = require("../../service/account/getDecryptedUserPrivateKeyService");

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

    // Progress
    this.progressGoal = 100;
    this.progress = 0;
  }

  /**
   * Main execution function.
   * @return {Promise}
   */
  async exec(exportResourcesFileDto) {
    const userId = User.getInstance().get().id;

    try {
      const exportEntity = new ExportResourcesFileEntity(exportResourcesFileDto);
      await this.prepareExportContent(exportEntity);
      const privateKey = await this.getPrivateKey();
      await this.decryptSecrets(exportEntity, userId, privateKey);
      await this.export(exportEntity);
      await this.download(exportEntity);
      await progressController.update(this.worker, this.progressGoal, i18n.t('Generate file'));
      await progressController.close(this.worker);
      return exportEntity;
    } catch (error) {
      await progressController.close(this.worker);
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
    await progressController.open(this.worker, i18n.t("Exporting ..."), progressGoals, i18n.t('Initialize'));
    await progressController.update(this.worker, ++this.progress);

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
   * @returns {Promise<void>}
   */
  async decryptSecrets(exportEntity, userId, privateKey) {
    let i = 0;
    const resourcesTypesCollection = await this.resourceTypeModel.getOrFindAll();
    for (const exportResourceEntity of exportEntity.exportResources.items) {
      i++;
      await progressController.update(this.worker, ++this.progress, i18n.t('Decrypting {{counter}}/{{total}}', {counter: i, total: exportEntity.exportResources.items.length}));
      let secretClear = await DecryptMessageService.decrypt(exportResourceEntity.secrets.items[0].data, privateKey);

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
    await fileController.saveFile(filename, blobFile, mimeType, this.worker.tab.id);
  }
}


exports.ExportResourcesFileController = ExportResourcesFileController;
