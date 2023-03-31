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
 * @since         hackaton
 */

import PasswordPoliciesModel from "../../model/passwordPolicies/passwordPoliciesModel";
import PasswordPoliciesEntity from '../../model/entity/passwordPolicies/passwordPoliciesEntity';


class PasswordPolicyCreateController {
  /**
   * PasswordPolicyGetController constructor
   * @param {Worker} worker
   * @param {string} requestId uuid
   */
  constructor(worker, requestId, apiClientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.passwordPoliciesModel = new PasswordPoliciesModel(apiClientOptions);
  }

  /**
   * Controller executor.
   * @returns {Promise<string>}
   */
  async _exec(passwordPolicyDto) {
    try {
      const policy = await this.exec(passwordPolicyDto);
      this.worker.port.emit(this.requestId, "SUCCESS", policy);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }
  exec(passwordPolicyDto) {
    return this.passwordPoliciesModel.create(new PasswordPoliciesEntity(passwordPolicyDto));
  }
}

export default PasswordPolicyCreateController;
