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

import PasswordExpirySettingsService from "../../service/api/passwordExpiry/passwordExpirySettingsService";
import {assertType, assertUuid} from "../../utils/assertions";
import PasswordExpirySettingsEntity from "passbolt-styleguide/src/shared/models/entity/passwordExpiry/passwordExpirySettingsEntity";

class PasswordExpirySettingsModel {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    this.passwordExpirySettingsService = new PasswordExpirySettingsService(apiClientOptions);
  }

  /**
   * Find the current password expiry settings from the API.
   * @returns {Promise<PasswordExpirySettingsEntity>}
   */
  async findOrDefault() {
    let passwordExpirySettingsDto = null;
    try {
      passwordExpirySettingsDto = await this.passwordExpirySettingsService.find();
      return PasswordExpirySettingsEntity.createFromDefault(passwordExpirySettingsDto);
    } catch (error) {
      console.error(error);
    }
    return PasswordExpirySettingsEntity.createFromDefault();
  }

  /**
   * Saves the password expiry settings on the API.
   * @param {PasswordExpirySettingsEntity} passwordExpirySettingsEntity the entity to register
   * @returns {Promise<PasswordExpirySettingsEntity>}
   */
  async save(passwordExpirySettingsEntity) {
    assertType(passwordExpirySettingsEntity, PasswordExpirySettingsEntity, 'The given entity is not a PasswordExpirySettingsEntity');
    const passwordExpirySettingsDto = await this.passwordExpirySettingsService.create(passwordExpirySettingsEntity);
    return PasswordExpirySettingsEntity.createFromDefault(passwordExpirySettingsDto);
  }

  /**
   * Delete the password expiry settings on the API given an ID.
   * @param {string<UUID>} passwordExpirySettingsId the ID of the entity to delete
   * @returns {Promise<void>}
   */
  async delete(passwordExpirySettingsId) {
    assertUuid(passwordExpirySettingsId, "The password expiry settings id should be a valid uuid.");
    await this.passwordExpirySettingsService.delete(passwordExpirySettingsId);
  }
}

export default PasswordExpirySettingsModel;
