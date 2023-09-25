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
 * @since         4.3.0
 */

import MfaSetupTotpEntity from "../../model/entity/mfa/mfaSetupTotpEntity";
import MultiFactorAuthenticationModel from "../../model/multiFactorAuthentication/multiFactorAuthenticationModel";


class MfaSetupVerifyOtpCodeController {
  /**
   * MfaSetupVerifyOtpCodeController constructor
   * @param {Worker} worker
   * @param {string} requestId uuid
   */
  constructor(worker, requestId, apiClientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.apiClientOptions = apiClientOptions;
    this.multiFactorAuthenticationModel = new MultiFactorAuthenticationModel(this.apiClientOptions);
  }

  /**
   * Controller executor.
   * @param   {Object} setupDto the totp object with uri and otp code
   * @returns {Promise<bool>}
   */
  async _exec(setupDto) {
    try {
      await this.exec(setupDto);
      this.worker.port.emit(this.requestId, "SUCCESS");
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Check and save the otp code
   * @param   {Object} setupDto the totp object with uri and otp code
   */
  async exec(setupDto) {
    const totpEntity = new MfaSetupTotpEntity(setupDto);
    const toptSetupDto = totpEntity.toDto();
    await this.multiFactorAuthenticationModel.setupTotp(toptSetupDto);
  }
}

export default MfaSetupVerifyOtpCodeController;
