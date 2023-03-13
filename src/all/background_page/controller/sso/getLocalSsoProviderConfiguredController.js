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
 * @since         3.9.0
 */
import SsoDataStorage from "../../service/indexedDB_storage/ssoDataStorage";

class GetLocalSsoProviderConfiguredController {
  /**
   * GetLocalSsoProviderConfiguredController constructor
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
      const ssoProvider = await this.exec();
      this.worker.port.emit(this.requestId, "SUCCESS", ssoProvider);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, "ERROR", error);
    }
  }

  /**
   * Get the current SSO client data if any.
   *
   * @return {Promise<string|null>}
   */
  async exec() {
    let data;
    try {
      data = await SsoDataStorage.get();
    } catch (e) {
      console.error(e);
      return null;
    }

    return data?.isRegistered()
      ? data.provider
      : null;
  }
}

export default GetLocalSsoProviderConfiguredController;
