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
import Keyring from "../../model/keyring";
import GetGpgKeyInfoService from "../../service/crypto/getGpgKeyInfoService";


class GetKeyInfoController {
  /**
   * Constructor
   * @param {Worker} worker
   * @param {string} requestId uuid
   */
  constructor(worker, requestId) {
    this.worker = worker;
    this.requestId = requestId;
    this.keyring = new Keyring();
  }

  /**
   * Wrapper of exec function to run it with worker.
   *
   * @param {string} armoredKey The armored key to get the info from.
   */
  async _exec(armoredKey) {
    try {
      const externalGpgKeyEntity = await this.exec(armoredKey);
      this.worker.port.emit(this.requestId, "SUCCESS", externalGpgKeyEntity);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Get the given armored key information.
   *
   * @param {string} armoredKey The armored key to get the info from.
   * @returns {Promise<ExternalGpgKeyEntity>}
   */
  async exec(armoredKey) {
    if (!armoredKey) {
      throw new Error('An armored key must be provided');
    }

    const key = await OpenpgpAssertion.readKeyOrFail(armoredKey);
    return await GetGpgKeyInfoService.getKeyInfo(key);
  }
}

export default GetKeyInfoController;
