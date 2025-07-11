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

import ResponseClipboardOffscreenService from "./responseClipboardOffscreenService";
import {defaultClipboardWriteResponseMessage} from "./responseClipboardOffscreenService.test.data";
import {defaultCallbacks} from "../network/responseFetchOffscreenService.test.data";

describe("ResponseClipboardOffscreenService", () => {
  describe("::handleClipboardResponse", () => {
    it("should resolve the promise from the response callback", () => {
      expect.assertions(1);

      const id = crypto.randomUUID();
      const callbacks = defaultCallbacks();

      const message = defaultClipboardWriteResponseMessage({id});
      ResponseClipboardOffscreenService.handleClipboardResponse(message, callbacks);

      expect(callbacks.resolve).toHaveBeenCalledTimes(1);
    });
  });
});
