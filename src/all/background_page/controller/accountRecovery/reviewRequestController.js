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

import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import Keyring from "../../model/keyring";
import EncryptMessageService from "../../service/crypto/encryptMessageService";
import UserLocalStorage from "../../service/local_storage/userLocalStorage";
import AccountRecoveryModel from "../../model/accountRecovery/accountRecoveryModel";
import DecryptPrivateKeyService from "../../service/crypto/decryptPrivateKeyService";
import {PassphraseController} from "../passphrase/passphraseController";
import DecryptPrivateKeyPasswordDataService from "../../service/accountRecovery/decryptPrivateKeyPasswordDataService";
import AccountRecoveryPrivateKeyPasswordEntity from "../../model/entity/accountRecovery/accountRecoveryPrivateKeyPasswordEntity";
import AccountRecoveryResponseEntity from "../../model/entity/accountRecovery/accountRecoveryResponseEntity";
import UserEntity from "../../model/entity/user/userEntity";
import PrivateGpgkeyEntity from "../../model/entity/gpgkey/privateGpgkeyEntity";
import Validator from "validator";

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
    const request = await this._findAndAssertRequest(requestId);

    if (status === AccountRecoveryResponseEntity.STATUS_APPROVED) {
      const organizationPrivateGpgkey = new PrivateGpgkeyEntity(organizationPrivateGpgkeyDto);
      const passphrase = await PassphraseController.get(this.worker);
      response = await this._buildApprovedResponse(request, organizationPolicy, organizationPrivateGpgkey, passphrase);
    } else if (status === AccountRecoveryResponseEntity.STATUS_REJECTED) {
      response = this._buildRejectedResponse(requestId, organizationPolicy);
    } else {
      throw new Error("The provided status should be either approved or rejected.");
    }

    const accountRecoveryResponse = await this.accountRecoveryModel.saveReview(response);
    await this._updateUserLocalStorage(request.userId);

    return accountRecoveryResponse;
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
   * @param {AccountRecoveryRequestEntity} request The user account recovery request.
   * @param {AccountRecoveryOrganizationPolicyEntity} organizationPolicy The account recovery organization policy.
   * @param {PrivateGpgkeyEntity} organizationPrivateGpgkey The account recovery organization private key and its associated passphrase.
   * @param {string} signedInUserPassphrase The signed-in user passphrase
   * @returns {AccountRecoveryResponseEntity}
   */
  async _buildApprovedResponse(request, organizationPolicy, organizationPrivateGpgkey, signedInUserPassphrase) {
    const organizationPrivateKey = await OpenpgpAssertion.readKeyOrFail(organizationPrivateGpgkey.armoredKey);
    const userPrivateKey = await OpenpgpAssertion.readKeyOrFail(this.account.userPrivateArmoredKey);
    const organizationPrivateKeyDecrypted = await DecryptPrivateKeyService.decrypt(organizationPrivateKey, organizationPrivateGpgkey.passphrase);
    const signedInUserDecryptedPrivateKey = await DecryptPrivateKeyService.decrypt(userPrivateKey, signedInUserPassphrase);

    const userPublicKey = await OpenpgpAssertion.readKeyOrFail(await this._findUserPublicKey(request.userId));
    const data = await this._encryptResponseData(request, organizationPrivateKeyDecrypted, userPublicKey, signedInUserDecryptedPrivateKey);

    const accountRecoveryResponseDto = {
      status: AccountRecoveryResponseEntity.STATUS_APPROVED,
      account_recovery_request_id: request.id,
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
   * @param {openpgp.PrivateKey} organizationPrivateKeyDecrypted The organization decrypted private key.
   * @param {openpgp.PublicKey} userPublicKey The public key of the user making the request.
   * @param {openpgp.PrivateKey} signedInUserDecryptedPrivateKey The signed-in user decrypted private key.
   * @returns {Promise<string>}
   * @private
   */
  async _encryptResponseData(request, organizationPrivateKeyDecrypted, userPublicKey, signedInUserDecryptedPrivateKey) {
    const verificationDomain = this.account.domain;
    const privateKeyPassword = request.accountRecoveryPrivateKey.accountRecoveryPrivateKeyPasswords.items[0];
    const privateKeyPasswordData = await DecryptPrivateKeyPasswordDataService.decrypt(privateKeyPassword, organizationPrivateKeyDecrypted, verificationDomain, request.userId, userPublicKey);
    const privateKeyPasswordDataSerialized = JSON.stringify(privateKeyPasswordData);
    const requestKey = await OpenpgpAssertion.readKeyOrFail(request.armoredKey);
    return EncryptMessageService.encrypt(privateKeyPasswordDataSerialized, requestKey, [organizationPrivateKeyDecrypted, signedInUserDecryptedPrivateKey]);
  }

  /**
   * Update the user local storage and remove the pending associated account recovery request.
   * @param {string} userId The identifier of the user to update.
   * @return {Promise<void>}
   */
  async _updateUserLocalStorage(userId) {
    const userDto = await UserLocalStorage.getUserById(userId);
    userDto.pending_account_recovery_request = null;
    const user = new UserEntity(userDto);
    await UserLocalStorage.updateUser(user);
  }
}

export default ReviewRequestController;
