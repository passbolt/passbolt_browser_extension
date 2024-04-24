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
import SetupModel from "../../model/setup/setupModel";
import AccountRecoveryUserSettingEntity from "../../model/entity/accountRecovery/accountRecoveryUserSettingEntity";
import WorkerService from "../../service/worker/workerService";
import AuthVerifyServerKeyService from "../../service/api/auth/authVerifyServerKeyService";
import AccountRecoverEntity from "../../model/entity/account/accountRecoverEntity";
import AccountTemporaryEntity from "../../model/entity/account/accountTemporaryEntity";
import AccountTemporarySessionStorageService from "../../service/sessionStorage/accountTemporarySessionStorageService";

class StartRecoverController {
  /**
   * Constructor.
   * @param {Worker} worker The associated worker.
   * @param {string} requestId The associated request id.
   * @param {ApiClientOptions} apiClientOptions The api client options.
   * @param {AccountRecoverEntity} account The account being recovered.
   */
  constructor(worker, requestId, apiClientOptions, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.account = account;
    this.authVerifyServerKeyService = new AuthVerifyServerKeyService(apiClientOptions);
    this.setupModel = new SetupModel(apiClientOptions);
    this.temporaryAccount = null;
  }

  /**
   * Controller executor.
   * @returns {Promise<void>}
   */
  async _exec() {
    try {
      await this.exec();
      this.worker.port.emit(this.requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Import user key.
   * @returns {Promise<AccountEntity>}
   */
  async exec() {
    try {
      await this._buildTemporaryAccountEntity();
      await this._findAndSetAccountServerPublicKey();
      const {user, userPassphrasePolicies} = await this.setupModel.startRecover(this.temporaryAccount.account.userId, this.temporaryAccount.account.authenticationTokenToken);
      // Keep the user passphrase policies in the setup temporary account storage.
      if (userPassphrasePolicies) {
        this.temporaryAccount.userPassphrasePolicies = userPassphrasePolicies;
      }
      this._setAccountUserMeta(user);
      // Set all data in the temporary account stored
      await AccountTemporarySessionStorageService.set(this.temporaryAccount);
    } catch (error) {
      await this._handleUnexpectedError(error);
    }
  }

  /**
   * Built the account temporary.
   * @returns {Promise<void>}
   * @private
   */
  async _buildTemporaryAccountEntity() {
    const temporaryAccountDto = {
      account: this.account.toDto(AccountRecoverEntity.ALL_CONTAIN_OPTIONS),
      worker_id: this.worker.port._port.name
    };
    this.temporaryAccount = new AccountTemporaryEntity(temporaryAccountDto);
  }

  /**
   * Find and set the account server public key.
   * @returns {Promise<void>}
   * @private
   */
  async _findAndSetAccountServerPublicKey() {
    const serverKeyDto = await this.authVerifyServerKeyService.getServerKey();
    const serverKey = await OpenpgpAssertion.readKeyOrFail(serverKeyDto.armored_key);
    OpenpgpAssertion.assertPublicKey(serverKey);
    // associate the server public key to the current account.
    this.temporaryAccount.account.serverPublicArmoredKey = serverKey.armor();
  }

  /**
   * Find and set account user meta.
   * @param {object} user the data relatives to the current user recovering its account.
   * @private
   */
  _setAccountUserMeta(user) {
    // Extract the user meta data and associate them to the current temporary account.
    this.temporaryAccount.account.username = user?.username;
    this.temporaryAccount.account.firstName = user?.profile?.firstName;
    this.temporaryAccount.account.lastName = user?.profile?.lastName;
    if (user?.locale) {
      this.temporaryAccount.account.locale = user.locale;
    }
    if (user?.accountRecoveryUserSetting?.status === AccountRecoveryUserSettingEntity.STATUS_APPROVED) {
      this.temporaryAccount.account.hasApprovedAccountRecoveryUserSetting = true;
    }
    // As of v3.6.0 the user is stored only to know if account recovery was enabled for this account.
    this.temporaryAccount.account.user = user;
  }

  /**
   * Handle unexpected error.
   * Close the iframe and let the application served by the API handle the user.
   * @param {Error} error The error.
   * @private
   */
  async _handleUnexpectedError(error) {
    (await WorkerService.get('RecoverBootstrap', this.worker.tab.id)).port.emit('passbolt.recover-bootstrap.remove-iframe');
    console.error(error);
    throw error;
  }
}

export default StartRecoverController;
