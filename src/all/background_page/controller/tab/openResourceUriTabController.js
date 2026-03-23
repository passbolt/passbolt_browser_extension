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
 * @since         5.11.0
 */

import sanitizeUrl, { urlProtocols } from "passbolt-styleguide/src/react-extension/lib/Sanitize/sanitizeUrl";
import BrowserTabService from "../../service/ui/browserTab.service";

export default class OpenResourceUriTabController {
  /**
   * @constructor
   * @param {Worker} worker The associated worker.
   * @param {string} requestId The associated request id.
   */
  constructor(worker, requestId) {
    this.worker = worker;
    this.requestId = requestId;
  }

  /**
   * Wrapper of exec function to run it with worker.
   * @return {Promise<void>}
   */
  async _exec() {
    try {
      await this.exec.apply(this, arguments);
      this.worker.port.emit(this.requestId, "SUCCESS");
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, "ERROR", error);
    }
  }

  /**
   * Opens the given url in a new tab
   * @param {string} uriString the URI to try to open on a new tab
   * @returns {Promise<void>}
   */
  async exec(urlString) {
    const url = sanitizeUrl(urlString, {
      whiteListedProtocols: [urlProtocols.HTTPS, urlProtocols.HTTP],
      defaultProtocol: urlProtocols.HTTPS,
    });

    if (!url) {
      throw new Error("The given URL is not valid for opening in a new tab.");
    }

    await BrowserTabService.openTab(url);
  }
}
