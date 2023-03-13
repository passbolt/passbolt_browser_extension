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
import PortManager from "../../sdk/port/portManager";
import PagemodManager from "../../pagemod/pagemodManager";

class WebNavigationService {
  /**
   * Execute the navigation service process
   * @param frameDetails
   * @returns {Promise<void>}
   */
  static async exec(frameDetails) {
    // Remove port and worker in session storage if the user navigate
    if (frameDetails.frameId === 0) {
      await PortManager.onTabRemoved(frameDetails.tabId);
    }
    // Process to detect a pagemod and inject CSS, JS files
    await PagemodManager.exec(frameDetails);
  }
}

export default WebNavigationService;
