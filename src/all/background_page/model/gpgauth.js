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
import {OpenpgpAssertion} from "../utils/openpgp/openpgpAssertions";
import Keyring from "./keyring";
import EncryptMessageService from "../service/crypto/encryptMessageService";
import DecryptMessageService from "../service/crypto/decryptMessageService";
import CompareGpgKeyService from "../service/crypto/compareGpgKeyService";
import User from "./user";
import AuthStatusLocalStorage from "../service/local_storage/authStatusLocalStorage";
import {Uuid} from "../utils/uuid";
import GpgAuthToken from "./gpgAuthToken";
import MfaAuthenticationRequiredError from "../error/mfaAuthenticationRequiredError";
import GpgAuthHeader from "./gpgAuthHeader";
import GetGpgKeyInfoService from "../service/crypto/getGpgKeyInfoService";
import AuthService from "../service/auth";
import Request from "./request";
import urldecode from 'locutus/php/url/urldecode';
import stripslashes from 'locutus/php/strings/stripslashes';

const URL_VERIFY = '/auth/verify.json?api-version=v2';
const URL_LOGIN = '/auth/login.json?api-version=v2';

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
   * Verify the server identify
   *
   * @param {string} [serverUrl] optional
   * @param {string} [serverArmoredKey] optional
   * @param {string} [userFingerprint] optional
   * @throws {Error} if domain is undefined in settings and serverUrl is not provided
   * @throws {Error} if verification procedure fails
   * @returns {Promise<void>}
   */
  async verify(serverUrl, serverArmoredKey, userFingerprint) {
    const domain = serverUrl || this.getDomain();
    serverArmoredKey = serverArmoredKey || this.keyring.findPublic(Uuid.get(domain)).armoredKey;
    const fingerprint = userFingerprint || this.keyring.findPrivate().fingerprint;

    // Encrypt a random token
    let encrypted, originalToken;
    try {
      originalToken = new GpgAuthToken();
      const serverKey = await OpenpgpAssertion.readKeyOrFail(serverArmoredKey);
      encrypted = await EncryptMessageService.encrypt(originalToken.token, serverKey);
    } catch (error) {
      throw new Error(`Unable to encrypt the verify token. ${error.message}`);
    }

    // Prepare the request data
    const data = new FormData();
    data.append('data[gpg_auth][keyid]', fingerprint);
    data.append('data[gpg_auth][server_verify_token]', encrypted);

    // Send the data
    const fetchOptions = {
      method: 'POST',
      credentials: 'include',
      body: data
    };
    Request.setCsrfHeader(fetchOptions, User.getInstance());
    const response = await fetch(domain + URL_VERIFY, fetchOptions);

    // If the server responded with an error build a relevant message
    if (!response.ok) {
      const json = await response.json();
      if (typeof json.header !== 'undefined') {
        throw new Error(json.header.message);
      } else {
        const msg = `Server request failed (${response.status}) without providing additional information.`;
        throw new Error(msg);
      }
    }

    // Check that the server was able to decrypt the token with our local copy
    const auth = new GpgAuthHeader(response.headers, 'verify');
    const verifyToken = new GpgAuthToken(auth.headers['x-gpgauth-verify-response']);
    if (verifyToken.token !== originalToken.token) {
      throw new Error('The server was unable to prove it can use the advertised OpenPGP key.');
    }
  }

  /**
   * Check if the server key has changed
   * @return {Promise<boolean>} true if key has changed
   */
  async serverKeyChanged() {
    const remoteServerArmoredKey = (await this.getServerKey()).keydata;
    const remoteServerKey = await OpenpgpAssertion.readKeyOrFail(remoteServerArmoredKey);
    const serverLocalArmoredKey = this.getServerKeyFromKeyring().armoredKey;
    const serverLocalKey = await OpenpgpAssertion.readKeyOrFail(serverLocalArmoredKey);
    return !await CompareGpgKeyService.areKeysTheSame(remoteServerKey, serverLocalKey);
  }

  /**
   * Get Server key from keyring
   * @returns {ExternalGpgKeyEntity}
   */
  getServerKeyFromKeyring() {
    return this.keyring.findPublic(Uuid.get(this.getDomain()));
  }

  /**
   * isServerKeyExpired
   * @returns {boolean}
   */
  isServerKeyExpired() {
    const key = this.getServerKeyFromKeyring();
    return key.isExpired;
  }

  /**
   * Get Server key for GPG auth.
   *
   * @param {string} [serverUrl] optional domain where to get the key.
   * if domain is not provided, then look in the settings.
   *
   * @returns {Promise.<object>}
   */
  async getServerKey(serverUrl) {
    const domain = serverUrl || this.getDomain();
    const response = await fetch(domain + URL_VERIFY, {
      method: 'GET',
      credentials: 'include'
    });

    if (!response.ok) {
      const msg = 'There was a problem when trying to communicate with the server' + ` (Code: ${response.status})`;
      throw new Error(msg);
    }

    const json = await response.json();
    return json.body;
  }

  /**
   * GPGAuth Login - handle stage1, stage2 and complete
   *
   * @param {openpgp.PrivateKey} privateKey The decrypted private key to use to decrypt the message.
   * @returns {Promise.<string>} referrer url
   */
  async login(privateKey) {
    const privateKeyInfo = await GetGpgKeyInfoService.getKeyInfo(privateKey);
    const userAuthToken = await this.stage1(privateKeyInfo);
    await this.stage2(userAuthToken, privateKeyInfo);
  }

  /**
   * GPGAuth stage1 - get and decrypt a verification given by the server
   *
   * @param {ExternalGpgKeyEntity} privateKey The decrypted private key to use to decrypt the message.
   * @returns {Promise.<string>} token
   */
  async stage1(privateKey) {
    // Prepare request data
    const url = this.getDomain() + URL_LOGIN;
    const body = new FormData();
    body.append('data[gpg_auth][keyid]', privateKey.fingerprint);
    const fetchOptions = {
      method: 'POST',
      credentials: 'include',
      body: body
    };
    Request.setCsrfHeader(fetchOptions, User.getInstance());

    // Send request token to the server
    const response = await fetch(url, fetchOptions);
    if (!response.ok) {
      return this.onResponseError(response);
    }

    // Check headers
    const auth = new GpgAuthHeader(response.headers, 'stage1');

    // Try to decrypt the User Auth Token
    const encryptedUserAuthToken = stripslashes(urldecode(auth.headers['x-gpgauth-user-auth-token']));
    const decryptionKey = await OpenpgpAssertion.readKeyOrFail(privateKey.armoredKey);
    const encryptedMessage = await OpenpgpAssertion.readMessageOrFail(encryptedUserAuthToken);
    const userAuthToken = await DecryptMessageService.decrypt(encryptedMessage, decryptionKey);

    // Validate the User Auth Token
    const authToken = new GpgAuthToken(userAuthToken);
    return authToken.token;
  }

  /**
   * Stage 2. send back the token to the server to get auth cookie
   *
   * @param userAuthToken {string} The user authentication token
   * @param {ExternalGpgKeyEntity} privateKey decrypted private key
   * @returns {Promise.<string>} url to redirect the user to
   */
  async stage2(userAuthToken, privateKey) {
    // Prepare request data
    const url = this.getDomain() + URL_LOGIN;
    const domain = User.getInstance().settings.getDomain();
    const data = new FormData();
    data.append('data[gpg_auth][keyid]', privateKey.fingerprint);
    data.append('data[gpg_auth][user_token_result]', userAuthToken);

    // Send it over
    const fetchOptions = {
      method: 'POST',
      credentials: 'include',
      body: data
    };
    Request.setCsrfHeader(fetchOptions, User.getInstance());
    const response = await fetch(url, fetchOptions);

    // Check response status
    if (!response.ok) {
      await this.onResponseError(response);
    }

    // Check the headers and return the redirection url
    const auth = new GpgAuthHeader(response.headers, 'complete');
    return domain + auth.headers['x-gpgauth-refer'];
  }

  /**
   * Handle the creation of an error when response status is no ok
   *
   * @param response {object}
   * @returns {Promise.<error>} throw a relevant exception
   */
  async onResponseError(response) {
    const error_msg = 'There was a server error. No additional information provided' + `(${response.status}`;
    let json;
    try {
      json = await response.json();
    } catch (error) {
      throw new Error(error_msg);
    }
    if (typeof json.header !== 'undefined') {
      throw new Error(json.header.message);
    }
    throw new Error(error_msg);
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
