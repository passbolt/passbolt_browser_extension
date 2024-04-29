/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SARL (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         4.7.0
 */
import AuthVerifyServerKeyService from "../../service/api/auth/authVerifyServerKeyService";
import Keyring from "../../model/keyring";

class ReplaceServerKeyController {
  /**
   * AuthVerifyServerKeyController Constructor
   *
   * @param {Worker} worker
   * @param {string} requestId
   * @param {ApiClientOptions} apiClientOptions
   * @param {AccountEntity} account
   */
  constructor(worker, requestId, apiClientOptions, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.authVerifyServerKeyService = new AuthVerifyServerKeyService(apiClientOptions);
    this.account = account;
  }

  /**
   * Controller executor.
   * @returns {Promise<void>}
   */
  async _exec() {
    try {
      const serverKey = await this.exec();
      this.worker.port.emit(this.requestId, 'SUCCESS', serverKey);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Perform a GPGAuth verify
   *
   * @returns {Promise<{armored_key: string, fingerprint: string}>}
   */
  async exec() {
    const keyring = new Keyring();
    const serverKeyDto = await this.authVerifyServerKeyService.getServerKey();
    await keyring.importServerPublicKey(serverKeyDto.armored_key, this.account.domain);
  }
}

export default ReplaceServerKeyController;
