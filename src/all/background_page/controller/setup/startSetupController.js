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
import SetupModel from "../../model/setup/setupModel";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import WorkerService from "../../service/worker/workerService";
import AuthVerifyServerKeyService from "../../service/api/auth/authVerifyServerKeyService";
import AccountTemporarySessionStorageService from "../../service/sessionStorage/accountTemporarySessionStorageService";
import AccountSetupEntity from "../../model/entity/account/accountSetupEntity";
import AccountTemporaryEntity from "../../model/entity/account/accountTemporaryEntity";

class StartSetupController {
  /**
   * Constructor.
   * @param {Worker} worker The associated worker.
   * @param {string} requestId The associated request id.
   * @param {ApiClientOptions} apiClientOptions The api client options.
   * @param {AccountSetupEntity} account The account being setting up.
   */
  constructor(worker, requestId, apiClientOptions, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.account = account;
    this.authVerifyServerKeyService = new AuthVerifyServerKeyService(apiClientOptions);
    this.setupModel = new SetupModel(apiClientOptions);
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
   * @returns {Promise<void>}
   */
  async exec() {
    try {
      await this._buildTemporaryAccountEntity();
      await this._findAndSetAccountSetupServerPublicKey();
      await this._findAndSetAccountSetupMeta();
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
      account: this.account.toDto(AccountSetupEntity.ALL_CONTAIN_OPTIONS),
      worker_id: this.worker.port._port.name
    };
    this.temporaryAccount = new AccountTemporaryEntity(temporaryAccountDto);
  }

  /**
   * Find and set the account server public key.
   * @returns {Promise<void>}
   * @private
   */
  async _findAndSetAccountSetupServerPublicKey() {
    const serverKeyDto = await this.authVerifyServerKeyService.getServerKey();
    const serverPublicKey = await OpenpgpAssertion.readKeyOrFail(serverKeyDto.armored_key);
    OpenpgpAssertion.assertPublicKey(serverPublicKey);

    // associate the server public key to the account being set up.
    this.temporaryAccount.account.serverPublicArmoredKey = serverPublicKey.armor();
  }

  /**
   * Find and set account user meta.
   * @returns {Promise<void>}
   * @private
   */
  async _findAndSetAccountSetupMeta() {
    const {user, accountRecoveryOrganizationPolicy, userPassphrasePolicies} = await this.setupModel.startSetup(
      this.temporaryAccount.account.userId,
      this.temporaryAccount.account.authenticationTokenToken
    );

    // Associate the user meta to the account being set up.
    this.temporaryAccount.account.username = user?.username;
    this.temporaryAccount.account.firstName = user?.profile.firstName;
    this.temporaryAccount.account.lastName = user?.profile.lastName;

    // As of v3.6.0 the user is stored only to know if account recovery was enabled for this account.
    this.temporaryAccount.account.user = user;

    // Keep the account recovery organization policy in the setup temporary account storage.
    if (accountRecoveryOrganizationPolicy) {
      this.temporaryAccount.accountRecoveryOrganizationPolicy = accountRecoveryOrganizationPolicy;
    }

    // Keep the user passphrase policies in the setup temporary account storage.
    if (userPassphrasePolicies) {
      this.temporaryAccount.userPassphrasePolicies = userPassphrasePolicies;
    }
  }

  /**
   * Handle unexpected error.
   * Close the iframe and let the application served by the API handle the user.
   * @param {Error} error The error.
   * @private
   */
  async _handleUnexpectedError(error) {
    (await WorkerService.get('SetupBootstrap', this.worker.tab.id)).port.emit('passbolt.setup-bootstrap.remove-iframe');
    throw error;
  }
}

export default StartSetupController;
