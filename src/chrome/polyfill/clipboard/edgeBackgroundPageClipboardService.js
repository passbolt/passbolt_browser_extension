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
 * The service aims to create metadata key.
 */
export default class EdgeBackgroundPageClipboardService {
  /**
   * @inheritDoc navigator.clipboard.writeText
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText
   */
  static async writeText(data) {
    const textarea = document.createElement("textarea");
    document.body.appendChild(textarea);
    textarea.value = data;
    textarea.select();
    document.execCommand("cut");
    document.body.removeChild(textarea);
  }
}
