/**
 * Background script
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
import PortManager from "./sdk/port/portManager";
import SystemRequirementService from "./service/systemRequirementService/systemRequirementService";
import OnExtensionInstalledController from "./controller/extension/onExtensionInstalledController";
import TabService from "./service/tab/tabService";
import User from "./model/user";
import Log from "./model/log";
import OnExtensionUpdateAvailableService from "./service/extension/onExtensionUpdateAvailableService";
import CheckAuthStatusService from "./service/auth/checkAuthStatusService";
import GlobalAlarmService from "./service/alarm/globalAlarmService";
import PostLoginService from "./service/auth/postLoginService";
import PostLogoutService from "./service/auth/postLogoutService";
import OnStartUpService from "./service/extension/onStartUpService";

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

  let authStatus;
  try {
    const checkAuthStatusService = new CheckAuthStatusService();
    authStatus = await checkAuthStatusService.checkAuthStatus(true);
  } catch (error) {
    // Service is unavailable, do nothing...
    Log.write({level: 'debug', message: 'The Service is unavailable to check if the user is authenticated'});
    return;
  }

  if (authStatus.isAuthenticated) {
    PostLoginService.exec();
  } else {
    PostLogoutService.exec();
  }
};

main();

/**
 * On installed the extension, add first install in the url tab of setup or recover
 */
browser.runtime.onInstalled.addListener(OnExtensionInstalledController.exec);

/**
 * On update available of the extension, update it when the user is logout
 */
browser.runtime.onUpdateAvailable.addListener(OnExtensionUpdateAvailableService.exec);

/**
 * Add listener on startup
 */
browser.runtime.onStartup.addListener(OnStartUpService.exec);

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
 * Ensures the top-level alarm handler is not triggered twice
 */
browser.alarms.onAlarm.removeListener(GlobalAlarmService.exec);

/**
 * Add a top-level alarm handler.
 */
browser.alarms.onAlarm.addListener(GlobalAlarmService.exec);
