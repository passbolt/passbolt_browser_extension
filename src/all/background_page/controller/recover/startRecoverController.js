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
import AuthModel from "../../model/auth/authModel";
import SetupModel from "../../model/setup/setupModel";
import AccountRecoveryUserSettingEntity from "../../model/entity/accountRecovery/accountRecoveryUserSettingEntity";
import WorkerService from "../../service/worker/workerService";

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
    this.authModel = new AuthModel(apiClientOptions);
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
   * @returns {Promise<AccountEntity>}
   */
  async exec() {
    try {
      await this._findAndSetAccountServerPublicKey();
      await this._findAndSetAccountUserMeta();
    } catch (error) {
      await this._handleUnexpectedError(error);
    }
  }

  /**
   * Find and set the account server public key.
   * @returns {Promise<void>}
   * @private
   */
  async _findAndSetAccountServerPublicKey() {
    const serverKeyDto = await this.authModel.getServerKey();
    const serverKey = await OpenpgpAssertion.readKeyOrFail(serverKeyDto.armored_key);
    OpenpgpAssertion.assertPublicKey(serverKey);
    // associate the server public key to the current account.
    this.account.serverPublicArmoredKey = serverKey.armor();
  }

  /**
   * Find and set account user meta.
   * @returns {Promise<void>}
   * @private
   */
  async _findAndSetAccountUserMeta() {
    const {user} = await this.setupModel.startRecover(
      this.account.userId,
      this.account.authenticationTokenToken
    );

    // Extract the user meta data and associate them to the current temporary account.
    this.account.username = user?.username;
    this.account.firstName = user?.profile?.firstName;
    this.account.lastName = user?.profile?.lastName;
    if (user?.locale) {
      this.account.locale = user.locale;
    }
    if (user?.accountRecoveryUserSetting?.status === AccountRecoveryUserSettingEntity.STATUS_APPROVED) {
      this.account.hasApprovedAccountRecoveryUserSetting = true;
    }
    // As of v3.6.0 the user is stored only to know if account recovery was enabled for this account.
    this.account.user = user;
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
