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
 * @since         5.1.0
 */
import OrganizationSettingsModel from "../../model/organizationSettings/organizationSettingsModel";
import UserGpgKeyPoliciesSettingsApiService from "../api/userGpgKeyPolicies/userGpgKeyPoliciesSettingsApiService";
import UserGpgKeyPoliciesSettingsEntity from "passbolt-styleguide/src/shared/models/entity/userGpgKeyPolicies/UserGpgKeyPoliciesSettingsEntity";

/**
 * The service aims to find the user gpg key policies settings from the API.
 */
export default class FindUserGpgKeyPoliciesSettingsService {
  /**
   * @constructor
   * @param {ApiClientOptions} apiClientOptions
   * @param {AccountEntity|null} account the account associated to the worker. It could be null if the service is
   *  executed in the context of a user registration process.
   */
  constructor(apiClientOptions, account = null) {
    this.account = account;
    this.organizationSettingsModel = new OrganizationSettingsModel(apiClientOptions);
    this.userGpgKeyPoliciesSettingsApiService = new UserGpgKeyPoliciesSettingsApiService(apiClientOptions);
  }

  /**
   * Retrieve the user gpg key policies settings as guest.
   * @param {string} userId The user ID.
   * @param {string} authenticationToken The authentication token UUID.
   * @returns {Promise<UserGpgKeyPoliciesSettingsEntity>}
   */
  async findSettingsAsGuest(userId, authenticationToken) {
    // todo assert authentication token

    const organizationSettings = await this.organizationSettingsModel.getOrFind();
    const isUserGpgKeyPoliciesPluginEnabled = organizationSettings.isPluginEnabled("UserGpgKeyPolicies");

    if (isUserGpgKeyPoliciesPluginEnabled) {
      try {
        const dto = await this.userGpgKeyPoliciesSettingsApiService.findSettingsAsGuest(userId, authenticationToken);
        return UserGpgKeyPoliciesSettingsEntity.createFromDefault(dto);
      } catch (error) {
        console.error(error);
      }
    }

    return UserGpgKeyPoliciesSettingsEntity.createFromDefault();
  }
}
