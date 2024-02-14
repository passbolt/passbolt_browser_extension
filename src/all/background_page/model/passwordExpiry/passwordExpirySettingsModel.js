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
import OrganizationSettingsModel from "../organizationSettings/organizationSettingsModel";
import PasswordExpiryProSettingsEntity from "passbolt-styleguide/src/shared/models/entity/passwordExpiryPro/passwordExpiryProSettingsEntity";
import PasswordExpirySettingsLocalStorage from "../../service/local_storage/passwordExpirySettingsLocalStorage";

class PasswordExpirySettingsModel {
  /**
   * Constructor
   *
   * @param {AccountEntity} account the user account
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(account, apiClientOptions) {
    this.passwordExpirySettingsLocalStorage = new PasswordExpirySettingsLocalStorage(account);
    this.passwordExpirySettingsService = new PasswordExpirySettingsService(apiClientOptions);
    this.organisationSettingsModel = new OrganizationSettingsModel(apiClientOptions);
  }

  /**
   * Get the password expiry data from the local storage or find it from the API.
   * The API can send data that is not compatible with what's expected (like CE settings when the PRO is expected)
   * In this case, an exception is catch and we ignore the settings and build new one from scratch to avoid
   * the styleguide to crash.
   * @param {boolean} refreshCache
   * @returns {Promise<PasswordExpirySettingsEntity>}
   */
  async getOrFindOrDefault(refreshCache = false) {
    try {
      if (refreshCache) {
        await this.passwordExpirySettingsLocalStorage.flush();
      }

      let passwordExpirySettingsDto = await this.passwordExpirySettingsLocalStorage.get();
      if (!passwordExpirySettingsDto) {
        passwordExpirySettingsDto = await this.passwordExpirySettingsService.find();
      }
      const passwordExpirySettingsEntity = await this.createFromDefault(passwordExpirySettingsDto);
      this.passwordExpirySettingsLocalStorage.set(passwordExpirySettingsEntity.toDto());
      return passwordExpirySettingsEntity;
    } catch (error) {
      console.error(error);
    }
    const passwordExpirySettingsEntity = await this.createFromDefault();
    this.passwordExpirySettingsLocalStorage.set(passwordExpirySettingsEntity.toDto());
    return passwordExpirySettingsEntity;
  }

  /**
   * Saves the password expiry settings on the API.
   * @param {PasswordExpirySettingsEntity|PasswordExpiryProSettingsEntity} passwordExpirySettingsEntity the entity to register
   * @returns {Promise<PasswordExpirySettingsEntity>}
   */
  async save(passwordExpirySettingsEntity) {
    const organizationSettings = await this.organisationSettingsModel.getOrFind();
    const isAdvancedSettingsEnable = organizationSettings.isPluginEnabled("passwordExpiryPolicies");
    if (!isAdvancedSettingsEnable) {
      assertType(passwordExpirySettingsEntity, PasswordExpirySettingsEntity, 'The given entity is not a PasswordExpirySettingsEntity');
    } else {
      assertType(passwordExpirySettingsEntity, PasswordExpiryProSettingsEntity, 'The given entity is not a PasswordExpiryProSettingsEntity');
    }
    const passwordExpirySettingsDto = await this.passwordExpirySettingsService.create(passwordExpirySettingsEntity);
    const passwordExpirySettingsEntityUpdated = await this.createFromDefault(passwordExpirySettingsDto);
    this.passwordExpirySettingsLocalStorage.set(passwordExpirySettingsEntityUpdated.toDto());
    return passwordExpirySettingsEntityUpdated;
  }

  /**
   * Delete the password expiry settings on the API given an ID.
   * @param {string<UUID>} passwordExpirySettingsId the ID of the entity to delete
   * @returns {Promise<void>}
   */
  async delete(passwordExpirySettingsId) {
    assertUuid(passwordExpirySettingsId, "The password expiry settings id should be a valid uuid.");
    await this.passwordExpirySettingsService.delete(passwordExpirySettingsId);
    await this.passwordExpirySettingsLocalStorage.flush();
  }

  /**
   * Create model based the version using entity
   * @param {Object} passwordExpirySettingsDto the dto to map
   * @returns {Promise<PasswordExpirySettingsEntity|PasswordExpiryProSettingsEntity>}
   */
  async createFromDefault(passwordExpirySettingsDto = {}) {
    const organizationSettings = await this.organisationSettingsModel.getOrFind();
    const isAdvancedSettingsEnabled = organizationSettings.isPluginEnabled("passwordExpiryPolicies");
    if (!isAdvancedSettingsEnabled) {
      return PasswordExpirySettingsEntity.createFromDefault(passwordExpirySettingsDto);
    }
    return PasswordExpiryProSettingsEntity.createFromDefault(passwordExpirySettingsDto);
  }
}

export default PasswordExpirySettingsModel;
