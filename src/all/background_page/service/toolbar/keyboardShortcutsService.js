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
import PassphraseStorageService from "../session_storage/passphraseStorageService";
import Log from "../../model/log";

/**
 * Keyboard command identifier for locking the extension.
 * Declared in each platform manifest under "commands".
 * @type {string}
 */
export const LOCK_COMMAND = "passbolt-lock";

/**
 * Handles keyboard shortcuts that are not tied to the toolbar icon.
 *
 * Registers its own `browser.commands.onCommand` listener. Commands it does not
 * own are ignored, so it coexists with other command listeners (e.g. the
 * ToolbarService "passbolt-open" handler) without requiring changes to them.
 */
class KeyboardShortcutsService {
  constructor() {
    this.handleCommand = this.handleCommand.bind(this);
    browser.commands.onCommand.addListener(this.handleCommand);
  }

  /**
   * Dispatch a keyboard command to its handler.
   * @param {string} command The command identifier sent by the browser.
   * @returns {Promise<void>}
   */
  async handleCommand(command) {
    if (command !== LOCK_COMMAND) {
      // Not handled here; other listeners may handle it.
      return;
    }
    await this.lock();
  }

  /**
   * Lock the extension by flushing the cached passphrase from session storage.
   *
   * This re-locks the vault without ending the server session: the next
   * operation that needs the passphrase prompts for it again. It is deliberately
   * lighter than a full sign-out, which would require re-authentication against
   * the server. If no passphrase is cached, the flush is a no-op.
   * @returns {Promise<void>}
   */
  async lock() {
    try {
      await PassphraseStorageService.flush();
    } catch (error) {
      console.error(error);
      Log.write({ level: "error", message: "KeyboardShortcutsService: failed to lock the extension." });
    }
  }
}

const keyboardShortcutsService = new KeyboardShortcutsService();

export default keyboardShortcutsService;
