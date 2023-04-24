/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         4.0.0
 */
import SsoDataStorage from "../../service/indexedDB_storage/ssoDataStorage";

class UpdateLocalSsoProviderController {
  /**
   * UpdateLocalSsoProviderController constructor
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
   * @param {string} ssoProviderId the new provider ID to set locally
   * @return {Promise<void>}
   */
  async _exec(ssoProviderId) {
    try {
      await this.exec(ssoProviderId);
      this.worker.port.emit(this.requestId, "SUCCESS");
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, "ERROR", error);
    }
  }

  /**
   * Updates the Authenticate the user using a third-party SSO provider.
   *
   * @param {string} ssoProviderId the new provider ID to set locally
   * @return {Promise<void>}
   */
  async exec(ssoProviderId) {
    await SsoDataStorage.updateLocalKitProviderWith(ssoProviderId);
  }
}

export default UpdateLocalSsoProviderController;
