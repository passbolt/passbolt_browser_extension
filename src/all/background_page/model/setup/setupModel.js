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
import AccountRecoveryOrganizationPolicyEntity from "../entity/accountRecovery/accountRecoveryOrganizationPolicyEntity";
import UserService from "../../service/api/user/userService";
import SetupService from "../../service/api/setup/setupService";
import UserEntity from "../entity/user/userEntity";
import Validator from "validator";

class SetupModel {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    this.setupService = new SetupService(apiClientOptions);
    this.userService = new UserService(apiClientOptions);
  }

  /**
   * Start recover.
   * The API will return the necessary data to complete the journey:
   * - user and its meta data
   * - account recovery organization policy
   *
   * @param {string} userId The user id to start the setup for.
   * @param {string} authenticationTokenToken The authentication token.
   * @return {Promise<{user: UserEntity, accountRecoveryOrganizationPolicy: AccountRecoveryOrganizationPolicyEntity}>}
   * @throws {Error} if options are invalid or API error
   */
  async startSetup(userId, authenticationTokenToken) {
    let user, accountRecoveryOrganizationPolicy, userDto, accountRecoveryOrganizationPolicyDto;

    if (!Validator.isUUID(userId)) {
      throw new TypeError("userId should be a valid uuid.");
    }
    if (!Validator.isUUID(authenticationTokenToken)) {
      throw new TypeError("authenticationTokenToken should be a valid uuid.");
    }

    try {
      const result = await this.setupService.findSetupInfo(userId, authenticationTokenToken);
      userDto = result?.user;
      accountRecoveryOrganizationPolicyDto = result?.account_recovery_organization_policy;
    } catch (error) {
      // If the entry point doesn't exist or return a 500, the API version is <v3.
      const code = error.data && error.data.code;
      if (code === 404 || code === 500) {
        userDto = await this.setupService.findLegacySetupInfo(userId, authenticationTokenToken);
      } else {
        throw error;
      }
    }

    if (userDto) {
      user = new UserEntity(userDto);
    }
    if (accountRecoveryOrganizationPolicyDto) {
      accountRecoveryOrganizationPolicy = new AccountRecoveryOrganizationPolicyEntity(accountRecoveryOrganizationPolicyDto);
    }

    return {user, accountRecoveryOrganizationPolicy};
  }

  /**
   * Start recover.src/all/background_page/model/entity/accountRecovery/accountRecoveryRequestEntity.js
   * The API will return the necessary data to complete the journey:
   * - user and its meta data
   * - account recovery organization policy
   *
   * @param {string} userId The user id to start the recover for.
   * @param {string} authenticationTokenToken The authentication token.
   * @return {Promise<{user: UserEntity, accountRecoveryOrganizationPolicy: AccountRecoveryOrganizationPolicyEntity}>}
   */
  async startRecover(userId, authenticationTokenToken) {
    let user, accountRecoveryOrganizationPolicy, userDto, accountRecoveryOrganizationPolicyDto;

    if (!Validator.isUUID(userId)) {
      throw new TypeError("userId should be a valid uuid.");
    }
    if (!Validator.isUUID(authenticationTokenToken)) {
      throw new TypeError("authenticationTokenToken should be a valid uuid.");
    }

    try {
      const result = await this.setupService.findRecoverInfo(userId, authenticationTokenToken);
      userDto = result?.user;
      accountRecoveryOrganizationPolicyDto = result?.account_recovery_organization_policy;
    } catch (error) {
      // If the entry point doesn't exist or return a 500, the API version is <v3.
      const code = error.data && error.data.code;
      if (code === 404 || code === 500) {
        userDto = await this.setupService.findLegacyRecoverInfo(userId, authenticationTokenToken);
      } else {
        throw error;
      }
    }
    if (userDto) {
      user = new UserEntity(userDto);
    }
    if (accountRecoveryOrganizationPolicyDto) {
      accountRecoveryOrganizationPolicy = new AccountRecoveryOrganizationPolicyEntity(accountRecoveryOrganizationPolicyDto);
    }

    return {user, accountRecoveryOrganizationPolicy};
  }

  /**
   * Complete the setup.
   * @param {AccountSetupEntity} account The account being set up.
   * @returns {Promise<void>}
   * @throws {Error} if options are invalid or API error
   */
  async completeSetup(account) {
    const completeDto = account.toCompleteSetupDto();
    await this.setupService.complete(account.userId, completeDto);
  }

  /**
   * Complete the recover.
   * @param {AccountRecoverEntity|AccountAccountRecoveryEntity} account The account being recovered.
   * @returns {Promise<void>}
   */
  async completeRecover(account) {
    const recoverCompleteDto = account.toCompleteRecoverDto();
    await this.setupService.completeRecover(account.userId, recoverCompleteDto);
  }

  /**
   * Abort recover request.
   * @param {AccountRecoverEntity|AccountAccountRecoveryEntity} account The account to abort the recover request for.
   * @returns {Promise<void>}
   */
  async abortRecover(account) {
    const abortRecoverDto = account.toAbortRecoverDto();
    await this.setupService.abort(account.userId, abortRecoverDto);
  }
}

export default SetupModel;
