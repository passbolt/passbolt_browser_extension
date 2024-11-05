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
import GetPassphraseService from "../../service/passphrase/getPassphraseService";
import ProgressService from "../../service/progress/progressService";
import ExportResourcesFileEntity from "../../model/entity/export/exportResourcesFileEntity";
import i18n from "../../sdk/i18n";
import FileService from "../../service/file/fileService";
import ExportResourcesService from "../../service/resource/export/exportResourcesService";

const INITIAL_PROGRESS_GOAL = 100;
class ExportResourcesFileController {
  /**
   * ExportResourcesFileController constructor
   * @param {Worker} worker
   * @param {string} requestId
   * @param {ApiClientOptions} apiClientOptions the api client options
   * @param {AccountEntity} account the account associated to the worker
   */
  constructor(worker, requestId, apiClientOptions, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.progressService = new ProgressService(this.worker, i18n.t("Exporting ..."));
    this.getPassphraseService = new GetPassphraseService(account);
    this.exportResourcesService = new ExportResourcesService(account, apiClientOptions, this.progressService);
  }

  /**
   * Wrapper of exec function to run it with worker.
   * @param {object} exportResourcesFileDto The export resources file DTO
   * @return {Promise<void>}
   */
  async _exec(exportResourcesFileDto) {
    try {
      const result = await this.exec(exportResourcesFileDto);
      this.worker.port.emit(this.requestId, "SUCCESS", result);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Main execution function.
   * @return {Promise<ExportResourcesFileEntity>}
   */
  async exec(exportResourcesFileDto) {
    //Assert the param through the entity
    const exportResourcesFileEntity = new ExportResourcesFileEntity(exportResourcesFileDto);
    this.progressService.start(INITIAL_PROGRESS_GOAL, i18n.t("Generate file"));
    try {
      await this.exportResourcesService.prepareExportContent(exportResourcesFileEntity);
      const passphrase = await this.getPassphraseService.getPassphrase(this.worker);
      await this.exportResourcesService.exportToFile(exportResourcesFileEntity, passphrase);
      const date = new Date().toISOString().slice(0, 10);
      const filename = `passbolt-export-${date}.${exportResourcesFileEntity.fileType}`;
      const mimeType = {kdbx: "application/x-keepass", csv: "text/csv"}[exportResourcesFileEntity.fileType] || "text/plain";
      const blobFile = exportResourcesFileEntity.toBlob(mimeType);
      await FileService.saveFile(filename, blobFile, mimeType, this.worker.tab.id);
      await this.progressService.finishStep(i18n.t('Done'), true);
      return exportResourcesFileEntity;
    } finally {
      await this.progressService.close();
    }
  }
}


export default ExportResourcesFileController;
