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
import PortManager from "../all/background_page/sdk/port/portManager";
import LocalStorageService from "../all/background_page/service/localStorage/localStorageService";
import SystemRequirementService from "../all/background_page/service/systemRequirementService/systemRequirementService";
import OnExtensionInstalledController from "../all/background_page/controller/extension/onExtensionInstalledController";
import TabService from "../all/background_page/service/tab/tabService";
import OnExtensionUpdateAvailableController
  from "../all/background_page/controller/extension/onExtensionUpdateAvailableController";

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
 * On update available of the extension, update it when the user is logout
 */
browser.runtime.onUpdateAvailable.addListener(OnExtensionUpdateAvailableController.exec);

/**
 * Add listener on any tab update
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
