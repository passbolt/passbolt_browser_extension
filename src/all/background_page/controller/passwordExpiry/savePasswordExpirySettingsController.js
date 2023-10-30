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
import PasswordExpirySettingsEntity from "passbolt-styleguide/src/shared/models/entity/passwordExpiry/passwordExpirySettingsEntity";
import PasswordExpirySettingsModel from "../../model/passwordExpiry/passwordExpirySettingsModel";

class SavePasswordExpirySettingsController {
  /**
   * SavePasswordExpirySettingsController constructor
   * @param {Worker} worker
   * @param {string} requestId uuid
   * @param {ApiClientOptions} apiClientOptions the api client options
   */
  constructor(worker, requestId, apiClientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.passwordExpirySettingsModel = new PasswordExpirySettingsModel(apiClientOptions);
  }

  /**
   * Controller executor.
   * @param {PasswordExpirySettingsDto} passwordExpirySettingsDto the data to save on the API
   * @returns {Promise<void>}
   */
  async _exec(passwordExpirySettingsDto) {
    try {
      const settings = await this.exec(passwordExpirySettingsDto);
      this.worker.port.emit(this.requestId, "SUCCESS", settings);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Save the given user passphrase policies on the API.
   * @param {PasswordExpirySettingsDto} passwordExpirySettingsDto the data to save on the API
   * @returns {Promise<PasswordExpirySettingsEntity>}
   */
  async exec(passwordExpirySettingsDto) {
    const entity = new PasswordExpirySettingsEntity(passwordExpirySettingsDto);
    return await this.passwordExpirySettingsModel.save(entity);
  }
}

export default SavePasswordExpirySettingsController;
