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
 * @since         4.1.0
 */
import AuthModel from "../../model/auth/authModel";
import browser from "../../sdk/polyfill/browserPolyfill";

class AuthLogoutController {
  /**
   * AuthLogoutController constructor
   * @param {Worker} worker
   * @param {string} requestId uuid
   * @param {ApiClientOptions} apiClientOptions the api client options
   */
  constructor(worker, requestId, apiClientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.apiClientOptions = apiClientOptions;
    this.authModel = new AuthModel(this.apiClientOptions);
  }

  /**
   * Wrapper of exec function to run it with worker.
   * @param {boolean} withRedirection do the user needs to be redirected or not after logout
   * @return {Promise<void>}
   */
  async _exec(withRedirection) {
    try {
      await this.exec(withRedirection);
      this.worker.port.emit(this.requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Attemps to sign out the current user.
   * @param {boolean} withRedirection do the user needs to be redirected or not after logout
   * @return {Promise<void>}
   */
  async exec(withRedirection) {
    await this.authModel.logout();

    if (!withRedirection) {
      return;
    }

    const url = this.apiClientOptions.getBaseUrl().toString();
    await browser.tabs.update(this.worker.tab.id, {url});
  }
}

export default AuthLogoutController;
