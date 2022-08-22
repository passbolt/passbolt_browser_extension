/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.6.0
 */
import AccountRecoveryOrganizationPolicyService from "../../service/api/accountRecovery/accountRecoveryOrganizationPolicyService";
import AccountRecoveryOrganizationPolicyEntity from "../entity/accountRecovery/accountRecoveryOrganizationPolicyEntity";
import AccountRecoveryRequestService from "../../service/api/accountRecovery/accountRecoveryRequestService";
import AccountRecoveryUserService from "../../service/api/accountRecovery/accountRecoveryUserService";
import AccountRecoveryResponseService from "../../service/api/accountRecovery/accountRecoveryResponseService";
import AccountRecoveryPrivateKeyPasswordService from "../../service/api/accountRecovery/accountRecoveryPrivateKeyPasswordService";
import AccountRecoveryContinueService from "../../service/api/accountRecovery/accountRecoveryContinueService";
import SetupService from "../../service/api/setup/setupService";
import AccountRecoveryPrivateKeyPasswordsCollection from "../entity/accountRecovery/accountRecoveryPrivateKeyPasswordsCollection";
import AccountRecoveryResponseEntity from "../entity/accountRecovery/accountRecoveryResponseEntity";
import AccountRecoveryRequestEntity from "../entity/accountRecovery/accountRecoveryRequestEntity";
import AccountRecoveryRequestsCollection from "../entity/accountRecovery/accountRecoveryRequestsCollection";
import AccountRecoveryUserSettingEntity from "../entity/accountRecovery/accountRecoveryUserSettingEntity";
import Validator from "validator";

/**
 * Model related to the account recovery
 */
