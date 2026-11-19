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
 * @since         5.18.0
 */
import { assertUuid } from "passbolt-styleguide/src/shared/utils/assertions";
import { QuickAccessService } from "../../service/ui/quickAccess.service";
import BrowserTabService from "../../service/ui/browserTab.service";

/**
 * Open the QuickAccess resource edit form in a separate window.
 * Unlike the toolbar popup, the separate window stays open while the user switches to the website to change the
 * password there, so both the current and the new password remain at hand.
 */
class OpenEditResourceInDetachedModeController {
  /**
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
      await this.exec.apply(this, arguments);
      this.worker.port.emit(this.requestId, "SUCCESS");
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, "ERROR", error);
    }
  }

  /**
   * Open the edit form of the given resource in a separate window.
   * @param {string} resourceId The resource id
   * @param {string|number|null} [openerTabId] The tab the QuickAccess was opened from, if any
   * @returns {Promise<void>}
   * @throws {Error} On browsers where the QuickAccess cannot be displayed in a separate window (Safari)
   */
  async exec(resourceId, openerTabId = null) {
    assertUuid(resourceId, "The resource id should be a valid UUID.");
    if (QuickAccessService.isAttachedModeAvailable()) {
      // On Safari, the QuickAccess must only be displayed attached to the toolbar (see PB-49236).
      throw new Error("The QuickAccess cannot be opened in a separate window on this browser.");
    }
    const queryParameters = [
      { name: "feature", value: "edit-resource" },
      { name: "resourceId", value: resourceId },
    ];
    /*
     * The separate window needs to know the website tab to act on (e.g. "use on this page").
     * The toolbar popup does not know it, but it still has the focus: the current tab is the website.
     */
    const tabId = openerTabId ?? (await BrowserTabService.getCurrent())?.id;
    if (/^\d+$/.test(String(tabId))) {
      queryParameters.push({ name: "tabId", value: String(tabId) });
    }
    await QuickAccessService.openInDetachedMode(queryParameters);
  }
}

export default OpenEditResourceInDetachedModeController;
