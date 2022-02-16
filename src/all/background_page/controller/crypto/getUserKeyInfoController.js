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

const {Keyring} = require('../../model/keyring');
const {GetGpgKeyInfoService} = require('../../service/crypto/getGpgKeyInfoService');

class GetUserKeyInfoController {
  /**
   * GetUserKeyInfoController constructor
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
   * @returns {Promise<KeyInfo>}
   */
  async exec(userId) {
    let key = this.keyring.findPublic(userId);

    // If the key is not in the keyring, try to sync the keyring and try again
    if (!key) {
      await this.keyring.sync();
      key = this.keyring.findPublic(userId);

      if (!key) {
        //@todo maybe send a KeyringError instead
        throw new Error('User key not found');
      }
    }
    return await GetGpgKeyInfoService.getKeyInfo(key.armoredKey);
  }
}

exports.GetUserKeyInfoController = GetUserKeyInfoController;
