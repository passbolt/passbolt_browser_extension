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
import UserPassphrasePoliciesEntity from "passbolt-styleguide/src/shared/models/entity/userPassphrasePolicies/userPassphrasePoliciesEntity";

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
   * @return {Promise<{user: UserEntity, accountRecoveryOrganizationPolicy: AccountRecoveryOrganizationPolicyEntity, userPassphrasePolicies: UserPassphrasePoliciesEntity}>}
   * @throws {Error} if options are invalid or API error
   */
  async startSetup(userId, authenticationTokenToken) {
    let user, accountRecoveryOrganizationPolicy, userPassphrasePolicies;

    if (!Validator.isUUID(userId)) {
      throw new TypeError("userId should be a valid uuid.");
    }
    if (!Validator.isUUID(authenticationTokenToken)) {
      throw new TypeError("authenticationTokenToken should be a valid uuid.");
    }

    const result = await this.setupService.findSetupInfo(userId, authenticationTokenToken);
    const userDto = result?.user;
    const accountRecoveryOrganizationPolicyDto = result?.account_recovery_organization_policy;
    const userPassphrasePoliciesDto = result?.user_passphrase_policy;

    if (userDto) {
      user = new UserEntity(userDto);
    }
    if (accountRecoveryOrganizationPolicyDto) {
      accountRecoveryOrganizationPolicy = new AccountRecoveryOrganizationPolicyEntity(accountRecoveryOrganizationPolicyDto);
    }
    if (userPassphrasePoliciesDto) {
      userPassphrasePolicies = new UserPassphrasePoliciesEntity(userPassphrasePoliciesDto);
    }

    return {user, accountRecoveryOrganizationPolicy, userPassphrasePolicies};
  }

  /**
   * Start recover.src/all/background_page/model/entity/accountRecovery/accountRecoveryRequestEntity.js
   * The API will return the necessary data to complete the journey:
   * - user and its meta data
   * - account recovery organization policy
   *
   * @param {string} userId The user id to start the recover for.
   * @param {string} authenticationTokenToken The authentication token.
   * @return {Promise<{user: UserEntity, userPassphrasePolicies: UserPassphrasePoliciesEntity}>}
   */
  async startRecover(userId, authenticationTokenToken) {
    let user, userPassphrasePolicies;

    if (!Validator.isUUID(userId)) {
      throw new TypeError("userId should be a valid uuid.");
    }
    if (!Validator.isUUID(authenticationTokenToken)) {
      throw new TypeError("authenticationTokenToken should be a valid uuid.");
    }

    const result = await this.setupService.findRecoverInfo(userId, authenticationTokenToken);
    const userDto = result?.user;
    const userPassphrasePoliciesDto = result?.user_passphrase_policy;

    if (userDto) {
      user = new UserEntity(userDto);
    }
    if (userPassphrasePoliciesDto) {
      userPassphrasePolicies = new UserPassphrasePoliciesEntity(userPassphrasePoliciesDto);
    }

    return {user, userPassphrasePolicies};
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
