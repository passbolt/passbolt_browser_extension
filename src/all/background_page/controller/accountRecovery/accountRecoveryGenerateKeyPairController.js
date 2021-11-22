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
const {GenerateGpgKeyPairService} = require('../../service/crypto/generateGpgKeyPairService');
/**
 * Controller related to the account recovery save settings
 */
class AccountRecoveryGenerateKeyPairController {
  /**
   * AccountRecoveryGenerateKeyPairController constructor
   * @param {Worker} worker
   * @param {string} requestId uuid
   */
  constructor(worker, requestId) {
    this.worker = worker;
    this.requestId = requestId;
  }

  /**
   * Request the save organization settings of the account recovery
   * @param accountRecoveryOrganizationPolicyDto The account recovery organization policy
   */
  async exec(generateGpgKeyPairDto) {
    GenerateGpgKeyPairService.generateKeyPair(generateGpgKeyPairDto)
      .then(keyPairEntity => { this.worker.port.emit(this.requestId, "SUCCESS", keyPairEntity); })
      .catch(error => {
        console.error(error);
        this.worker.port.emit(this.requestId, 'ERROR', error);
      });
  }
}

exports.AccountRecoveryGenerateKeyPairController = AccountRecoveryGenerateKeyPairController;
