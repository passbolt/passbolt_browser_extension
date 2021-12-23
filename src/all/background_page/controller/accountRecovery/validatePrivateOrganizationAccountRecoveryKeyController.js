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
 * @since         3.5.0
 */
const {PrivateGpgkeyEntity} = require("../../model/entity/gpgkey/privateGpgkeyEntity");
const {AccountRecoveryOrganizationPolicyEntity} = require("../../model/entity/accountRecovery/accountRecoveryOrganizationPolicyEntity");
const {ValidateAccountRecoveryOrganizationPrivateKeyService} = require("../../service/api/accountRecovery/validateAccountRecoveryOrganizationPrivateKeyService");

class ValidatePrivateOrganizationAccountRecoveryKeyController {
  constructor(worker, requestId) {
    this.worker = worker;
    this.requestId = requestId;
  }

  /**
   * Check if the key can be used as an organization recovery key.
   *
   * @param {AccountRecoveryPolicyDto} accountRecoveryPolicyDto
   * @param {PrivateAccountRecoveryKeyDto} privateAccountRecoveryKeyDto
   */
  async exec(accountRecoveryPolicyDto, privateAccountRecoveryKeyDto) {
    try {
      const accountRecoveryPolicyEntity = new AccountRecoveryOrganizationPolicyEntity(accountRecoveryPolicyDto);
      const privateGpgkeyEntity = new PrivateGpgkeyEntity(privateAccountRecoveryKeyDto);
      await ValidateAccountRecoveryOrganizationPrivateKeyService.validate(accountRecoveryPolicyEntity, privateGpgkeyEntity);
      this.worker.port.emit(this.requestId, "SUCCESS");
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }
}

exports.ValidatePrivateOrganizationAccountRecoveryKeyController = ValidatePrivateOrganizationAccountRecoveryKeyController;
