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

import AccountRecoveryOrganizationPolicyService from "../../service/api/accountRecovery/accountRecoveryOrganizationPolicyService";
import AccountRecoveryModel from "../../model/accountRecovery/accountRecoveryModel";

class AccountRecoveryValidatePublicKeyController {
  constructor(worker, requestId, apiClientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.accountRecoveryModel = new AccountRecoveryModel(apiClientOptions);
  }

  /**
   * Wrapper of exec function to run it with worker.
   *
   * @param {string} keyToValidate the key to validate in its armored form.
   * @return {Promise<void>}
   */
  async _exec(keyToValidate) {
    try {
      await this.exec(keyToValidate);
      this.worker.port.emit(this.requestId, "SUCCESS");
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Check if the public key can be used as an organization recovery key.
   *
   * @param {string} publicKeyToValidate the public key to validate in its armored form.
   * @return {Promise<void>}
   */
  async exec(publicKeyToValidate) {
    const organizationPolicy = await this.accountRecoveryModel.findOrganizationPolicy();
    await AccountRecoveryOrganizationPolicyService.validatePublicKey(publicKeyToValidate, organizationPolicy.armoredKey);
  }
}

export default AccountRecoveryValidatePublicKeyController;
