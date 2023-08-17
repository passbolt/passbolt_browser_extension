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
 * @since         4.2.0
 */
import PasswordPoliciesEntity from "../../model/entity/passwordPolicies/passwordPoliciesEntity";
import PasswordPoliciesModel from "../../model/passwordPolicies/passwordPoliciesModel";

class FindPasswordPoliciesController {
  /**
   * FindPasswordPoliciesController constructor
   * @param {Worker} worker
   * @param {string} requestId uuid
   */
  constructor(worker, requestId, account, apiClientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.passwordPoliciesModel = new PasswordPoliciesModel(account, apiClientOptions);
  }

  /**
   * Controller executor.
   * @returns {Promise<void>}
   */
  async _exec() {
    try {
      const settings = await this.exec();
      this.worker.port.emit(this.requestId, "SUCCESS", settings);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Retrieve the password generator settings.
   * @returns {Promise<PasswordGeneratorEntity>}
   */
  async exec() {
    let registeredPasswordGeneratorSettingEntity;
    try {
      registeredPasswordGeneratorSettingEntity = await this.passwordPoliciesModel.find();
    } catch (e) {
      console.error(e);
    }
    return registeredPasswordGeneratorSettingEntity ?? PasswordPoliciesEntity.createFromDefault();
  }
}

export default FindPasswordPoliciesController;
