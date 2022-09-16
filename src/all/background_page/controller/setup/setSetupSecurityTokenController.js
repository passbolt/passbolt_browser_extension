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
import SecurityTokenEntity from "../../model/entity/securityToken/securityTokenEntity";

class SetSetupSecurityTokenController {
  /**
   * GetRecoverLocaleController constructor.
   * @param {Worker} worker The worker the controller is executed on.
   * @param {string} requestId The associated request id.
   * @param {AccountSetupEntity} account The account being setup.
   */
  constructor(worker, requestId, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.account = account;
  }

  /**
   * Controller executor.
   * @param {object} securityTokenDto The security token dto
   * @returns {Promise<void>}
   */
  async _exec(securityTokenDto) {
    try {
      this.exec(securityTokenDto);
      this.worker.port.emit(this.requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Set the user security token.
   * @param {object} securityTokenDto The security token dto
   * @return {void}
   * @throw {EntityValidationError} if the security token dto does not validate.
   */
  async exec(securityTokenDto) {
    this.account.securityToken = new SecurityTokenEntity(securityTokenDto);
  }
}

export default SetSetupSecurityTokenController;
