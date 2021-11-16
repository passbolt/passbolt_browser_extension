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
 * @since         3.4.0
 */
const {AccountRecoveryOrganizationPolicyService} = require("../../service/api/accountRecovery/accountRecoveryOrganizationPolicyService");
class AccountRecoveryValidatePublicKeyController {
  constructor(worker, requestId) {
    this.worker = worker;
    this.requestId = requestId;
  }

  /**
   * Check if the key can be used as an organization recovery key.
   *
   * @param {AccountRecoveryOrganizationPublicKeyDto} newOrk
   * @param {AccountRecoveryOrganizationPublicKeyDto} currentOrk
   */
  async exec(newOrk, currentOrk) {
    try {
      await AccountRecoveryOrganizationPolicyService.validatePublicKey(newOrk, currentOrk);
      this.worker.port.emit(this.requestId, "SUCCESS");
    } catch (error) {
      console.log(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }
}

exports.AccountRecoveryValidatePublicKeyController = AccountRecoveryValidatePublicKeyController;