class AccountRecoveryModel {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    this.accountRecoveryOrganizationPolicyService = new AccountRecoveryOrganizationPolicyService(apiClientOptions);
    this.accountRecoveryRequestService = new AccountRecoveryRequestService(apiClientOptions);
    this.accountRecoveryUserService = new AccountRecoveryUserService(apiClientOptions);
    this.accountRecoveryResponseService = new AccountRecoveryResponseService(apiClientOptions);
    this.accountRecoveryPrivateKeyPasswordService = new AccountRecoveryPrivateKeyPasswordService(apiClientOptions);
    this.accountRecoveryContinueService = new AccountRecoveryContinueService(apiClientOptions);
    this.setupService = new SetupService(apiClientOptions);
  }

  /**
   * Find the organization policy using Passbolt API
   *
   * @param {Object} [contains] optional example: {creator: true, creator.gpgkey: true}
   * @return {Promise<AccountRecoveryOrganizationPolicyEntity|null>}
   */
  async findOrganizationPolicy(contains = {}) {
    const accountRecoveryOrganizationPolicyDto = await this.accountRecoveryOrganizationPolicyService.find(contains);
    if (!accountRecoveryOrganizationPolicyDto) {
      return null;
    }

    const entity = new AccountRecoveryOrganizationPolicyEntity(accountRecoveryOrganizationPolicyDto);
    if (entity.isDisabled && entity.creator) {
      await AccountRecoveryOrganizationPolicyEntity.assertValidCreatorGpgkey(entity);
    }
    return entity;
  }

  /**
   * Get user requests of an accountRecovery using Passbolt API
   *
   * @param {object} [filters] additional filters to supply to the find query
   * @return {Promise<AccountRecoveryRequestsCollection>}
   */
  async findUserRequests(filters = {}) {
    const accountRecoveryRequestsCollectionDto = await this.accountRecoveryRequestService.findByUser(filters);
    return new AccountRecoveryRequestsCollection(accountRecoveryRequestsCollectionDto);
  }

  /**
   * Find account recovery request by id.
   *
   * @param {string} id The request id
   * @param {Object} [contains] optional example: {creator: true, creator.gpgkey: true}
   * @return {Promise<AccountRecoveryRequestEntity>}
   */
  async findRequestById(id, contains = {}) {
    if (!Validator.isUUID(id)) {
      throw new TypeError(`id should be a valid uuid.`);
    }
    const accountRecoveryRequestDto = await this.accountRecoveryRequestService.findById(id, contains);
    return new AccountRecoveryRequestEntity(accountRecoveryRequestDto);
  }

  /**
   * Get all account recovery private key passwords user for the account recovery process.
   *
   * @return {Promise<AccountRecoveryPrivateKeyPasswordsCollection>}
   */
  async findAccountRecoveryPrivateKeyPasswords() {
    const accountRecoveryPrivateKeyPasswordsCollectionDto = await this.accountRecoveryPrivateKeyPasswordService.findAll();
    return new AccountRecoveryPrivateKeyPasswordsCollection(accountRecoveryPrivateKeyPasswordsCollectionDto);
  }

  /**
   * Save account recovery user setting.
   *
   * @param {AccountRecoveryUserSettingEntity} accountRecoveryUserSetting The user settings to save
   * @returns {Promise<AccountRecoveryUserSettingEntity>}
   */
  async saveUserSetting(accountRecoveryUserSetting) {
    const accountRecoveryUserSettingDto = accountRecoveryUserSetting.toDto(AccountRecoveryUserSettingEntity.ALL_CONTAIN_OPTIONS);
    const savedAccountRecoveryUserSettingDto = await this.accountRecoveryUserService.saveUserSetting(accountRecoveryUserSettingDto);
    return new AccountRecoveryUserSettingEntity(savedAccountRecoveryUserSettingDto);
  }

  /**
   * Save the organization policy.
   *
   * @param {AccountRecoveryOrganizationPolicyEntity} accountRecoveryOrganizationPolicyEntity The organization policy to save.
   * @returns {Promise<AccountRecoveryOrganizationPolicyEntity>}
   */
  async saveOrganizationPolicy(accountRecoveryOrganizationPolicyEntity) {
    const accountRecoveryPolicyDto = accountRecoveryOrganizationPolicyEntity.toDto(AccountRecoveryOrganizationPolicyEntity.ALL_CONTAIN_OPTIONS);
    const savedAccountRecoveryPolicyDto = await this.accountRecoveryOrganizationPolicyService.saveOrganizationPolicy(accountRecoveryPolicyDto);
    return new AccountRecoveryOrganizationPolicyEntity(savedAccountRecoveryPolicyDto);
  }

  /**
   * Save the account recovery response.
   *
   * @param {AccountRecoveryResponseEntity} accountRecoveryResponseEntity The account recovery response to save.
   * @return {Promise<AccountRecoveryResponseEntity>}
   */
  async saveReview(accountRecoveryResponseEntity) {
    const accountRecoveryResponseDto = accountRecoveryResponseEntity.toDto();
    const savedAccountRecoveryResponseDto = await this.accountRecoveryResponseService.saveReview(accountRecoveryResponseDto);
    return new AccountRecoveryResponseEntity(savedAccountRecoveryResponseDto);
  }

  /**
   * Check if a user can continue the account recovery journey.
   * It will throw an exception if the user cannot.
   *
   * @param {string} userId The user id who continues the account recovery
   * @param {string} authenticationTokenToken The authentication token
   * @return {Promise<void>}
   */
  async continue(userId, authenticationTokenToken) {
    if (!Validator.isUUID(userId)) {
      throw new TypeError(`userId should be a valid uuid.`);
    }
    if (!Validator.isUUID(authenticationTokenToken)) {
      throw new TypeError(`authenticationTokenToken should be a valid uuid.`);
    }
    await this.accountRecoveryContinueService.continue(userId, authenticationTokenToken);
  }

  /**
   * Find the account recovery request associated to the stored temporary recovery account.
   *
   * @param {string} requestId The request id to retrieve
   * @param {string} userId The user id that initiates the request
   * @param {string} authenticationTokenToken The authentication token
   * @return {AccountRecoveryRequestEntity}
   */
  async findRequestByIdAndUserIdAndAuthenticationToken(requestId, userId, authenticationTokenToken) {
    if (!Validator.isUUID(requestId)) {
      throw new TypeError(`requestId should be a valid uuid.`);
    }
    if (!Validator.isUUID(userId)) {
      throw new TypeError(`userId should be a valid uuid.`);
    }
    if (!Validator.isUUID(authenticationTokenToken)) {
      throw new TypeError(`authenticationTokenToken should be a valid uuid.`);
    }
    const accountRecoveryRequestDto = await this.accountRecoveryRequestService.findRequestByIdAndUserIdAndAuthenticationToken(requestId, userId, authenticationTokenToken);
    return new AccountRecoveryRequestEntity(accountRecoveryRequestDto);
  }
}

export default AccountRecoveryModel;
