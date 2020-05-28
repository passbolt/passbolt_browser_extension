/**
 * Authentication controller
 * Manages login steps and post login operations
 * Can be extended to add 2FA, etc. and avoid clutering the event worker
 *
 * @copyright (c) 2018 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const app = require('../app');
var Config = require('../model/config');
const GpgAuth = require('../model/gpgauth').GpgAuth;

const User = require('../model/user').User;
const __ = require('../sdk/l10n').get;
const Worker = require('../model/worker');

const KeyIsExpiredError = require('../error/keyIsExpiredError').KeyIsExpiredError;
const ServerKeyChangedError = require('../error/serverKeyChangedError').ServerKeyChangedError;

/**
 * Auth Controller constructor.
 * @constructor
 */
const AuthController = function (worker, requestId) {
  this.worker = worker;
  this.requestId = requestId;
  this.auth = new GpgAuth();
};

/**
 * Perform a GPGAuth verify
 *
 * @returns {Promise<void>}
 */
AuthController.prototype.verify = async function () {
  let msg;
  try {
    await this.auth.verify();
    msg = __('The server key is verified. The server can use it to sign and decrypt content.');
    this.worker.port.emit(this.requestId, 'SUCCESS', msg);
  } catch (error) {
    if (await this.auth.serverKeyChanged()) {
      error = new ServerKeyChangedError(__('The server key has changed.'));
    } else if (await this.auth.isServerKeyExpired()) {
      error = new KeyIsExpiredError(__('The server key is expired.'));
    }

    error.message =  `${__('Could not verify server key.')} ${error.message}`;
    this.worker.port.emit(this.requestId, 'ERROR', this.worker.port.getEmitableError(error));
  }
};

/**
 * Handle the click on the passbolt toolbar icon.
 *
 * @returns {Promise<void>}
 */
AuthController.prototype.login = async function (passphrase, remember, redirect) {
  const user = User.getInstance();

  this._beforeLogin();
  try {
    await user.retrieveAndStoreCsrfToken();
    await this.auth.login(passphrase);
    if (remember) {
      user.storeMasterPasswordTemporarily(passphrase, -1);
    }
    await this.auth.startCheckAuthStatusLoop();
    await this._syncUserSettings();
    this._handleLoginSuccess(redirect);
  } catch (error) {
    this._handleLoginError(error);
  }
};

/**
 * Before login hook
 */
AuthController.prototype._beforeLogin = function () {
  // If the worker at the origin of the login is the AuthForm.
  // Keep a reference of the tab id into this._tabId.
  // Request the Auth worker to display a processing feedback.
  if (this.worker.pageMod && this.worker.pageMod.args.name == "AuthForm") {
    this._tabId = this.worker.tab.id;
    Worker.get('Auth', this._tabId).port.emit('passbolt.auth.login-processing', __('Logging in'));
  }
};

/**
 * Sync the user account settings.
 * @returns {Promise<void>}
 */
AuthController.prototype._syncUserSettings = async function () {
  const user = User.getInstance();
  try {
    await user.settings.sync()
  } catch (error) {
    // fail silently for CE users
    user.settings.setDefaults();
  }
};

/**
 * Handle a login success
 * @param {string} redirect url (optional)
 * @param {Error} redirect The uri to redirect the user to after login.
 */
AuthController.prototype._handleLoginSuccess = async function (redirect) {
  await app.pageMods.PassboltApp.init();

  if (this.worker.pageMod && this.worker.pageMod.args.name == "AuthForm") {
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
};

/**
 * Handle a login failure
 * @param {Error} error The caught error
 */
AuthController.prototype._handleLoginError = function (error) {
  if (this.worker.pageMod && this.worker.pageMod.args.name == "AuthForm") {
    Worker.get('Auth', this._tabId).port.emit('passbolt.auth.login-failed', error.message);
  } else {
    this.worker.port.emit(this.requestId, "ERROR", this.worker.port.getEmitableError(error));
  }
};

// Exports the User object.
exports.AuthController = AuthController;
