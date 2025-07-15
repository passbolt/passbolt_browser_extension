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

/**
 * Mock class to be used in replacement of navigator.clipboard
 */
export default class MockNavigatorClipboard {
  /**
   * @type {string}
   * @private
   */
  _clipboardData = "";

  /**
   * @inheritDoc navigator.clipboard.readText
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/readText
   */
  async readText() {
    return this._clipboardData;
  }

  /**
   * @inheritDoc navigator.clipboard.writeText
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText
   */
  async writeText(newClipText) {
    this._clipboardData = newClipText;
  }
}
