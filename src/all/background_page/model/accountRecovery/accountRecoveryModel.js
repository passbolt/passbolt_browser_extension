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
 * @since         3.6.0
 */
const {AccountRecoveryOrganizationPolicyService} = require("../../service/api/accountRecovery/accountRecoveryOrganizationPolicyService");
const {AccountRecoveryOrganizationPolicyEntity} = require("../entity/accountRecovery/accountRecoveryOrganizationPolicyEntity");
const {AccountRecoveryPrivateKeyPasswordsCollection} = require("../entity/accountRecovery/accountRecoveryPrivateKeyPasswordsCollection");
const {AccountRecoveryRequestsCollection} = require("../entity/accountRecovery/accountRecoveryRequestsCollection");
const {AccountRecoveryRequestService} = require("../../service/api/accountRecovery/accountRecoveryRequestService");
const {AccountRecoveryUserService} = require('../../service/api/accountRecovery/accountRecoveryUserService');
const {BuildAccountRecoveryUserSettingEntityService} = require('../../service/accountRecovery/buildAccountRecoveryUserSettingEntityService');
const {AccountRecoveryResponseService} = require("../../service/api/accountRecovery/accountRecoveryResponseService");
const {AccountRecoveryRequestEntity} = require("../entity/accountRecovery/accountRecoveryRequestEntity");
const {AccountRecoveryResponseEntity} = require("../entity/accountRecovery/accountRecoveryResponseEntity");
const {AccountRecoveryPrivateKeyPasswordService} = require('../../service/api/accountRecovery/accountRecoveryPrivateKeyPasswordService');
const {DecryptPrivateKeyService} = require('../../service/crypto/decryptPrivateKeyService');
const {PrivateGpgkeyEntity} = require('../entity/gpgkey/privateGpgkeyEntity');
const {Keyring} = require('../keyring');
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
   * Get an organization settings of an accountRecovery using Passbolt API
   *
   * @return {AccountRecoveryOrganizationPolicyEntity}
   */
  async find() {
    const accountRecoveryOrganizationPolicyDto = await this.accountRecoveryOrganizationPolicyService.find();
    return new AccountRecoveryOrganizationPolicyEntity(accountRecoveryOrganizationPolicyDto);
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
   * Save organization settings of an accountRecovery using Passbolt API
   *
   * @param {AccountRecoveryOrganizationPolicyEntity} accountRecoveryOrganizationPolicyEntity
   * @returns {Promise<AccountRecoveryOrganizationPolicyEntity>}
   */
  async saveUserSetting(accountRecoveryUserSetting, userPasshphrase, accountRecoveryOrganizationPublicKeyEntity) {
    if (accountRecoveryUserSetting.isRejected) {
      this.accountRecoveryUserService.saveUserSetting(accountRecoveryUserSetting);
      return;
    }

    const keyring = new Keyring();
    const decryptedUserPrivateKey = await DecryptPrivateKeyService.decryptPrivateGpgKeyEntity(new PrivateGpgkeyEntity({
      armored_key: keyring.findPrivate().key,
      passphrase: userPasshphrase
    }));

    const accountRecoveryUserSettingEntity = await BuildAccountRecoveryUserSettingEntityService.build(
      accountRecoveryUserSetting.toDto(),
      accountRecoveryOrganizationPublicKeyEntity,
      decryptedUserPrivateKey.armoredKey
    );
    this.accountRecoveryUserService.saveUserSetting(accountRecoveryUserSettingEntity);
  }

  async saveOrganizationSettings(accountRecoveryOrganizationPolicyEntity) {
    const accountRecoveryPolicyDto = accountRecoveryOrganizationPolicyEntity.toDto(AccountRecoveryOrganizationPolicyEntity.ALL_CONTAIN_OPTIONS);
    const savedAccountRecoveryPolicyDto = await this.accountRecoveryOrganizationPolicyService.saveOrganizationSettings(accountRecoveryPolicyDto);
    return new AccountRecoveryOrganizationPolicyEntity(savedAccountRecoveryPolicyDto);
  }

  /**
   * Save the response for the review of an account recovery
   *
   * @param {AccountRecoveryResponseEntity} accountRecoveryResponseEntity
   */
  async saveReview(accountRecoveryResponseEntity) {
    const accountRecoveryResponseDto = await this.accountRecoveryResponseService.saveReview(accountRecoveryResponseEntity.toDto());
    return new AccountRecoveryResponseEntity(accountRecoveryResponseDto);
  }
}

exports.AccountRecoveryModel = AccountRecoveryModel;
