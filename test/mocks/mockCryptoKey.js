/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.9.0
 */
import crypto from "crypto";

if (!global.crypto) {
  Object.defineProperty(global, "crypto", {
    value: crypto
  });
}

if (!global.CryptoKey) {
  Object.defineProperty(global, "CryptoKey", {
    value: crypto.webcrypto.CryptoKey
  });
}

