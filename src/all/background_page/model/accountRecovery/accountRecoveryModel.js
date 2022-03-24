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
const {AccountRecoveryOrganizationPolicyService} = require("../../service/api/accountRecovery/accountRecoveryOrganizationPolicyService");
const {AccountRecoveryOrganizationPolicyEntity} = require("../entity/accountRecovery/accountRecoveryOrganizationPolicyEntity");
const {AccountRecoveryPrivateKeyPasswordsCollection} = require("../entity/accountRecovery/accountRecoveryPrivateKeyPasswordsCollection");
const {AccountRecoveryRequestsCollection} = require("../entity/accountRecovery/accountRecoveryRequestsCollection");
const {AccountRecoveryRequestService} = require("../../service/api/accountRecovery/accountRecoveryRequestService");
const {AccountRecoveryUserService} = require('../../service/api/accountRecovery/accountRecoveryUserService');
const {AccountRecoveryResponseService} = require("../../service/api/accountRecovery/accountRecoveryResponseService");
const {AccountRecoveryRequestEntity} = require("../entity/accountRecovery/accountRecoveryRequestEntity");
const {AccountRecoveryResponseEntity} = require("../entity/accountRecovery/accountRecoveryResponseEntity");
const {AccountRecoveryPrivateKeyPasswordService} = require('../../service/api/accountRecovery/accountRecoveryPrivateKeyPasswordService');
const {AccountRecoveryUserSettingEntity} = require("../entity/accountRecovery/accountRecoveryUserSettingEntity");
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
  }

  /**
   * Find the organization policy using Passbolt API
   *
   * @return {AccountRecoveryOrganizationPolicyEntity|null}
   */
  async findOrganizationPolicy() {
    const contains = {'creator': true, 'creator.gpgkey': true};
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
   * @return {AccountRecoveryRequestsCollection}
   */
  async findUserRequests(userId) {
    const accountRecoveryRequestsCollectionDto = await this.accountRecoveryRequestService.findByUser(userId);
    return new AccountRecoveryRequestsCollection(accountRecoveryRequestsCollectionDto);
  }

  /**
   * Get request by id of an accountRecovery using Passbolt API
   *
   * @return {AccountRecoveryRequestEntity}
   */
  async findRequestById(id) {
    const accountRecoveryRequestDto = await this.accountRecoveryRequestService.findById(id);
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
   */
  async saveReview(accountRecoveryResponseEntity) {
    const accountRecoveryResponseDto = accountRecoveryResponseEntity.toDto(AccountRecoveryResponseEntity);
    const savedAccountRecoveryResponseDto = await this.accountRecoveryResponseService.saveReview(accountRecoveryResponseDto);
    return new AccountRecoveryResponseEntity(savedAccountRecoveryResponseDto);
  }
}

exports.AccountRecoveryModel = AccountRecoveryModel;
