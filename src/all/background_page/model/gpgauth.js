/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SARL (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         2.9.0
 */
import Keyring from "./keyring";
import User from "./user";
import AuthStatusLocalStorage from "../service/local_storage/authStatusLocalStorage";
import MfaAuthenticationRequiredError from "../error/mfaAuthenticationRequiredError";
import AuthService from "../service/auth";

/**
 * GPGAuth authentication
 * @constructor
 */
class GpgAuth {
  /**
   * @param {Keyring} [keyring] optional
   */
  constructor(keyring) {
    this.keyring = keyring ? keyring : new Keyring();

    // Latest stored auth user status.
    this.authStatus = null;
  }

  /**
   * Alias for User settings get domain
   *
   * @throw {Error} if the trusted domain is not set
   * @returns {string}
   */
  getDomain() {
    return User.getInstance().settings.getDomain();
  }

  /**
   * Check if the user is authenticated.
   * @param {object} [options] Optional parameters
   * - options.requestApi {bool}, get the status from the API, default true.
   * @return {bool}
   */
  async isAuthenticated(options) {
    const authStatus = await this.checkAuthStatus(options);
    return authStatus.isAuthenticated;
  }

  /**
   * Check if the user needs to complete the MFA.
   *
   * @return {bool}
   */
  async isMfaRequired() {
    const authStatus = await this.checkAuthStatus();
    return authStatus.isMfaRequired;
  }

  /**
   * Request the server and retrieve the auth status.
   * @param {object} [options] Optional parameters
   * - options.requestApi {bool}, get the status from the API, default true.
   * @return {object}
   *  {
   *    isAuthenticated: {bool} true if the user is authenticated, false otherwise
   *    isMfaRequired: {bool} true if the mfa is required, false otherwise.
   *  }
   */
  async checkAuthStatus(options) {
    let isAuthenticated, isMfaRequired;
    // Define options.
    options = Object.assign({
      requestApi: true
    }, options);

    /*
     * No request to API required, return the latest stored information.
     * Check in the local storage if any
     */
    if (!options.requestApi) {
      try {
        const storedStatus = await AuthStatusLocalStorage.get();
        if (storedStatus) {
          this.authStatus = storedStatus;
          return this.authStatus;
        }
      } catch (error) {
        /*
         * Nothing found, check with the API
         * continue...
         */
      }
    }

    try {
      isAuthenticated = await AuthService.isAuthenticated();
      isMfaRequired = false;
    } catch (error) {
      if (error instanceof MfaAuthenticationRequiredError) {
        isAuthenticated = true;
        isMfaRequired = true;
      } else {
        throw error;
      }
    }

    this.authStatus = {isAuthenticated: isAuthenticated, isMfaRequired: isMfaRequired};
    await AuthStatusLocalStorage.set(isAuthenticated, isMfaRequired);
    return this.authStatus;
  }
}
// Exports the Authentication model object.
export default GpgAuth;
