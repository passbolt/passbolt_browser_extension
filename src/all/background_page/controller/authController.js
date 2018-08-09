/**
 * Authentication controller
 * Manages login steps and post login operations
 * Can be extended to add 2FA, etc. and avoid clutering the event worker
 *
 * @copyright (c) 2018 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const GpgAuth = require('../model/gpgauth').GpgAuth;
const app = require('../app');

const User = require('../model/user').User;
const __ = require('../sdk/l10n').get;
const Worker = require('../model/worker');

/**
 * Auth Controller constructor.
 * @constructor
 */
const AuthController = function(worker, requestId) {
  this.worker = worker;
  this.requestId = requestId;
  this.auth = new GpgAuth();
};

/**
 * Perform a GPGAuth verify
 *
 * @returns {Promise<void>}
 */
AuthController.prototype.verify = async function() {
  let msg;
  try {
    await this.auth.verify();
    msg = __('The server key is verified. The server can use it to sign and decrypt content.');
    this.worker.port.emit(this.requestId, 'SUCCESS', msg);
  } catch (error) {
    msg = __('Could not verify server key.') + ' ' + error.message;
    this.worker.port.emit(this.requestId, 'ERROR', msg);
  }
};

/**
 * Handle the click on the passbolt toolbar icon.
 *
 * @returns {Promise<void>}
 */
AuthController.prototype.login = async function(passphrase, remember, redirect) {
  const tabId = this.worker.tab.id;
  if (!redirect || redirect[0] != '/') {
    redirect = '/';
  }

  Worker.get('Auth', tabId).port.emit('passbolt.auth.login-processing', __('Logging in'));
  try {
    await this.auth.login(passphrase);
  } catch(error) {
    Worker.get('Auth', tabId).port.emit('passbolt.auth.login-failed', error.message);
    return;
  }

  const user = User.getInstance();
  try {
    await user.settings.sync()
  } catch(error) {
    console.error('User settings sync failed');
    console.error(error.message);
    user.settings.setDefaults();
  }

  // set remember master passphrase
  if (remember !== undefined && remember !== false) {
    user.storeMasterPasswordTemporarily(passphrase, remember);
  }

  // Init the app pagemod
  app.pageMods.PassboltApp.init().then(() => {
    // Redirect the user.
    const msg = __('You are now logged in!');
    Worker.get('Auth', tabId).port.emit('passbolt.auth.login-success', msg, redirect);
  });
};

// Exports the User object.
exports.AuthController = AuthController;
