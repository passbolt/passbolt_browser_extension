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

const {AccountRecoveryModel} = require("../../model/accountRecovery/accountRecoveryModel");
const {DecryptPrivateKeyService} = require("../../service/crypto/decryptPrivateKeyService");
const {AccountRecoveryResponseEntity} = require("../../model/entity/accountRecovery/accountRecoveryResponseEntity");
const {PrivateGpgkeyEntity} = require("../../model/entity/gpgkey/privateGpgkeyEntity");
const {AccountRecoveryPrivateKeyPasswordEntity} = require("../../model/entity/accountRecovery/accountRecoveryPrivateKeyPasswordEntity");
const PassphraseController = require("../passphrase/passphraseController");
const {EncryptMessageService} = require("../../service/crypto/encryptMessageService");
const {Keyring} = require("../../model/keyring");
const {DecryptPrivateKeyPasswordDataService} = require("../../service/accountRecovery/decryptPrivateKeyPasswordDataService");

class ReviewRequestController {
  /**
   * Constructor
   * @param {Worker} worker
   * @param {string} requestId
   * @param {ApiClientOptions} apiClientOptions
   * @param {AccountEntity} account The account associated to the worker
   */
  constructor(worker, requestId, apiClientOptions, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.account = account;
    this.accountRecoveryModel = new AccountRecoveryModel(apiClientOptions);
    this.keyringModel = new Keyring();
  }

