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
import OrganizationSettingsModel from "../../model/organizationSettings/organizationSettingsModel";
import PasswordExpiryProSettingsEntity from "passbolt-styleguide/src/shared/models/entity/passwordExpiryPro/passwordExpiryProSettingsEntity";

class SavePasswordExpirySettingsController {
  /**
   * SavePasswordExpirySettingsController constructor
   * @param {Worker} worker
   * @param {string} requestId uuid
   * @param {AccountEntity} account the account user
   * @param {ApiClientOptions} apiClientOptions the api client options
   */
  constructor(worker, requestId, account, apiClientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.passwordExpirySettingsModel = new PasswordExpirySettingsModel(account, apiClientOptions);
    this.organisationSettingsModel = new OrganizationSettingsModel(apiClientOptions);
  }

  /**
   * Controller executor.
   * @param {Object} passwordExpirySettingsDto the data to save on the API
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
   * @param {Object} passwordExpirySettingsDto the data to save on the API
   * @returns {Promise<PasswordExpirySettingsEntity>}
   */
  async exec(passwordExpirySettingsDto) {
    const organizationSettings = await this.organisationSettingsModel.getOrFind();
    const isAdvancedSettingsEnabled = organizationSettings.isPluginEnabled("passwordExpiryPolicies");
    const entity = isAdvancedSettingsEnabled ? new PasswordExpiryProSettingsEntity(passwordExpirySettingsDto) : new PasswordExpirySettingsEntity(passwordExpirySettingsDto);
    return await this.passwordExpirySettingsModel.save(entity);
  }
}

export default SavePasswordExpirySettingsController;
