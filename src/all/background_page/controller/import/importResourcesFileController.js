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
import GetPassphraseService from "../../service/passphrase/getPassphraseService";
import ImportResourcesFileEntity from "../../model/entity/import/importResourcesFileEntity";
import i18n from "../../sdk/i18n";
import ProgressService from "../../service/progress/progressService";
import ImportResourcesService from "../../service/resource/import/ImportResourcesService";
import {assertBase64String} from "../../utils/assertions";
import FileTypeError from "../../error/fileTypeError";

const INITIAL_PROGRESS_GOAL = 100;
class ImportResourcesFileController {
  /**
   * ImportResourcesFileController constructor
   * @param {Worker} worker
   * @param {ApiClientOptions} apiClientOptions the api client options
   * @param {AccountEntity} account the account associated to the worker
   */
  constructor(worker, requestId, apiClientOptions, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.progressService = new ProgressService(this.worker, i18n.t("Importing ..."));
    this.getPassphraseService = new GetPassphraseService(account);
    this.importResourcesService = new ImportResourcesService(account, apiClientOptions, this.progressService);
  }


  /**
   * Wrapper of exec function to run it with worker.
   * @param {string} fileType The file type.
   * @param {string} file The file in base64
   * @param {object?} options (optional) The import options
   * @return {Promise<void>}
   */
  async _exec(fileType, file, options) {
    try {
      const result = await this.exec(fileType, file, options);
      this.worker.port.emit(this.requestId, "SUCCESS", result);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Import the resources provided from a file.
   *
   * @return {Promise<ImportResourcesFileEntity>}
   */
  async exec(fileType, file, options) {
    //assert file extension
    if (!ImportResourcesFileEntity.SUPPORTED_FILE_TYPES.includes(fileType)) {
      throw new FileTypeError("The file type is not supported");
    }
    //assert file type
    assertBase64String(file);
    const passphrase = await this.getPassphraseService.getPassphrase(this.worker);

    this.progressService.start(INITIAL_PROGRESS_GOAL, i18n.t('Initialize'));
    await this.progressService.finishStep(null, true);
    try {
      const importEntity = ImportResourcesFileEntity.buildImportEntity(fileType, file, options);
      const importedFile = await this.importResourcesService.importFile(importEntity, passphrase);
      return importedFile;
    } finally {
      await this.progressService.close();
    }
  }
}

export default ImportResourcesFileController;
