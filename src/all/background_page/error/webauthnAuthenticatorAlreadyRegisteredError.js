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
 * The authenticator is already registered for this user (DOMException InvalidStateError, authenticator listed in excludeCredentials).
 */
class WebauthnAuthenticatorAlreadyRegisteredError extends Error {
  constructor(message) {
    message = message || "The authenticator is already registered.";
    super(message);
    this.name = "WebauthnAuthenticatorAlreadyRegisteredError";
  }
}

export default WebauthnAuthenticatorAlreadyRegisteredError;
