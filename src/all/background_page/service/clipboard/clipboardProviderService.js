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
 * @since         5.3.2
 */
import EdgeBackgroundPageClipboardService from "../../../../chrome/polyfill/clipboard/edgeBackgroundPageClipboardService";
import BrowserService from "../browser/browserService";

/**
 * The service retrieves the appropriate clipboard provider for the current environment: Edge, Chrome, or Firefox.
 */
export default class ClipboardProviderService {
  /**
   * Returns a clipboard API that works for the currently used browser.
   * @returns {Clipboard}
   */
  static getClipboard() {
    //is Chrome with MV3?
    if (typeof customNavigatorClipboard !== "undefined") {
      // eslint-disable-next-line no-undef
      return customNavigatorClipboard;
    }

    const isMV2 = chrome.runtime.getManifest().manifest_version === 2;
    if (!BrowserService.isFirefox() && isMV2) {
      //it's not firefox and it's MV2 => it's most probably Edge then
      return EdgeBackgroundPageClipboardService;
    }
    //by default we provide the default clipboard
    return navigator.clipboard;
  }
}
