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
 * @since         5.0.0
 */

import FileService from "../../service/file/fileService";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";

class DownloadOrganizationGeneratedKey {
  /**
   * Constructor
   * @param {Worker} worker
   * @param {string} requestId uuid
   */
  constructor(worker, requestId) {
    this.worker = worker;
    this.requestId = requestId;
  }

  /**
   * Wrapper of exec function to run it with worker.
   *
   * @return {Promise<void>}
   */
  async _exec() {
    try {
      await this.exec.apply(this, arguments);
      this.worker.port.emit(this.requestId, "SUCCESS");
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, "ERROR", error);
    }
  }

  /**
   * Check the user can continue the account recovery process.
   *
   * @param {string} armoredPrivateKey
   * @return {Promise<void>}
   */
  async exec(armoredPrivateKey) {
    const privateKey = await OpenpgpAssertion.readKeyOrFail(armoredPrivateKey);
    const keyId = privateKey.getKeyID().toHex().slice(8, 16);
    const date = new Date().toISOString().slice(0, 10);
    await FileService.saveFile(`organization-recovery-private-key_${date}_${keyId}.asc`, armoredPrivateKey, "text/plain", this.worker.tab.id);
  }
}

export default DownloadOrganizationGeneratedKey;
