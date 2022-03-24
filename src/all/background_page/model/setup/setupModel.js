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
const {UserEntity} = require("../entity/user/userEntity");
const {SetupService} = require("../../service/api/setup/setupService");
const {UserService} = require("../../service/api/user/userService");
const {AccountRecoveryOrganizationPolicyEntity} = require("../entity/accountRecovery/accountRecoveryOrganizationPolicyEntity");

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
   * Retrieve setup information and populate the setup entity with it.
   *
   * @param {SetupEntity} setupEntity The setup entity
   * @returns {Promise<void>}
   * @throws {Error} if options are invalid or API error
   */
  async findSetupInfo(setupEntity) {
    let userDto, accountRecoveryOrganizationPolicyDto;
    try {
      const result = await this.setupService.findSetupInfo(setupEntity.userId, setupEntity.authenticationTokenToken);
      userDto = result?.user;
      accountRecoveryOrganizationPolicyDto = result?.account_recovery_organization_policy;
    } catch (error) {
      // If the entry point doesn't exist or return a 500, the API version is <v3.
      const code = error.data && error.data.code;
      if (code === 404 || code === 500) {
        userDto = await this.setupService.findLegacySetupInfo(setupEntity.userId, setupEntity.authenticationTokenToken);
      } else {
        throw error;
      }
    }
    if (userDto) {
      setupEntity.user = new UserEntity(userDto);
    }
    if (accountRecoveryOrganizationPolicyDto) {
      setupEntity.accountRecoveryOrganizationPolicy = new AccountRecoveryOrganizationPolicyEntity(accountRecoveryOrganizationPolicyDto);
    }
  }

  /**
   * Retrieve recover information and populate the recover entity with it.
   *
   * @param {SetupEntity} recoverEntity The recover entity
   * @returns {Promise<void>}
   * @throws {Error} if options are invalid or API error
   */
  async findRecoverInfo(recoverEntity) {
    let userDto, accountRecoveryOrganizationPolicyDto;
    try {
      const result = await this.setupService.findRecoverInfo(recoverEntity.userId, recoverEntity.authenticationTokenToken);
      userDto = result?.user;
      accountRecoveryOrganizationPolicyDto = result?.account_recovery_organization_policy;
    } catch (error) {
      // If the entry point doesn't exist or return a 500, the API version is <v3.
      const code = error.data && error.data.code;
      if (code === 404 || code === 500) {
        userDto = await this.setupService.findLegacyRecoverInfo(recoverEntity.userId, recoverEntity.authenticationTokenToken);
      } else {
        throw error;
      }
    }
    if (userDto) {
      recoverEntity.user = new UserEntity(userDto);
    }
    if (accountRecoveryOrganizationPolicyDto) {
      recoverEntity.accountRecoveryOrganizationPolicy = new AccountRecoveryOrganizationPolicyEntity(accountRecoveryOrganizationPolicyDto);
    }
  }

  /**
   * Complete the setup.
   * @param {SetupEntity} setupEntity The setup entity
   * @returns {Promise<void>}
   * @throws {Error} if options are invalid or API error
   */
  async complete(setupEntity) {
    const completeDto = setupEntity.toCompleteDto();
    await this.setupService.complete(setupEntity.userId, completeDto);
  }

  /**
   * Complete the recovery
   * @param {SetupEntity} setupEntity The setup entity
   * @returns {Promise<void>}
   * @throws {Error} if options are invalid or API error
   */
  async completeRecovery(setupEntity) {
    const completeDto = setupEntity.toCompleteDto();
    await this.setupService.completeRecovery(setupEntity.userId, completeDto);
  }
}

exports.SetupModel = SetupModel;
