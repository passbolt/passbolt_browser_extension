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
import AccountRecoveryModel from "../../model/accountRecovery/accountRecoveryModel";


class GetOrganizationPolicyController {
  /**
   * Constructor
   * @param {Worker} worker
   * @param {string} requestId uuid
   * @param {ApiClientOptions} apiClientOptions
   */
  constructor(worker, requestId, apiClientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.accountRecoveryModel = new AccountRecoveryModel(apiClientOptions);
  }

  /**
   * Wrapper of exec function to run it with worker.
   *
   * @return {Promise<void>}
   */
  async _exec() {
    try {
      const accountRecoveryOrganizationPolicy = await this.exec();
      this.worker.port.emit(this.requestId, "SUCCESS", accountRecoveryOrganizationPolicy);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Get the account recovery organization policy
   *
   * @return {Promise<AccountRecoveryOrganizationPolicyEntity|null>}
   */
  async exec() {
    const contains = {'creator': true, 'creator.gpgkey': true};
    return this.accountRecoveryModel.findOrganizationPolicy(contains);
  }
}

export default GetOrganizationPolicyController;
