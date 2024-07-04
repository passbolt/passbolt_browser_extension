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

import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import GpgkeyModel from "../../model/gpgKey/gpgkeyModel";
import GetGpgKeyInfoService from "../../service/crypto/getGpgKeyInfoService";


class GetUserKeyInfoController {
  /**
   * GetUserKeyInfoController constructor
   * @param {Worker} worker
   * @param {string} requestId uuid
   */
  constructor(worker, requestId) {
    this.worker = worker;
    this.requestId = requestId;
    this.gpgkeyModel = new GpgkeyModel();
  }

  /**
   * Wrapper of exec function to run it with worker.
   *
   * @param {string} userId The id of the user from whom to get the key information.
   */
  async _exec(userId) {
    try {
      const keyInfo = await this.exec(userId);
      this.worker.port.emit(this.requestId, "SUCCESS", keyInfo);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Get the given user key information.
   *
   * @param {string} userId The id of the user from whom to get the key information.
   * @returns {Promise<ExternalGpgKeyEntity>}
   */
  async exec(userId) {
    const keyInfo = await this.gpgkeyModel.getOrFindUserGpgKey(userId);
    if (!keyInfo) {
      //@todo maybe send a KeyringError instead
      throw new Error('User key not found');
    }

    const key = await OpenpgpAssertion.readKeyOrFail(keyInfo.armoredKey);
    return GetGpgKeyInfoService.getKeyInfo(key);
  }
}

export default GetUserKeyInfoController;
