/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         4.0.0
 */
import browser from "../all/background_page/sdk/polyfill/browserPolyfill";
import PortManager from "../all/background_page/sdk/port/portManager";
import WebNavigationService from "../all/background_page/service/webNavigation/webNavigationService";
import LocalStorageService from "../all/background_page/service/localStorage/localStorageService";
import SystemRequirementService from "../all/background_page/service/systemRequirementService/systemRequirementService";
import OnExtensionInstalledController from "../all/background_page/controller/extension/onExtensionInstalledController";

/**
 * Load all system requirement
 */
SystemRequirementService.get();

/**
 * Add listener on passbolt logout
 */
self.addEventListener("passbolt.auth.after-logout", LocalStorageService.flush);

/**
 * Add listener on startup
 */
browser.runtime.onStartup.addListener(LocalStorageService.flush);

/**
 * On installed the extension, add first install in the url tab of setup or recover
 */
browser.runtime.onInstalled.addListener(OnExtensionInstalledController.exec);

/**
 * Add listener on any on complete navigation
 */
browser.webNavigation.onCompleted.addListener(WebNavigationService.exec);

/**
 * Add listener on connect port
 */
browser.runtime.onConnect.addListener(PortManager.onPortConnect);

/**
 * Add listener on tabs on removed
 */
browser.tabs.onRemoved.addListener(PortManager.onTabRemoved);
