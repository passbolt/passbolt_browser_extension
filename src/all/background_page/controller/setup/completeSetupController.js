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

import AccountModel from "../../model/account/accountModel";
import SetupModel from "../../model/setup/setupModel";
import AccountEntity from "../../model/entity/account/accountEntity";
import AccountSetupEntity from "../../model/entity/account/accountSetupEntity";

class CompleteSetupController {
  /**
   * Constructor.
   * @param {Worker} worker The associated worker.
   * @param {string} requestId The associated request id.
   * @param {ApiClientOptions} apiClientOptions The api client options.
   * @param {AccountSetupEntity} account The account being setup.
   */
  constructor(worker, requestId, apiClientOptions, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.account = account;
    this.accountModel = new AccountModel(apiClientOptions);
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
   * Complete the setup:
   * - Complete the setup.
   * - Set the extension account in the local storage.
   * @returns {Promise<void>}
   */
  async exec() {
    const accountSetup = new AccountEntity(this.account.toDto(AccountSetupEntity.ALL_CONTAIN_OPTIONS));
    await this.setupModel.completeSetup(this.account);
    await this.accountModel.add(accountSetup);
  }
}

export default CompleteSetupController;
