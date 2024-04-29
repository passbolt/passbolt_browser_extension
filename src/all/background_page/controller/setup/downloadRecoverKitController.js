/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.6.0
 */

import FileService from "../../service/file/fileService";
import FindAccountTemporaryService from "../../service/account/findAccountTemporaryService";
// The recovery kit file name.
const RECOVERY_KIT_FILENAME = "passbolt-recovery-kit.asc";

class DownloadRecoveryKitController {
  /**
   * Constructor.
   * @param {Worker} worker The associated worker.
   * @param {string} requestId The associated request id.
   */
  constructor(worker, requestId) {
    this.worker = worker;
    this.requestId = requestId;
  }

  /**
   * Controller executor.
   * @returns {Promise<void>}
   */
  async _exec() {
    try {
      await this.exec();
      this.worker.port.emit(this.requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Download the recovery kit.
   * @returns {Promise<void>}
   */
  async exec() {
    const temporaryAccount = await FindAccountTemporaryService.exec(this.worker.port._port.name);
    if (!temporaryAccount.account?.userPrivateArmoredKey) {
      throw new Error('An account user private armored key is required.');
    }
    const userPrivateArmoredKey = temporaryAccount.account.userPrivateArmoredKey;
    await FileService.saveFile(RECOVERY_KIT_FILENAME, userPrivateArmoredKey, "text/plain", this.worker.tab.id);
  }
}

export default DownloadRecoveryKitController;
