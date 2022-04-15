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
const {AccountEntity} = require("../../model/entity/account/accountEntity");
const {AccountModel} = require("../../model/account/accountModel");
const {assertPrivateKeys} = require("../../utils/openpgp/openpgpAssertions");
const {RecoverPrivateKeyService} = require("../../service/accountRecovery/recoverPrivateKeyService");
const {AccountLocalStorage} = require("../../service/local_storage/accountLocalStorage");
const {SetupModel} = require("../../model/setup/setupModel");
const {AccountAccountRecoveryEntity} = require("../../model/entity/account/accountAccountRecoveryEntity");
const {AccountRecoverEntity} = require("../../model/entity/account/accountRecoverEntity");

class AccountRecoveryRecoverAccountController {
  /**
   * AccountRecoveryContinueController constructor
   * @param {Worker} worker
   * @param {string} requestId uuid
   * @param {ApiClientOptions} apiClientOptions
   * @param {AccountAccountRecoveryEntity} account The account completing the account recovery.
   */
  constructor(worker, requestId, apiClientOptions, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.account = account;
    this.accountRecoveryModel = new AccountRecoveryModel(apiClientOptions);
    this.setupModel = new SetupModel(apiClientOptions);
    this.accountModel = new AccountModel(apiClientOptions);
  }

  /**
   * Wrapper of exec function to run it with worker.
   *
   * @param {string} passphrase The passphrase to verify
   * @return {Promise<void>}
   */
  async _exec(passphrase) {
    try {
      await this.exec(passphrase);
      this.worker.port.emit(this.requestId, "SUCCESS");
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Check the user temporary account recovery gpg key passphrase.
   *
   * @param {string} passphrase The passphrase to verify
   * @return {Promise<void>}
   */
  async exec(passphrase) {
    if (typeof passphrase === "undefined") {
      throw new Error("A passphrase is required.");
    }
    if (typeof passphrase !== "string") {
      throw new Error("The passphrase should be a string.");
    }

    const accountRecoveryRequest = await this._findRequest();
    const recoveredArmoredPrivateKey = await this._recoverPrivateKey(accountRecoveryRequest, passphrase);
    const accountRecover = await this._completeRecover(recoveredArmoredPrivateKey);
    const account = await this._addRecoveredAccountToLocalStorage(accountRecover);
    this._updateAccount(account);
  }

  /**
   * Find the account recovery request.
   * @returns {Promise<AccountRecoveryRequestEntity>}
   * @private
   */
  async _findRequest() {
    const accountRecoveryRequest = await this.accountRecoveryModel.findRequestByIdAndUserIdAndAuthenticationToken(
      this.account.accountRecoveryRequestId,
      this.account.userId,
      this.account.authenticationTokenToken
    );
    if (accountRecoveryRequest.id !== this.account.accountRecoveryRequestId) {
      throw new Error("The account recovery request id does not match the account being recovered.");
    }

    return accountRecoveryRequest;
  }

  /**
   * Recover the user private key.
   * @param {AccountRecoveryRequestEntity} accountRecoveryRequest The account recovery request
   * @param {string} passphrase The request user private key passphrase and new private key passphrase
   * @returns {Promise<string>} The recovered private armored key.
   * @private
   */
  async _recoverPrivateKey(accountRecoveryRequest, passphrase) {
    return RecoverPrivateKeyService.recover(
      accountRecoveryRequest.accountRecoveryPrivateKey,
      accountRecoveryRequest.accountRecoveryResponses,
      this.account.userPrivateArmoredKey,
      passphrase
    );
  }

  /**
   * Complete the recover.
   * @param {string} recoveredArmoredPrivateKey The recovered armored private key
   * @returns {Promise<AccountRecoverEntity>}
   * @private
   */
  async _completeRecover(recoveredArmoredPrivateKey) {
    const accountRecoverDto = this.account.toDto(AccountAccountRecoveryEntity.ALL_CONTAIN_OPTIONS);
    const privateOpenpgpKey = await assertPrivateKeys(recoveredArmoredPrivateKey);
    accountRecoverDto.user_private_armored_key = recoveredArmoredPrivateKey;
    accountRecoverDto.user_public_armored_key = privateOpenpgpKey.toPublic().armor();
    const accountRecover = new AccountRecoverEntity(accountRecoverDto);
    await this.setupModel.completeRecover(accountRecover);
    return accountRecover;
  }

  /**
   * Add account to local storage.
   * @param {AccountRecoverEntity} accountRecover The recovered account.
   * @returns {Promise<AccountEntity>}
   * @private
   */
  async _addRecoveredAccountToLocalStorage(accountRecover) {
    const account = new AccountEntity(accountRecover.toDto(AccountRecoverEntity.ALL_CONTAIN_OPTIONS));
    await this.accountModel.add(account);
    await AccountLocalStorage.deleteByUserIdAndType(account.userId, AccountAccountRecoveryEntity.TYPE_ACCOUNT_ACCOUNT_RECOVERY);
    return account;
  }

  /**
   * Update the worker account with the recovered credentials.
   * @param {AccountEntity} account The recovered account
   * @returns {void}
   * @private
   */
  async _updateAccount(account) {
    this.account.userPublicArmoredKey = account.userPublicArmoredKey;
    this.account.userPrivateArmoredKey = account.userPrivateArmoredKey;
  }
}

exports.AccountRecoveryRecoverAccountController = AccountRecoveryRecoverAccountController;
