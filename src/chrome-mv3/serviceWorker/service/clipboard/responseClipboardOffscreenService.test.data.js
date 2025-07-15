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

import {SEND_MESSAGE_TARGET_CLIPBOARD_WRITE_OFFSCREEN_RESPONSE_HANDLER} from "../../../offscreens/service/clipboard/writeClipobardOffscreenService";

export const defaultClipboardWriteResponseMessage = (message = {}) => ({
  id: crypto.randomUUID(),
  target: SEND_MESSAGE_TARGET_CLIPBOARD_WRITE_OFFSCREEN_RESPONSE_HANDLER,
  ...message
});
