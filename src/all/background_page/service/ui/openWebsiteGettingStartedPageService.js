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
 * @since         5.10.0
 */

import BrowserTabService from "./browserTab.service";

const PASSBOLT_GETTING_STARTED_URL = "https://www.passbolt.com/start";

export default class OpenWebsiteGettingStartedPageService {
  /**
   * Opens the Passbolt getting started page in a new tab
   * @returns {Promise<void>}
   */
  async openTab() {
    await BrowserTabService.openTab(PASSBOLT_GETTING_STARTED_URL);
  }
}
