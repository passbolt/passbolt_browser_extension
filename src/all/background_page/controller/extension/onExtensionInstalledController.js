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
 * @since         3.4.0
 *
 * On extension installed controller
 */
import PagemodManager from "../../pagemod/pagemodManager";
import WebNavigationService from "../../service/webNavigation/webNavigationService";
import ParseSetupUrlService from "../../service/setup/parseSetupUrlService";
import ParseRecoverUrlService from "../../service/recover/parseRecoverUrlService";
import CheckAuthStatusService from "../../service/auth/checkAuthStatusService";
import User from "../../model/user";
import Log from "../../model/log";
import {BrowserExtensionIconService} from "../../service/ui/browserExtensionIcon.service";
import storage from "../../sdk/storage";
import {Config} from "../../model/config";
import AuthModel from "../../model/auth/authModel";
import AppBootstrapPagemod from "../../pagemod/appBootstrapPagemod";

class OnExtensionInstalledController {
  /**
   * Execute the OnExtensionInstalledController process
   * @param details
   * @returns {Promise<void>}
   */
  static async exec(details) {
    // Check if the storage have some data
    if (Object.keys(storage._data).length === 0) {
      // Fix the initialization of the storage after an update
      await storage.init();
      // Initialization of the config to get the user information
      Config.init();
    }
    switch (details.reason) {
      case browser.runtime.OnInstalledReason.INSTALL:
        await OnExtensionInstalledController.onInstall();
        break;
      case browser.runtime.OnInstalledReason.UPDATE:
        await OnExtensionInstalledController.onUpdate();
        break;
      case browser.runtime.OnInstalledReason.CHROME_UPDATE:
      case browser.runtime.OnInstalledReason.BROWSER_UPDATE:
        // Force logout for users to not ask passphrase after a browser update which clear the session storage
        await OnExtensionInstalledController.onBrowserUpdate();
        break;
      default:
        console.debug(`The install reason ${details.reason} is not supported`);
        break;
    }
  }
  /**
   * On installed the extension, add first install in the url tab of setup or recover
   */
  static async onInstall() {
    // Apply on tabs that match the regex
    await browser.tabs.query({currentWindow: true}).then(updateTabMatchUrl).then(closeTabWebStore);
  }

  /**
   * On update the extension, for pagemod with refresh option and tabs that match the url refresh it
   */
  static async onUpdate() {
    // Apply on tabs that match the pagemod url regex with refresh option
    await browser.tabs.query({}).then(reloadTabsMatchPagemodUrl);
    await OnExtensionInstalledController.updateToolbarIcon();
  }

  /**
   * On update of the browser, logout the user. It helps mitigate issue where users update their browser, are still
   * signed-in but session memory used to store user passphrase or other information is flushed. These behavior
   * deteriorates the user experience, therefore it has been decided to sign the user out.
   */
  static async onBrowserUpdate() {
    const user = User.getInstance();
    // Check if user is valid
    if (!user.isValid()) {
      return;
    }
    let authStatus;
    try {
      const checkAuthStatusService = new CheckAuthStatusService();
      // use the cached data as the worker could wake up every 30 secondes.
      authStatus = await checkAuthStatusService.checkAuthStatus(false);
    } catch (error) {
      // Service is unavailable, do nothing...
      Log.write({level: 'debug', message: 'Could not check if the user is authenticated, the service is unavailable.'});
      return;
    }
    // Do nothing if user is not authenticated
    if (!authStatus.isAuthenticated) {
      return;
    }
    // Logout authenticated user to prevent to ask passphrase for SSO users
    const apiClientOptions = await user.getApiClientOptions();
    const authModel = new AuthModel(apiClientOptions);
    await authModel.logout();
    /*
     * Reload only tabs that match passbolt app url. Reload is necessary as the application loaded in the tab
     * could be unresponsive due to the forced triggered sign-out.
     * - When the tab is started the API didn't redirect the user as the user is still signed-in.
     * - This script sign-out the user
     * - The pagemod of the app starts and throw an error as the user has been signed-out
     */
    await browser.tabs.query({}).then(reloadTabsMatchPassboltAppUrl);
  }

  /**
   * Updates the Passbolt icon in the toolbar according to the sign-in status of the current user.
   * @returns {Promise<void>}
   */
  static async updateToolbarIcon() {
    const user = User.getInstance();
    // Check if user is valid
    if (!user.isValid()) {
      return;
    }

    let authStatus;
    try {
      const checkAuthStatusService = new CheckAuthStatusService();
      // use the cached data as the worker could wake up every 30 secondes.
      authStatus = await checkAuthStatusService.checkAuthStatus(false);
    } catch (error) {
      // Service is unavailable, do nothing...
      Log.write({level: 'debug', message: 'Could not check if the user is authenticated, the service is unavailable.'});
      return;
    }

    if (authStatus.isAuthenticated) {
      BrowserExtensionIconService.activate();
    } else {
      BrowserExtensionIconService.deactivate();
    }
  }
}

/**
 *  Find the tab setup or recover and update url
 * @param tabs
 * @returns {Promise<unknown[]>}
 */
const updateTabMatchUrl = tabs => Promise.all(tabs.map(tab => {
  if (tab && (ParseSetupUrlService.test(tab.url) || ParseRecoverUrlService.test(tab.url))) {
    const url = new URL(tab.url);
    url.searchParams.set('first-install', 1);
    return browser.tabs.update(tab.id, {
      url: url.href,
      active: true
    });
  }
  return tab;
}));


/**
 * Find the tab web store and close it
 * @private
 * @param tabs
 * @returns {Promise<unknown[]>}
 */
const closeTabWebStore = tabs => {
  const urlWebStoreRegex = `https:\/\/(chromewebstore.google.com|addons.mozilla.org)\/(.*)\/passbolt`;
  return Promise.all(tabs.map(tab => tab.url.match(urlWebStoreRegex) ? browser.tabs.remove(tab.id) : tab));
};


/**
 * Reload the tabs that match passsbolt app url
 * @param tabs
 */
const reloadTabsMatchPassboltAppUrl = async tabs => {
  for (const tab of tabs) {
    if (await AppBootstrapPagemod.assertUrlAttachConstraint(tab)) {
      browser.tabs.reload(tab.id);
    }
  }
};

/**
 * Reload the tabs that match pagemod url
 * @param tabs
 */
const reloadTabsMatchPagemodUrl = async tabs => {
  for (const tab of tabs) {
    if (await PagemodManager.hasPagemodMatchUrlToReload(tab.url)) {
      browser.tabs.reload(tab.id);
    } else {
      // For other tabs detect and inject the new content script
      const frameDetails = {
        frameId: 0,
        tabId: tab.id,
        url: tab.url
      };
      WebNavigationService.exec(frameDetails);
    }
  }
};

export default OnExtensionInstalledController;
