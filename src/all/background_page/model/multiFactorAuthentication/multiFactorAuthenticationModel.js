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
 */
import UserLocalStorage from "../../service/local_storage/userLocalStorage";
import MultiFactorAuthenticationService from "../../service/api/multiFactorAuthentication/multiFactorAuthenticationService";
import UserEntity from "../entity/user/userEntity";
import MultiFactorAuthenticationPolicyService from '../../service/api/multiFactorAuthentication/multiFactorAuthenticationPolicyService';
import MfaPolicyEntity from '../entity/mfa/mfaPolicyEntity';
import MfaCombinedEnabledProvidersEntity from '../entity/mfa/mfaCombinedEnabledProvidersEntity';

class MultiFactorAuthenticationModel {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    this.multiFactorAuthenticationService = new MultiFactorAuthenticationService(apiClientOptions);
    this.multiFactorAuthenticationPolicyService = new MultiFactorAuthenticationPolicyService(apiClientOptions);
  }

  /**
   * Disable mfa for a user
   *
   * @param {string} userId The user id
   * @returns {Promise<void>}
   * @public
   */
  async disableForUser(userId) {
    await this.multiFactorAuthenticationService.disableMfaForUser(userId);
    const userDto = await UserLocalStorage.getUserById(userId);
    if (userDto) {
      userDto.is_mfa_enabled = false;
      const userEntity = new UserEntity(userDto);
      await UserLocalStorage.updateUser(userEntity);
    }
  }

  /**
   * Return the current MFA policy defined by the organization
   *
   * @returns {Promise<MfaPolicyEntity>}
   * @public
   */
  async getPolicy() {
    const policy = await this.multiFactorAuthenticationPolicyService.find();
    return new MfaPolicyEntity(policy);
  }

  /**
   * Return the mfa settings for an organization and user
   *
   * @returns {Promise<MfaCombinedEnabledProvidersEntity>}
   * @public
   */
  async getMfaSettings() {
    const setting = await this.multiFactorAuthenticationService.getSettings();
    return new MfaCombinedEnabledProvidersEntity(setting);
  }
}

export default MultiFactorAuthenticationModel;
