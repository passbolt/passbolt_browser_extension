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
import OnExtensionUpdateAvailableService from "./service/extension/onExtensionUpdateAvailableService";
import GlobalAlarmService from "./service/alarm/globalAlarmService";
import OnStartUpService from "./service/extension/onStartUpService";
import ToolbarService from "./service/toolbar/toolbarService";
import BasicAuthService from "./service/auth/basicAuthService";
import BrowserService from "./service/browser/browserService";

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

if (BrowserService.isFirefox()) {
  browser.webRequest.onAuthRequired.addListener(
    (details) => BasicAuthService.handle(details),
    { urls: ["<all_urls>"] },
    ["blocking"],
  );
  browser.webRequest.onCompleted.addListener((details) => BasicAuthService.clear(details), { urls: ["<all_urls>"] });
  browser.webRequest.onErrorOccurred.addListener((details) => BasicAuthService.clear(details), { urls: ["<all_urls>"] });
}
