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
 * @since         4.4.0
 */
import PasswordExpirySettingsModel from "../../model/passwordExpiry/passwordExpirySettingsModel";

class DeletePasswordExpirySettingsController {
  /**
   * DeletePasswordExpirySettingsController constructor
   * @param {Worker} worker
   * @param {string} requestId uuid
   * @param {AccountEntity} account the account user
   * @param {ApiClientOptions} apiClientOptions the api client options
   */
  constructor(worker, requestId, account, apiClientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.passwordExpirySettingsModel = new PasswordExpirySettingsModel(account, apiClientOptions);
  }

  /**
   * Controller executor.
   * @param {string<UUID>} passwordExpiryId the ID of the password expiry to delete
   * @returns {Promise<void>}
   */
  async _exec(passwordExpiryId) {
    try {
      const settings = await this.exec(passwordExpiryId);
      this.worker.port.emit(this.requestId, "SUCCESS", settings);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Retrieve the current password expiry settings.
   * @param {string<UUID>} passwordExpiryId the ID of the password expiry to delete
   * @returns {Promise<void>}
   */
  async exec(passwordExpiryId) {
    await this.passwordExpirySettingsModel.delete(passwordExpiryId);
  }
}

export default DeletePasswordExpirySettingsController;
