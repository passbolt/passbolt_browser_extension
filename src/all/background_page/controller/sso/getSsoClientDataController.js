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
 * @since         3.7.3
 */
import SsoDataStorage from "../../service/indexedDB_storage/ssoDataStorage";

class GetSsoClientDataController {
  /**
   * GetSsoClientDataController constructor
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
   * @return {Promise<SsoUserClientDataEntity|null>}
   */
  async _exec() {
    try {
      const ssoClientData = await this.exec();
      this.worker.port.emit(this.requestId, "SUCCESS", ssoClientData);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, "ERROR", error);
    }
  }

  /**
   * Get the current SSO client data if any.
   *
   * @return {Promise<SsoUserClientDataEntity|null>}
   */
  async exec() {
    return SsoDataStorage.get();
  }
}

export default GetSsoClientDataController;
