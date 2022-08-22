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
import ValidateAccountRecoveryOrganizationPrivateKeyService from "../../service/api/accountRecovery/validateAccountRecoveryOrganizationPrivateKeyService";
import PrivateGpgkeyEntity from "../../model/entity/gpgkey/privateGpgkeyEntity";

class AccountRecoveryValidateOrganizationPrivateKeyController {
  /**
   * GetUserKeyInfoController constructor
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
   * @param {Object} accountRecoveryPrivateKeyDto The account recovery private key dto.
   * @return {Promise<void>}
   */
  async _exec(accountRecoveryPrivateKeyDto) {
    try {
      await this.exec(accountRecoveryPrivateKeyDto);
      this.worker.port.emit(this.requestId, "SUCCESS");
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Check if the key can be used as an organization recovery key.
   *
   * @param {Object} accountRecoveryPrivateKeyDto The account recovery private key dto.
   * @return {Promise<void>}
   * @throw {Error} if no account recovery organization policy found
   */
  async exec(accountRecoveryPrivateKeyDto) {
    const privateGpgKeyEntity = new PrivateGpgkeyEntity(accountRecoveryPrivateKeyDto);
    const policyEntity = await this.accountRecoveryModel.findOrganizationPolicy();
    if (!policyEntity) {
      throw new Error("Account recovery organization policy not found.");
    }
    await ValidateAccountRecoveryOrganizationPrivateKeyService.validate(policyEntity, privateGpgKeyEntity);
  }
}

export default AccountRecoveryValidateOrganizationPrivateKeyController;
