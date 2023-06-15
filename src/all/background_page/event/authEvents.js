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
import AuthLoginController from "../controller/auth/authLoginController";
import GetLocalSsoProviderConfiguredController from "../controller/sso/getLocalSsoProviderConfiguredController";
import SsoAuthenticationController from "../controller/sso/ssoAuthenticationController";
import SsoSettingsEntity from "../model/entity/sso/ssoSettingsEntity";
import DeleteLocalSsoKitController from "../controller/sso/deleteLocalSsoKitController";
import UpdateLocalSsoProviderController from "../controller/sso/updateLocalSsoProviderController";
import HasSsoLoginErrorController from "../controller/sso/hasSsoLoginErrorController";
import GetQualifiedSsoLoginErrorController from "../controller/sso/getQualifiedSsoLoginErrorController";
import AuthLogoutController from "../controller/auth/authLogoutController";

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
  worker.port.on('passbolt.auth.logout', async(requestId, withRedirection) => {
    const apiClientOptions = await User.getInstance().getApiClientOptions();
    const controller = new AuthLogoutController(worker, requestId, apiClientOptions);
    await controller._exec(withRedirection);
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
    const controller = new AuthLoginController(worker, requestId, clientOptions, account);
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
   * Performs a sign-in via SSO with the selected provider
   * @param {uuid} requestId the request identifier
   * @param {boolean} isInQuickaccessMode is the current call made from the quickaccess
   * @param {string} provider the SSO provider identifier
   */
  async function signInWithSso(requestId, isInQuickaccessMode, provider) {
    const user = await User.getInstance();
    //sometimes, the CSRF token is not set properly before the login and blocks the user
    await user.retrieveAndStoreCsrfToken();
    const apiClientOptions = await user.getApiClientOptions();
    const controller = new SsoAuthenticationController(worker, requestId, apiClientOptions, account);
    await controller._exec(provider, isInQuickaccessMode);
  }

  /**
   * Attempt to sign in with Azure as a third party sign in provider
   * @listens passbolt.sso.sign-in-with-azure
   * @param {uuid} requestId The request identifier
   */
  worker.port.on('passbolt.sso.sign-in-with-azure', async(requestId, isInQuickaccessMode) => {
    await signInWithSso(requestId, isInQuickaccessMode, SsoSettingsEntity.AZURE);
  });

  /**
   * Attempt to sign in with Google as a third party sign in provider
   * @listens passbolt.sso.sign-in-with-google
   * @param {uuid} requestId The request identifier
   */
  worker.port.on('passbolt.sso.sign-in-with-google', async(requestId, isInQuickaccessMode) => {
    await signInWithSso(requestId, isInQuickaccessMode, SsoSettingsEntity.GOOGLE);
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

  /**
   * Deletes the SSO kit stored locally
   * @listens passbolt.sso.delete-local-kit
   * @param {uuid} requestId The request identifier
   */
  worker.port.on('passbolt.sso.delete-local-kit', async requestId => {
    const controller = new DeleteLocalSsoKitController(worker, requestId);
    await controller._exec();
  });

  /**
   * Updates the SSO kit stored locally
   * @listens passbolt.sso.update-provider-local-kit
   * @param {uuid} requestId The request identifier
   * @param {string} ssoProviderId The new provider to set
   */
  worker.port.on('passbolt.sso.update-provider-local-kit', async(requestId, ssoProviderId) => {
    const controller = new UpdateLocalSsoProviderController(worker, requestId);
    await controller._exec(ssoProviderId);
  });

  /**
   * Checks wether the current tab URL is an SSO login error URL
   * @listens passbolt.sso.has-sso-login-error
   * @param {uuid} requestId The request identifier
   */
  worker.port.on('passbolt.sso.has-sso-login-error', async requestId => {
    const controller = new HasSsoLoginErrorController(worker, requestId);
    await controller._exec();
  });

  /**
   * Returns a qualified error based on the local SSO kit configuration and the API configuration
   * @listens passbolt.sso.get-qualified-sso-login-error
   * @param {uuid} requestId The request identifier
   */
  worker.port.on('passbolt.sso.get-qualified-sso-login-error', async requestId => {
    const apiClientOptions = await User.getInstance().getApiClientOptions();
    const controller = new GetQualifiedSsoLoginErrorController(worker, requestId, apiClientOptions);
    await controller._exec();
  });
};

export const AuthEvents = {listen};
