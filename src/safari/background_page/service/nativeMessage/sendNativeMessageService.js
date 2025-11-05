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
 * @since         5.6.0
 */

const SAFARI_APP_ID = "com.passbolt.safari";

/**
 * Send Native Message service for Safari
 */
export class SendNativeMessageService {
  /**
   * Send message to the Safari application part.
   * @param {String} action
   * @param {object} args
   * @return {Promise<any>}
   */
  static async sendNativeMessage(action, args) {
    const message = {action, ...args};
    //@note: SAFARI_APP_ID is actually ignored when used by Safari. It is sill set here to respect `sendNativeMessage` standard.
    const resp = await chrome.runtime.sendNativeMessage(SAFARI_APP_ID, message);

    if (!resp.success) {
      throw new Error(resp.error || "Safari native application execution failed");
    }

    return resp;
  }
}
