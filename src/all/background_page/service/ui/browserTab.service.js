/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SARL (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.4.0
 */

import { assertNumber, assertString } from "../../utils/assertions";
import Validator from "validator";

class BrowserTabService {
  /**
   * Get the current tab
   */
  static async getCurrent() {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    return tabs[0];
  }

  /**
   * Get by Id
   * @param id
   */
  static async getById(id) {
    const tabs = await browser.tabs.query({});
    return tabs.find((tab) => tab.id === parseInt(id));
  }

  /**
   * Send message to a specific tab id and frame id
   * @param {any} worker
   * @param {any} message
   * @param {any} args
   * @returns {Promise<*>}
   */
  static async sendMessage(worker, message, ...args) {
    const requestArgs = [message].concat(args);
    return browser.tabs.sendMessage(worker.tabId, requestArgs, { frameId: worker.frameId });
  }

  /**
   * Reload the tab
   * @param {int} id The id of the tab
   * @return {Promise<void>}
   */
  static async reloadTab(id) {
    assertNumber(id);
    await browser.tabs.reload(id);
  }

  /**
   * Closes the tab given its id
   * @param {int} id The id of the tab
   * @return {Promise<void>}
   */
  static async closeTab(id) {
    assertNumber(id);
    await browser.tabs.remove(id);
  }

  /**
   * Opens a new tab on the given URL
   * @param {string} urlString
   * @return {Promise<void>}
   */
  static async openTab(urlString) {
    this.assertUrl(urlString, "Cannot open an new tab due to an invalid URL");
    const url = new URL(urlString); //ensures urlString can be parsed

    await browser.tabs.create({ url: url.toString() });
  }

  /**
   * Updates the current active tab with a new URL
   * @param {string} urlString
   * @return {Promise<void>}
   */
  static async updateCurrentTabUrl(urlString) {
    this.assertUrl(urlString, "Cannot update the current tab due to an invalid URL");
    const url = new URL(urlString); //ensures urlString can be parsed

    const currentTab = await BrowserTabService.getCurrent();
    await browser.tabs.update(currentTab.id, { url: url.toString() });
  }

  /**
   * Asserts that the URL is valid to be proceed by this service.
   * @param {string} urlString
   * @throws {Error} if the string is not a valid URL that can be processed by this service.
   * @private
   */
  static assertUrl(urlString, message) {
    assertString(urlString, message);

    const validationOption = {
      require_tld: false,
      require_host: true,
      require_protocol: true,
      require_valid_protocol: true,
      protocols: ["https", "http"],
    };

    if (!Validator.isURL(urlString, validationOption)) {
      throw new Error(message);
    }
  }
}

export default BrowserTabService;