  /**
   * Controller executor.
   * @returns {Promise<*>}
   */
  async _exec() {
    try {
      await this.exec.apply(this, arguments);
      this.worker.port.emit(this.requestId, "SUCCESS");
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Review account recovery user request.
   * @param {string} requestId The request to approve or reject.
   * @param {string} status The response status, any of accepted or rejected.
   * @param {Object} [organizationPrivateGpgkeyDto] The account recovery organization private key dto (contains the passphrase). Required only if the response is accepted.
   * @return {Promise<AccountRecoveryResponseEntity>}
   * @throw {Error} If the account recovery is disabled.
   */
  async exec(requestId, status, organizationPrivateGpgkeyDto = null) {
    if (typeof requestId !== "string" || !Validator.isUUID(requestId)) {
      throw new TypeError("requestId should be a valid uuid.");
    }

    let response;
    const organizationPolicy = await this.accountRecoveryModel.findOrganizationPolicy();
    if (organizationPolicy.isDisabled) {
      throw new Error("Sorry the account recovery feature is not enabled for this organization.");
    }

    if (status === AccountRecoveryResponseEntity.STATUS_APPROVED) {
      const organizationPrivateGpgkey = new PrivateGpgkeyEntity(organizationPrivateGpgkeyDto);
      const passphrase = await PassphraseController.get(this.worker);
      response = await this._buildApprovedResponse(requestId, organizationPolicy, organizationPrivateGpgkey, passphrase);
    } else if (status === AccountRecoveryResponseEntity.STATUS_REJECTED) {
      response = this._buildRejectedResponse(requestId, organizationPolicy);
    } else {
      throw new Error("The provided status should be either approved or rejected.");
    }

    return this.accountRecoveryModel.saveReview(response);
  }

  /**
   * Build the rejected response.
   * @param {string} requestId The account organization request id
   * @param {AccountRecoveryOrganizationPolicyEntity} organizationPolicy The account recovery organization policy
   * @returns {AccountRecoveryResponseEntity}
   */
  _buildRejectedResponse(requestId, organizationPolicy) {
    const accountRecoveryResponseDto = {
      status: AccountRecoveryResponseEntity.STATUS_REJECTED,
      account_recovery_request_id: requestId,
      responder_foreign_key: organizationPolicy.publicKeyId,
      responder_foreign_model: AccountRecoveryResponseEntity.RESPONDER_FOREIGN_MODEL_ORGANIZATION_KEY
    };

    return new AccountRecoveryResponseEntity(accountRecoveryResponseDto);
  }

  /**
   * Build the approved response.
   * @param {string} requestId The account organization request id
   * @param {AccountRecoveryOrganizationPolicyEntity} organizationPolicy The account recovery organization policy
   * @param {PrivateGpgkeyEntity} organizationPrivateGpgkey The account recovery organization private key and its associated passphrase.
   * @param {string} signedInUserPassphrase The signed-in user passphrase
   * @returns {AccountRecoveryResponseEntity}
   */
  async _buildApprovedResponse(requestId, organizationPolicy, organizationPrivateGpgkey, signedInUserPassphrase) {
    const organizationPrivateKeyDecrypted = await DecryptPrivateKeyService.decryptPrivateGpgKeyEntity(organizationPrivateGpgkey);
    const signedInUserDecryptedPrivateKey = await DecryptPrivateKeyService.decrypt(this.account.userPrivateArmoredKey, signedInUserPassphrase);
    const request = await this._findAndAssertRequest(requestId);
    const userPublicKey = await this._findUserPublicKey(request.userId);
    const data = await this._encryptResponseData(request, organizationPrivateKeyDecrypted, userPublicKey, signedInUserDecryptedPrivateKey);

    const accountRecoveryResponseDto = {
      status: AccountRecoveryResponseEntity.STATUS_APPROVED,
      account_recovery_request_id: requestId,
      responder_foreign_key: organizationPolicy.publicKeyId,
      responder_foreign_model: AccountRecoveryResponseEntity.RESPONDER_FOREIGN_MODEL_ORGANIZATION_KEY,
      data: data
    };

    return new AccountRecoveryResponseEntity(accountRecoveryResponseDto);
  }

  /**
   * Find and assert the request to review.
   * @param {string} requestId The request identifier.
   * @return {Promise<AccountRecoveryRequestEntity>}
   * @throw {Error} If the request has no associated private key.
   * @throw {Error} If the request user id does not match the private key user id.
   * @throw {Error} If the request private key has no private key passwords associated to it.
   * @throw {Error} If the request private key passwords does not contain one element.
   * @throw {Error} If the request private key password has not for recipient foreign model the organization.
   * @throw {Error} If the request private key password id does not match the private key id.
   * @private
   */
  async _findAndAssertRequest(requestId) {
    const findRequestContains = {account_recovery_private_key_passwords: true, armored_key: true};
    const request = await this.accountRecoveryModel.findRequestById(requestId, findRequestContains);

    const privateKey = request.accountRecoveryPrivateKey;
    if (!privateKey) {
      throw new Error("The request should have an associated private key.");
    }
    if (privateKey.userId !== request.userId) {
      throw new Error("The request user should match the request associated private key user.");
    }
    if (!privateKey.accountRecoveryPrivateKeyPasswords) {
      throw new Error("The account recovery request private key should have a collection of private key passwords.");
    }
    if (privateKey.accountRecoveryPrivateKeyPasswords.length !== 1) {
      throw new Error("The account recovery request private key should have a collection containing exactly one private key password.");
    }

    const privateKeyPassword = privateKey.accountRecoveryPrivateKeyPasswords.items[0];
    if (privateKeyPassword.recipientForeignModel !== AccountRecoveryPrivateKeyPasswordEntity.FOREIGN_MODEL_ORGANIZATION_KEY) {
      throw new Error("The request private key password should be encrypted for the organization key.");
    }
    if (privateKeyPassword.privateKeyId !== privateKey.id) {
      throw new Error("The request private key password private key id should match the request private key id.");
    }

    return request;
  }

  /**
   * Find the user public key.
   * @param {string} userId The user id the private key password belongs to.
   * @returns {Promise<string>}
   * @private
   */
  async _findUserPublicKey(userId) {
    let userPublicKey = this.keyringModel.findPublic(userId);

    if (!userPublicKey) {
      await this.keyringModel.sync();
      userPublicKey = this.keyringModel.findPublic(userId);
      if (!userPublicKey) {
        throw new Error("Cannot find the public key of the user requesting an account recovery.");
      }
    }

    return userPublicKey.armoredKey;
  }

  /**
   * Encrypt response data.
   * @param {AccountRecoveryRequestEntity} request The request to encrypt the response data for.
   * @param {openpgp.PrivateKey|string} organizationPrivateKeyDecrypted The organization decrypted private key.
   * @param {openpgp.PublicKey|string} userPublicKey The public key of the user making the request.
   * @param {openpgp.PrivateKey|string} signedInUserDecryptedPrivateKey The signed-in user decrypted private key.
   * @returns {Promise<string>}
   * @private
   */
  async _encryptResponseData(request, organizationPrivateKeyDecrypted, userPublicKey, signedInUserDecryptedPrivateKey) {
    const privateKeyPassword = request.accountRecoveryPrivateKey.accountRecoveryPrivateKeyPasswords.items[0];
    const privateKeyPasswordData = await DecryptPrivateKeyPasswordDataService.decrypt(privateKeyPassword, organizationPrivateKeyDecrypted, request.userId, userPublicKey);
    const privateKeyPasswordDataSerialized = JSON.stringify(privateKeyPasswordData);

    return EncryptMessageService.encrypt(privateKeyPasswordDataSerialized, request.armoredKey, [organizationPrivateKeyDecrypted, signedInUserDecryptedPrivateKey]);
  }
}

exports.ReviewRequestController = ReviewRequestController;