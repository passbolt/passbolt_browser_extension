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

import { SendNativeMessageService } from "../../../../safari/background_page/service/nativeMessage/sendNativeMessageService";
import BrowserService from "../browser/browserService";

export default class OpenSafariExtensionSettingsService {
  /**
   * Opens the Safari extension settings page via native messaging.
   * @returns {Promise<void>}
   */
  static async openSettings() {
    if (BrowserService.isSafari()) {
      await SendNativeMessageService.sendNativeMessage("open-safari-settings");
    }
  }
}
