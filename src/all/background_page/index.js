/**
 * Background script
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
import browser from "./sdk/polyfill/browserPolyfill";
import PortManager from "./sdk/port/portManager";
import SystemRequirementService from "./service/systemRequirementService/systemRequirementService";
import LocalStorageService from "./service/localStorage/localStorageService";
import OnExtensionInstalledController from "./controller/extension/onExtensionInstalledController";
import TabService from "./service/tab/tabService";
import User from "./model/user";
import GpgAuth from "./model/gpgauth";
import Log from "./model/log";
import StartLoopAuthSessionCheckService from "./service/auth/startLoopAuthSessionCheckService";


const main = async() => {
  /**
   * Load all system requirement
   */
  await SystemRequirementService.get();

  // When the extension is updated and the user is still connected, an event needs to be sent
  checkAndProcessIfUserAuthenticated();
};

/**
 * Check and process event if the user is authenticated
 * @return {Promise<void>}
 */
const checkAndProcessIfUserAuthenticated = async() => {
  const user = User.getInstance();
  // Check if user is valid
  if (user.isValid()) {
    const auth = new GpgAuth();
    try {
      const isAuthenticated = await auth.isAuthenticated();
      if (isAuthenticated) {
        const startLoopAuthSessionCheckService = new StartLoopAuthSessionCheckService(auth);
        await startLoopAuthSessionCheckService.exec();
        const event = new Event('passbolt.auth.after-login');
        self.dispatchEvent(event);
      }
    } catch (error) {
      /*
       * Service unavailable
       * Do nothing...
       */
      Log.write({level: 'debug', message: 'The Service is unavailable to check if the user is authenticated'});
    }
  }
};

main();


/**
 * Add listener on passbolt logout
 */
self.addEventListener("passbolt.auth.after-logout", LocalStorageService.flush);

/**
 * On installed the extension, add first install in the url tab of setup or recover
 */
browser.runtime.onInstalled.addListener(OnExtensionInstalledController.exec);

/**
 * Add listener on startup
 */
browser.runtime.onStartup.addListener(LocalStorageService.flush);

/**
 * Add listener on tab updated
 */
browser.tabs.onUpdated.addListener(TabService.exec);

/**
 * Add listener on connect port
 */
browser.runtime.onConnect.addListener(PortManager.onPortConnect);

/**
 * Add listener on tabs on removed
 */
browser.tabs.onRemoved.addListener(PortManager.onTabRemoved);

