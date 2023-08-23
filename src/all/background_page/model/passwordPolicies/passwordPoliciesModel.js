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
 * @since         4.2.0
 */
import PasswordPoliciesService from "../../service/api/passwordPolicies/passwordPoliciesService";
import PasswordPoliciesEntity from "../entity/passwordPolicies/passwordPoliciesEntity";
import PasswordPoliciesLocalStorage from "../../service/local_storage/passwordPoliciesLocalStorage";

class PasswordPoliciesModel {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(account, apiClientOptions) {
    this.passwordPoliciesService = new PasswordPoliciesService(apiClientOptions);
    this.passwordPoliciesLocalStorage = new PasswordPoliciesLocalStorage(account);
  }

  /**
   * Find the current password policies from the API.
   * @returns {Promise<PasswordPoliciesEntity|null>}
   * @private
   */
  async find() {
    try {
      const passwordGeneratorSettingsDto = await this.passwordPoliciesService.find();
      return PasswordPoliciesEntity.createFromDefault(passwordGeneratorSettingsDto);
    } catch (error) {
      console.error(error);
    }
    return null;
  }

  /**
   * Find the current password policies from the local storage.
   * @returns {Promise<PasswordGeneratPasswordPoliciesEntityorEntity|null>}
   * @private
   */
  async get() {
    const passwordGeneratorSettingsDto = await this.passwordPoliciesLocalStorage.get();
    if (!passwordGeneratorSettingsDto) {
      return null;
    }
    const passwordPoliciesEntity = passwordGeneratorSettingsDto;
    return PasswordPoliciesEntity.createFromDefault(passwordPoliciesEntity);
  }

  /**
   * Get the password policies from the local storage or from the API as a fallback.
   * @return {Promise<PasswordPoliciesEntity|null>}
   */
  async getOrFind() {
    let passwordPoliciesEntity = await this.get();
    if (!passwordPoliciesEntity) {
      passwordPoliciesEntity = await this.find();
      await this.passwordPoliciesLocalStorage.set(passwordPoliciesEntity);
    }
    return passwordPoliciesEntity;
  }

  /**
   * Save the given configuration on the API and then on the local storage.
   *
   * @param {PasswordPoliciesEntity} passwordPoliciesEntity
   * @return {Promise<PasswordPoliciesEntity>} the saved entity from the API
   */
  async save(passwordPoliciesEntity) {
    const passwordPoliciesDto = passwordPoliciesEntity.toDto(PasswordPoliciesEntity.ALL_CONTAIN_OPTIONS);
    const savedDto = await this.passwordPoliciesService.save(passwordPoliciesDto);
    const newPasswordPoliciesEntity = new PasswordPoliciesEntity(savedDto);
    await this.passwordPoliciesLocalStorage.set(newPasswordPoliciesEntity);
    return newPasswordPoliciesEntity;
  }
}

export default PasswordPoliciesModel;
