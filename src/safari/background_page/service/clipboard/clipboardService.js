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
 * @since         5.16.0
 */

import { SendNativeMessageService } from "../nativeMessage/sendNativeMessageService";

/**
 * Clipboard service for Safari.
 *
 * Webkit denies any programmatic clipboard write performed without user activation, and the
 * background page has none when it processes a port request. The write is therefore delegated to
 * the native application which owns the pasteboard.
 */
export class ClipboardService {
  /**
   * @inheritDoc navigator.clipboard.writeText
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText
   */
  static async writeText(data) {
    await SendNativeMessageService.sendNativeMessage("write-clipboard", { data });
  }
}
