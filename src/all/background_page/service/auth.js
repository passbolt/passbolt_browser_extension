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
const MfaAuthenticationRequiredError = require('../error/mfaAuthenticationRequiredError').MfaAuthenticationRequiredError;
const NotFoundError = require('../error/notFoundError').NotFoundError;
const {User} = require('../model/user');
const PassboltBadResponseError = require('../error/passboltBadResponseError').PassboltBadResponseError;
const PassboltServiceUnavailableError = require('../error/passboltServiceUnavailableError').PassboltServiceUnavailableError;

class AuthService {}

/**
 * Indentify which entry point should be used to check if the user is authenticated.
 * The entry point /auth/is-authenticated is available since API > v2.11.0.
 * The entry point /auth/checksession is deprecated since API > v2.11.0, because it extended the session expiry.
 * @var {bool}
 */
AuthService.useLegacyIsAuthenticatedEntryPoint = null;

/**
 * Check if the current user is authenticated.
 *
 * @return {Promise<bool>}
 */
AuthService.isAuthenticated = async function () {
  let isAuthenticated;

  // The entry point to request has not yet been defined.
  // @see the variable AuthService.useLegacyIsAuthenticatedEntryPoint definition.
  if (AuthService.useLegacyIsAuthenticatedEntryPoint === null) {
    try {
      isAuthenticated = await _isAuthenticated();
      AuthService.useLegacyIsAuthenticatedEntryPoint = false;
    } catch (error) {
      // If a NotFoundError error is thrown it means that the entry point does not exist and
      // so the API < v2.11.0.
      // @see the variable AuthService.useLegacyIsAuthenticatedEntryPoint definition.
      if (error instanceof NotFoundError) {
        isAuthenticated = await _isAuthenticatedLegacy();
        AuthService.useLegacyIsAuthenticatedEntryPoint = true;
      } else {
        throw error;
      }
    }
  } else {
    if (AuthService.useLegacyIsAuthenticatedEntryPoint) {
      isAuthenticated = await _isAuthenticatedLegacy();
    } else {
      isAuthenticated = await _isAuthenticated();
    }
  }

  return isAuthenticated;
};

/**
 * Check if a user is authenticated using the entry point /auth/is-authenticated.
 * @return {Promise<bool>}
 */
const _isAuthenticated = async function () {
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
  }
  // Entry point not found.
  else if (response.status === 404) {
    throw new NotFoundError();
  }

  return false;
};

/**
 * Check if a user is authenticated using the deprecated entry point /auth/checksession
 * @return {Promise<bool>}
 * @deprecated The /auth/checksession entry point is not available since v2.11.0, if >= v2.11.0 use /auth/is-authenticated instead
 */
const _isAuthenticatedLegacy = async function () {
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
  const url = `${domain}/auth/checksession.json`;
  let response;

  try {
    response = await fetch(url, fetchOptions);
  } catch (error) {
    // Catch Network error such as connection lost.
    throw new PassboltServiceUnavailableError(error.message);
  }

  try {
    responseJson = await response.json();
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
  }
  // Entry point not found.
  else if (response.status == 404) {
    throw new NotFoundError();
  }

  return false;
};

exports.AuthService = AuthService;
