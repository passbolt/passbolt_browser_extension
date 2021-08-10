/**
 * Auth events.
 *
 * Used to handle the events related to authentication.
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const {AuthController} = require('../controller/authController');
const {AuthCheckStatusController} = require('../controller/auth/authCheckStatusController');
const {AuthIsAuthenticatedController} = require('../controller/auth/authIsAuthenticatedController');
const {AuthIsMfaRequiredController} = require('../controller/auth/authIsMfaRequiredController');
const {AuthModel} = require("../model/auth/authModel");
const {User} = require('../model/user');
const {Keyring} = require('../model/keyring');
const Config = require('../model/config');

const listen = function (worker) {
  /*
   * Check if the user is authenticated.
   *
   * @listens passbolt.auth.is-authenticated
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.auth.is-authenticated', async function (requestId, options) {
    const controller = new AuthIsAuthenticatedController(worker, requestId);
    controller.main(options);
  });

  /*
   * Check if the user requires to complete the mfa.
   *
   * @listens passbolt.auth.is-mfa-required
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.auth.is-mfa-required', async function (requestId) {
    const controller = new AuthIsMfaRequiredController(worker, requestId);
    controller.main();
  });

  /*
   * Check the user auth status.
   *
   * @listens passbolt.auth.check-status
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.auth.check-status', async function (requestId) {
    const controller = new AuthCheckStatusController(worker, requestId);
    controller.main();
  });

  /*
   * Logout.
   *
   * @listens passbolt.auth.logout
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.auth.logout', async function (requestId) {
    const apiClientOptions = await User.getInstance().getApiClientOptions();
    const auth = new AuthModel(apiClientOptions);

    try {
      await auth.logout();
      worker.port.emit(requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR');
    }
  });

  /*
   * Navigate to logout
   *
   * @listens passbolt.auth.navigate-to-logout
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.auth.navigate-to-logout', async function () {
    const user = User.getInstance();
    const apiClientOptions = await user.getApiClientOptions();
    const auth = new AuthModel(apiClientOptions);
    const url = `${user.settings.getDomain()}/auth/logout`;

    try {
      await chrome.tabs.update(worker.tab.id, {url});
      await auth.postLogout();
    } catch (error) {
      console.error(error);
    }
  });

  /*
   * Verify the server identity.
   *
   * @listens passbolt.auth.verify
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.auth.verify-server-key', function (requestId) {
    var auth = new AuthController(worker, requestId);
    auth.verify();
  });

  /*
   * Get the password server key for a given domain.
   *
   * @listens passbolt.auth.get-server-key
   * @param requestId {uuid} The request identifier
   * @param domain {string} The server's domain
   */
  worker.port.on('passbolt.auth.get-server-key', async function (requestId, domain) {
    try {
      const clientOptions = await User.getInstance().getApiClientOptions();
      const authModel = new AuthModel(clientOptions);
      const serverKeyDto = await authModel.getServerKey();
      worker.port.emit(requestId, 'SUCCESS', serverKeyDto);
    } catch {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * Get the password server key for a given domain.
   *
   * @listens passbolt.auth.replace-server-key
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.auth.replace-server-key', async function (requestId) {
    const apiClientOptions = await User.getInstance().getApiClientOptions();
    const authModel = new AuthModel(apiClientOptions);
    const keyring = new Keyring();
    const domain = Config.read('user.settings.trustedDomain');

    try {
      const serverKeyDto = await authModel.getServerKey();
      await keyring.importServerPublicKey(serverKeyDto.armored_key, domain);
      worker.port.emit(requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * Verify the passphrase
   *
   * @listens passbolt.auth.verify-passphrase
   * @param requestId {uuid} The request identifier
   * @param passphrase {string} The passphrase to verify
   */
  worker.port.on('passbolt.auth.verify-passphrase', async function (requestId, passphrase) {
    const keyring = new Keyring();
    try {
      await keyring.checkPassphrase(passphrase);
      worker.port.emit(requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * Attempt to login the current user.
   *
   * @listens passbolt.auth.login
   * @param requestId {uuid} The request identifier
   * @param passphrase {string} The passphrase to decryt the private key
   * @param remember {string} whether to remember the passphrase
   *   (bool) false|undefined if should not remember
   *   (integer) -1 if should remember for the session
   *   (integer) duration in seconds to specify a specific duration
   */
  worker.port.on('passbolt.auth.login', async function (requestId, passphrase, remember) {
    try {
      const clientOptions = await User.getInstance().getApiClientOptions();
      const authModel = new AuthModel(clientOptions);
      await authModel.login(passphrase, remember);
      worker.port.emit(requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * Redirect the user post login.
   *
   * @listens passbolt.auth.post-login-redirect
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.auth.post-login-redirect', function(requestId) {
    let url = Config.read('user.settings.trustedDomain');
    const redirectTo = (new URL(worker.tab.url)).searchParams.get('redirect');
    if (/^\/[A-Za-z0-9\-\/]*$/.test(redirectTo)) {
      url = `${url}${redirectTo}`;
    }
    chrome.tabs.update(worker.tab.id, {url});
    worker.port.emit(requestId, 'SUCCESS');
  });
};

exports.listen = listen;
