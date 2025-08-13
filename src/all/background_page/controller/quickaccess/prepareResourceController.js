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
 * @since         5.4.0
 */

import resourceInProgressCacheService from "../../service/cache/resourceInProgressCache.service";
import BrowserTabService from "../../service/ui/browserTab.service";

class PrepareResourceController {
  /**
   * PrepareResourceController constructor
   * @param {Worker} worker
   * @param {string} requestId uuid
   */
  constructor(worker, requestId) {
    this.worker = worker;
    this.requestId = requestId;
  }

  /**
   * Controller executor.
   * @returns {Promise<void>}
   */
  async _exec() {
    try {
      const result = await this.exec.apply(this, arguments);
      this.worker.port.emit(this.requestId, 'SUCCESS', result);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Prepare to create a new resource.
   *
   * @param {string} tabId The tab id
   * @returns {Promise<{name: string, uri: sttring} | resourceDto>}
   */
  async exec(tabId) {
    const resourceInProgress = await resourceInProgressCacheService.consume();
    if (resourceInProgress !== null) {
      return resourceInProgress;
    }

    // Retrieve resource name and uri from tab.
    const tab = tabId
      ? await BrowserTabService.getById(tabId)
      : await BrowserTabService.getCurrent();

    return {name: tab.title, uris: [tab.url]};
  }
}

export default PrepareResourceController;
