/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         5.5.0
 */
import PortManager from "../../all/background_page/sdk/port/portManager";
import SystemRequirementService from "../../all/background_page/service/systemRequirementService/systemRequirementService";
import OnExtensionInstalledController from "../../all/background_page/controller/extension/onExtensionInstalledController";
import TabService from "../../all/background_page/service/tab/tabService";
import User from "../../all/background_page/model/user";
import Log from "../../all/background_page/model/log";
import CheckAuthStatusService from "../../all/background_page/service/auth/checkAuthStatusService";
import GlobalAlarmService from "../../all/background_page/service/alarm/globalAlarmService";
import PostLoginService from "../../all/background_page/service/auth/postLoginService";
import PostLogoutService from "../../all/background_page/service/auth/postLogoutService";
import OnStartUpService from "../../all/background_page/service/extension/onStartUpService";
import ToolbarService from "../../all/background_page/service/toolbar/toolbarService";

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

/**
 * Handle suggested resources on toolbar icon
 */
browser.tabs.onUpdated.addListener(ToolbarService.handleSuggestedResourcesOnUpdatedTab);

/**
 * Handle suggested resources on toolbar icon
 */
browser.tabs.onActivated.addListener(ToolbarService.handleSuggestedResourcesOnActivatedTab);

/**
 * Handle suggested resources on toolbar icon
 */
browser.windows.onFocusChanged.addListener(ToolbarService.handleSuggestedResourcesOnFocusedWindow);
