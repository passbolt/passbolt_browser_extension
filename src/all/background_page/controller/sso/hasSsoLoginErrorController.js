/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         4.0.0
 */
const SSO_LOGIN_ERROR_CASE = "sso-login-error";

class HasSsoLoginErrorController {
  /**
   * HasSsoLoginErrorController constructor
   * @param {Worker} worker
   * @param {string} requestId uuid
   */
  constructor(worker, requestId) {
    this.worker = worker;
    this.requestId = requestId;
  }

  /**
   * Wrapper of exec function to run it with worker.
   *
   * @return {Promise<void>}
   */
  async _exec() {
    try {
      const hasError = await this.exec();
      this.worker.port.emit(this.requestId, "SUCCESS", hasError);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, "ERROR", error);
    }
  }

  /**
   * Returns true if the current page is an authenitcation page in a case "sso-login-error"
   * @return {Promise<boolean>}
   */
  async exec() {
    const url = new URL(this.worker.tab.url);
    const errorCase = url.searchParams.get('case') || null;
    return errorCase === SSO_LOGIN_ERROR_CASE;
  }
}

export default HasSsoLoginErrorController;
