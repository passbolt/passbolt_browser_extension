/**
 * Background script
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
import PortManager from "./sdk/port/portManager";
import SystemRequirementService from "./service/systemRequirementService/systemRequirementService";
import LocalStorageService from "./service/localStorage/localStorageService";
import OnExtensionInstalledController from "./controller/extension/onExtensionInstalledController";
import TabService from "./service/tab/tabService";
import User from "./model/user";
import Log from "./model/log";
import StartLoopAuthSessionCheckService from "./service/auth/startLoopAuthSessionCheckService";
import OnExtensionUpdateAvailableController from "./controller/extension/onExtensionUpdateAvailableController";
import PostLogoutService from "./service/auth/postLogoutService";
import CheckAuthStatusService from "./service/auth/checkAuthStatusService";
import {topLevelAlarmMapping} from "./utils/topLevelAlarmMapping.data";

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
  if (!user.isValid()) {
    return;
  }

  const checkAuthStatusService = new CheckAuthStatusService();
  try {
    const authStatus = await checkAuthStatusService.checkAuthStatus(true);
    if (authStatus.isAuthenticated) {
      await StartLoopAuthSessionCheckService.exec();
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
};

main();


/**
 * Add listener on passbolt logout
 */
self.addEventListener("passbolt.auth.after-logout", PostLogoutService.exec);

/**
 * On installed the extension, add first install in the url tab of setup or recover
 */
browser.runtime.onInstalled.addListener(OnExtensionInstalledController.exec);

/**
 * On update available of the extension, update it when the user is logout
 */
browser.runtime.onUpdateAvailable.addListener(OnExtensionUpdateAvailableController.exec);

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

/**
 * Top level alarm handler to ensure alarm callbacks are still processed after the service worker awakes.
 * @param {Alarm} alarm
 */
const handleTopLevelAlarms = alarm => {
  topLevelAlarmMapping[alarm.name]?.(alarm);
};

/**
 * Ensures the top-level alarm handler is not triggered twice
 */
browser.alarms.onAlarm.removeListener(handleTopLevelAlarms);

/**
 * Add a top-level alarm handler.
 */
browser.alarms.onAlarm.addListener(handleTopLevelAlarms);
