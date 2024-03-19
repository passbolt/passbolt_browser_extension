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
 * @since         4.7.0
 */

import GpgAuthToken from "./gpgAuthToken";

/**
 * Export a default gpg headers verify complete
 * @param data
 * @return {{"x-gpgauth-verify-response": *, "x-gpgauth-version": string, "x-gpgauth-authenticated": string, get: (function(*): *), "x-gpgauth-progress": string, "x-gpgauth-verify-url": string, has: (function(*): boolean), "x-gpgauth-login-url": string, "x-gpgauth-logout-url": string, "x-gpgauth-pubkey-url": string}}
 */
export const defaultGpgAuthTokenVerifyHeadersDto = (data = {}) => {
  const gpgAuthToken = new GpgAuthToken(data.token);
  const headers = {
    "x-gpgauth-authenticated": "false",
    "x-gpgauth-login-url": "/auth/login",
    "x-gpgauth-logout-url": "/auth/logout",
    "x-gpgauth-progress": "stage0",
    "x-gpgauth-pubkey-url": "/auth/verify.json",
    "x-gpgauth-verify-response": gpgAuthToken.token,
    "x-gpgauth-verify-url": "/auth/verify",
    "x-gpgauth-version": "1.3.0"
  };
  const defaultData = {
    ...headers,
    has: value => Boolean(headers[value]),
    get: value => headers[value]
  };
  return Object.assign(defaultData, data);
};
