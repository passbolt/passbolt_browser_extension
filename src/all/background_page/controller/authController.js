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
 * @since         2.0.0
 */
const __ = require('../sdk/l10n').get;
const app = require('../app');
const Config = require('../model/config');
const Worker = require('../model/worker');
const {UserNotFoundError} = require("../error/UserNotFoundError");

const {GpgAuth} = require('../model/gpgauth');
const {User} = require('../model/user');
const {Crypto} = require('../model/crypto');
const {Keyring} = require('../model/keyring');
const {KeyIsExpiredError} = require('../error/keyIsExpiredError');
const {ServerKeyChangedError} = require('../error/serverKeyChangedError');

class AuthController {
   /**
   * AuthController Constructor
   *
   * @param {Worker} worker
   * @param {string} requestId
   */
  constructor(worker, requestId) {
    this.worker = worker;
    this.requestId = requestId;
    this.keyring = new Keyring();
    this.crypto = new Crypto(this.keyring);
    this.auth = new GpgAuth(this.keyring);
  }

  /**
   * Perform a GPGAuth verify
   *
   * @returns {Promise<void>}
   */
  async verify() {
    let msg;
    try {
      await this.auth.verify();
      msg = __('The server key is verified. The server can use it to sign and decrypt content.');
      this.worker.port.emit(this.requestId, 'SUCCESS', msg);
    } catch (error) {
      if (error.message.indexOf('no user associated') !== -1) {
        error = new UserNotFoundError(__('There is no user associated with this key.'));
      } else if (await this.auth.serverKeyChanged()) {
        error = new ServerKeyChangedError(__('The server key has changed.'));
      } else if (await this.auth.isServerKeyExpired()) {
        error = new KeyIsExpiredError(__('The server key is expired.'));
      }

      error.message = `${__('Could not verify server key.')} ${error.message}`;
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Handle the click on the passbolt toolbar icon.
   *
   * @returns {Promise<void>}
   * @deprecated
   */
  async login(passphrase, remember, redirect) {
    const user = User.getInstance();

    this.beforeLogin();
    try {
      await user.retrieveAndStoreCsrfToken();
      const privateKey = await this.crypto.getAndDecryptPrivateKey(passphrase);
      await this.auth.login(privateKey);

      // Post login operations
      // MFA may not be complete yet, so no need to preload things here
      if (remember) {
        user.storeMasterPasswordTemporarily(passphrase, -1);
      }
      await this.auth.startCheckAuthStatusLoop();
      await app.pageMods.PassboltApp.init();

      // Move on to MFA or main screen
      this.handleLoginSuccess(redirect);
    } catch (error) {
      this.handleLoginError(error);
    }
  };

  /**
   * Before login hook
   *
   * @return {void}
   * @deprecated
   */
  beforeLogin() {
    // If the worker at the origin of the login is the AuthForm.
    // Keep a reference of the tab id into this._tabId.
    // Request the Auth worker to display a processing feedback.
    if (this.worker.pageMod && this.worker.pageMod.args.name === "AuthForm") {
      this._tabId = this.worker.tab.id;
      Worker.get('Auth', this._tabId).port.emit('passbolt.auth.login-processing', __('Logging in'));
    }
  }

  /**
   * Handle a login success
   *
   * @param {string} redirect url (optional)
   * @param {Error} redirect The uri to redirect the user to after login.
   * @return {void}
   * @deprecated
   */
  async handleLoginSuccess(redirect) {
    if (this.worker.pageMod && this.worker.pageMod.args.name === "AuthForm") {
      let url;
      const trustedDomain = Config.read('user.settings.trustedDomain');

      // The application authenticator requires the success to be sent on another worker (Auth).
      // It will notify the users and redirect them.
      if (!redirect || !(typeof redirect === 'string' || redirect instanceof String) || redirect.charAt(0) !== '/') {
        url = new URL(trustedDomain);
      } else {
        url = new URL(trustedDomain + redirect);
      }
      redirect = url.href;
      const msg = __('You are now logged in!');
      Worker.get('Auth', this._tabId).port.emit('passbolt.auth.login-success', msg, redirect);
    } else {
      this.worker.port.emit(this.requestId, "SUCCESS");
    }
  }

  /**
   * Handle a login failure
   * @param {Error} error The caught error
   * @return {void}
   * @deprecated
   */
  handleLoginError(error) {
    if (this.worker.pageMod && this.worker.pageMod.args.name === "AuthForm") {
      Worker.get('Auth', this._tabId).port.emit('passbolt.auth.login-failed', error.message);
    } else {
      this.worker.port.emit(this.requestId, "ERROR", error);
    }
  }
}

exports.AuthController = AuthController;