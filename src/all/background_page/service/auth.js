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
 * @since         2.11.0
 */
import User from "../model/user";
import PassboltBadResponseError from "../error/passboltBadResponseError";
import PassboltServiceUnavailableError from "../error/passboltServiceUnavailableError";
import MfaAuthenticationRequiredError from "../error/mfaAuthenticationRequiredError";
import NotFoundError from "../error/notFoundError";

class AuthService {}

/**
 * Check if the current user is authenticated.
 *
 * @return {Promise<bool>}
 */
AuthService.isAuthenticated = async function() {
  const user = User.getInstance();
  const domain = user.settings.getDomain();
  const fetchOptions = {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
      'content-type': 'application/json'
    }
  };
  const url = `${domain}/auth/is-authenticated.json`;
  let response;

  try {
    response = await fetch(url, fetchOptions);
  } catch (error) {
    // Catch Network error such as connection lost.
    throw new PassboltServiceUnavailableError(error.message);
  }

  try {
    await response.json();
  } catch (error) {
    // If the response cannot be parsed, it's not a Passbolt API response. It can be a nginx error (504).
    throw new PassboltBadResponseError();
  }

  if (response.ok) {
    return true;
  }

  // MFA required.
  if (/mfa\/verify\/error\.json$/.test(response.url)) {
    throw new MfaAuthenticationRequiredError();
  } else if (response.status === 404) {
    // Entry point not found.
    throw new NotFoundError();
  }

  return false;
};

export default AuthService;
