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
import GlobalAlarmService from "../../all/background_page/service/alarm/globalAlarmService";
import OnStartUpService from "../../all/background_page/service/extension/onStartUpService";
import ToolbarService from "../../all/background_page/service/toolbar/toolbarService";
// Registers the keyboard-shortcut command listener (e.g. passbolt-lock) on import.
import "../../all/background_page/service/toolbar/keyboardShortcutsService";
import WebNavigationService from "../../all/background_page/service/webNavigation/webNavigationService";

const main = async () => {
  /**
   * Load all system requirement
   */
  await SystemRequirementService.get();
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
 * Add listener on web navigation completed (replaces tabs.onUpdated for navigation detection).
 * The URL filter ensures only http/https navigations reach the handler.
 */
browser.webNavigation.onCompleted.addListener(WebNavigationService.exec, {
  url: [{ schemes: ["http", "https"] }],
});

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

/**
 * Handle click on the toolbar icon
 */
browser.browserAction.onClicked.addListener(ToolbarService.handleIconToolbarClicked);
