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
 * @since         5.12.1
 */

import keyboardShortcutsService, { LOCK_COMMAND } from "./keyboardShortcutsService";
import PassphraseStorageService from "../session_storage/passphraseStorageService";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("KeyboardShortcutsService", () => {
  describe("::handleCommand", () => {
    it("flushes the cached passphrase on the lock command", async () => {
      const flushMock = jest.spyOn(PassphraseStorageService, "flush").mockResolvedValue(undefined);

      await keyboardShortcutsService.handleCommand(LOCK_COMMAND);

      expect(flushMock).toHaveBeenCalledTimes(1);
    });

    it("ignores commands it does not own", async () => {
      const flushMock = jest.spyOn(PassphraseStorageService, "flush").mockResolvedValue(undefined);

      await keyboardShortcutsService.handleCommand("passbolt-open");

      expect(flushMock).not.toHaveBeenCalled();
    });

    it("does not throw if flushing the passphrase fails", async () => {
      jest.spyOn(PassphraseStorageService, "flush").mockRejectedValue(new Error("flush failed"));
      jest.spyOn(console, "error").mockImplementation(() => {});

      await expect(keyboardShortcutsService.handleCommand(LOCK_COMMAND)).resolves.toBeUndefined();
    });
  });
});
