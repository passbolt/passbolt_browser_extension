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
 * @since         5.1.1
 */
import OrganizationSettingsModel from "../../model/organizationSettings/organizationSettingsModel";
import {assertUuid} from "../../utils/assertions";
import UserKeyPoliciesSettingsApiService from "../api/userKeyPolicies/userKeyPoliciesSettingsApiService";
import UserKeyPoliciesSettingsEntity from "passbolt-styleguide/src/shared/models/entity/userKeyPolicies/UserKeyPoliciesSettingsEntity";

/**
 * The service aims to find the user key policies settings from the API.
 */
export default class FindUserKeyPoliciesSettingsService {
  /**
   * @constructor
   * @param {ApiClientOptions} apiClientOptions
   * @param {AccountEntity|null} account the account associated to the worker. It could be null if the service is
   *  executed in the context of a user registration process.
   */
  constructor(apiClientOptions, account = null) {
    this.account = account;
    this.organizationSettingsModel = new OrganizationSettingsModel(apiClientOptions);
    this.userKeyPoliciesSettingsApiService = new UserKeyPoliciesSettingsApiService(apiClientOptions);
  }

  /**
   * Retrieve the user key policies settings as guest.
   * @param {string} userId The user ID.
   * @param {string} authenticationToken The authentication token UUID.
   * @returns {Promise<UserKeyPoliciesSettingsEntity>}
   */
  async findSettingsAsGuest(userId, authenticationToken) {
    assertUuid(userId, "The userId must be a valid UUID");
    assertUuid(authenticationToken, "The authenticationToken must be a valid UUID");

    const organizationSettings = await this.organizationSettingsModel.getOrFind();
    const isUserKeyPoliciesPluginEnabled = organizationSettings.isPluginEnabled("userKeyPolicies");

    if (isUserKeyPoliciesPluginEnabled) {
      try {
        const dto = await this.userKeyPoliciesSettingsApiService.findSettingsAsGuest(userId, authenticationToken);
        return UserKeyPoliciesSettingsEntity.createFromDefault(dto);
      } catch (error) {
        console.error(error);
      }
    }

    return UserKeyPoliciesSettingsEntity.createFromDefault();
  }
}
