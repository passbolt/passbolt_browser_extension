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

class GetAccountRecoveryOrganizationPolicyController {
  /**
   * Constructor.
   * @param {Worker} worker The associated worker.
   * @param {string} requestId The associated request id.
   * @param {Object} runtimeMemory The setup runtime memory.
   */
  constructor(worker, requestId, runtimeMemory) {
    this.worker = worker;
    this.requestId = requestId;
    this.runtimeMemory = runtimeMemory;
  }

  /**
   * Controller executor.
   * @returns {Promise<void>}
   */
  async _exec() {
    try {
      const result = await this.exec();
      this.worker.port.emit(this.requestId, 'SUCCESS', result);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Retrieve the account recovery organization policy
   * @returns {Promise<AccountEntity>}
   */
  async exec() {
    return this.runtimeMemory.accountRecoveryOrganizationPolicy;
  }
}

export default GetAccountRecoveryOrganizationPolicyController;
