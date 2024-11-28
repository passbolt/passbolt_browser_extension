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
import i18n from "../../sdk/i18n";
import ProgressService from "../../service/progress/progressService";
import MoveOneFolderService, {PROGRESS_STEPS_MOVE_FOLDER_MOVE_ONE} from "../../service/move/moveOneFolderService";
import ConfirmMoveStrategyService from "../../service/move/confirmMoveStrategyService";
import FolderModel from "../../model/folder/folderModel";
import {assertUuid} from "../../utils/assertions";

class MoveFolderController {
  /**
   * MoveFolderController constructor
   *
   * @param {Worker} worker
   * @param {string} requestId
   * @param {ApiClientOptions} apiClientOptions the api client options
   * @param {AccountEntity} account the account associated to the worker
   */
  constructor(worker, requestId, apiClientOptions, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.progressService = new ProgressService(this.worker);
    this.getPassphraseService = new GetPassphraseService(account);
    this.moveOneFolderService = new MoveOneFolderService(apiClientOptions, account, this.progressService);
    this.confirmMoveStrategyService = new ConfirmMoveStrategyService(worker);
    this.folderModel = new FolderModel(apiClientOptions, account);
  }

  /**
   * Wrapper of exec function to run it with worker.
   *
   * @return {Promise<void>}
   */
  async _exec(folderId, destinationFolderId) {
    try {
      await this.exec(folderId, destinationFolderId);
      this.worker.port.emit(this.requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Move one folder.
   *
   * @param {string} folderId The folder id to move
   * @param {string|null} [destinationFolderId] The destination folder id or null for the root folder
   * @return {Promise<void>}
   * @throws {TypeError} If the folderId is not a UUID
   * @throws {TypeError} If the destinationFolderId is not a UUID
   * @throws {Error} If the folderId is equal to destinationFolderId
   */
  async exec(folderId, destinationFolderId = null) {
    assertUuid(folderId, "The parameter \"folderId\" should be a UUID");
    if (destinationFolderId !== null) {
      assertUuid(destinationFolderId, "The parameter \"destinationFolderId\" should be a UUID");
    }
    if (folderId === destinationFolderId) {
      throw new Error(i18n.t("The folder cannot be moved inside itself."));
    }

    const passphrase = await this.getPassphraseService.getPassphrase(this.worker);

    this.progressService.start(PROGRESS_STEPS_MOVE_FOLDER_MOVE_ONE, i18n.t('Initialize'));

    try {
      await this.moveOneFolderService.moveOne(folderId, destinationFolderId, this.confirmMoveStrategyService, passphrase);
      this.progressService.finishStep(i18n.t('Done!'), true);
    } finally {
      this.progressService.close();
    }
  }
}

export default MoveFolderController;
