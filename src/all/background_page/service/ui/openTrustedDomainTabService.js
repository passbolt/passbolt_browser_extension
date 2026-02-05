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
import User from "../../model/user";

export default class OpenTrustedDomainTabService {
  /**
   * Opens the trusted domain in a new tab
   * @returns {Promise<void>}
   */
  async openTab() {
    const user = User.getInstance();
    const domain = user.settings.getDomain();

    await BrowserTabService.openTab(domain);
  }
}
