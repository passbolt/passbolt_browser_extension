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
 * @since         5.17.0
 */

/**
 * The passkey prompt was cancelled by the user or timed out (DOMException NotAllowedError, browsers do not distinguish both cases).
 */
class WebauthnCeremonyCancelledError extends Error {
  constructor(message) {
    message = message || "The passkey prompt was cancelled or timed out.";
    super(message);
    this.name = "WebauthnCeremonyCancelledError";
  }
}

export default WebauthnCeremonyCancelledError;
