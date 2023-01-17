/**
 * Auth events.
 *
 * Used to handle the events related to authentication.
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
import Keyring from "../model/keyring";
import User from "../model/user";
import AuthModel from "../model/auth/authModel";
import AuthVerifyServerKeyController from "../controller/auth/authVerifyServerKeyController";
import AuthCheckStatusController from "../controller/auth/authCheckStatusController";
import AuthIsAuthenticatedController from "../controller/auth/authIsAuthenticatedController";
import AuthIsMfaRequiredController from "../controller/auth/authIsMfaRequiredController";
import CheckPassphraseController from "../controller/crypto/checkPassphraseController";
import RequestHelpCredentialsLostController from "../controller/auth/requestHelpCredentialsLostController";
import {Config} from "../model/config";
import AzureSsoAuthenticationController from "../controller/sso/azureSsoAuthenticationController";
import AuthLoginController from "../controller/auth/authLoginController";
import GetLocalSsoProviderConfiguredController from "../controller/sso/getLocalSsoProviderConfiguredController";

const listen = function(worker, account) {
  /*
   * Check if the user is authenticated.
   *
   * @listens passbolt.auth.is-authenticated
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.auth.is-authenticated', async(requestId, options) => {
    const controller = new AuthIsAuthenticatedController(worker, requestId);
    controller.main(options);
  });

  /*
   * Check if the user requires to complete the mfa.
   *
   * @listens passbolt.auth.is-mfa-required
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.auth.is-mfa-required', async requestId => {
    const controller = new AuthIsMfaRequiredController(worker, requestId);
    controller.main();
  });

  /*
   * Check the user auth status.
   *
   * @listens passbolt.auth.check-status
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.auth.check-status', async requestId => {
    const controller = new AuthCheckStatusController(worker, requestId);
    controller.main();
  });

  /*
   * Logout.
   *
   * @listens passbolt.auth.logout
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.auth.logout', async requestId => {
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
  worker.port.on('passbolt.auth.navigate-to-logout', async() => {
    const user = User.getInstance();
    const apiClientOptions = await user.getApiClientOptions();
    const auth = new AuthModel(apiClientOptions);
    const url = `${user.settings.getDomain()}/auth/logout`;

    try {
      await chrome.tabs.update(worker.tab.id, {url: url});
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
  worker.port.on('passbolt.auth.verify-server-key', async requestId => {
    const user = User.getInstance();
    const apiClientOptions = await user.getApiClientOptions({requireCsrfToken: false});
    const userDomain = user.settings.getDomain();
    const auth = new AuthVerifyServerKeyController(worker, requestId, apiClientOptions, userDomain);
    await auth._exec();
  });

  /*
   * Get the password server key for a given domain.
   *
   * @listens passbolt.auth.get-server-key
   * @param requestId {uuid} The request identifier
   * @param domain {string} The server's domain
   */
  worker.port.on('passbolt.auth.get-server-key', async requestId => {
    try {
      const clientOptions = await User.getInstance().getApiClientOptions();
      const authModel = new AuthModel(clientOptions);
      const serverKeyDto = await authModel.getServerKey();
      worker.port.emit(requestId, 'SUCCESS', serverKeyDto);
    } catch (error) {
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
  worker.port.on('passbolt.auth.replace-server-key', async requestId => {
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
  worker.port.on('passbolt.auth.verify-passphrase', async(requestId, passphrase) => {
    const controller = new CheckPassphraseController(worker, requestId);
    await controller._exec(passphrase);
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
  worker.port.on('passbolt.auth.login', async(requestId, passphrase, remember) => {
    const clientOptions = await User.getInstance().getApiClientOptions(); //@todo remove and use a glocal apiClientOptions;
    const controller = new AuthLoginController(worker, requestId, clientOptions);
    await controller._exec(passphrase, remember);
  });

  /*
   * Redirect the user post login.
   *
   * @listens passbolt.auth.post-login-redirect
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.auth.post-login-redirect', requestId => {
    let url = Config.read('user.settings.trustedDomain');
    const redirectTo = (new URL(worker.tab.url)).searchParams.get('redirect');
    if (/^\/[A-Za-z0-9\-\/]*$/.test(redirectTo)) {
      url = `${url}${redirectTo}`;
    }
    chrome.tabs.update(worker.tab.id, {url: url});
    worker.port.emit(requestId, 'SUCCESS');
  });

  /*
   * Request help credentials lost.
   *
   * @listens passbolt.auth.request-help-credentials-lost
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.auth.request-help-credentials-lost', async requestId => {
    const apiClientOptions = await User.getInstance().getApiClientOptions();
    const controller = new RequestHelpCredentialsLostController(worker, requestId, apiClientOptions, account);
    await controller._exec();
  });

  /**
   * Attempt to sign in with Azure as a third party sign in provider
   * @listens passbolt.sso.sign-in-with-azure
   * @param {uuid} requestId The request identifier
   */
  worker.port.on('passbolt.sso.sign-in-with-azure', async requestId => {
    const apiClientOptions = await User.getInstance().getApiClientOptions();
    const controller = new AzureSsoAuthenticationController(worker, requestId, apiClientOptions, account);
    await controller._exec();
  });

  /**
   * Returns the sso provider id registered client-side.
   * @listens passbolt.sso.get-local-configured-provider
   * @param {uuid} requestId The request identifier
   */
  worker.port.on('passbolt.sso.get-local-configured-provider', async requestId => {
    const controller = new GetLocalSsoProviderConfiguredController(worker, requestId);
    await controller._exec();
  });
};

export const AuthEvents = {listen};
