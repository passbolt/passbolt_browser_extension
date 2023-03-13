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
import browser from '../../sdk/polyfill/browserPolyfill';
import PagemodManager from "../../pagemod/pagemodManager";
import WebNavigationService from "../../service/webNavigation/webNavigationService";
import ParseSetupUrlService from "../../service/setup/parseSetupUrlService";
import ParseRecoverUrlService from "../../service/recover/parseRecoverUrlService";

class OnExtensionInstalledController {
  /**
   * Execute the OnExtensionInstalledController process
   * @param details
   * @returns {Promise<void>}
   */
  static async exec(details) {
    switch (details.reason) {
      case browser.runtime.OnInstalledReason.INSTALL:
        await OnExtensionInstalledController.onInstall();
        break;
      case browser.runtime.OnInstalledReason.UPDATE:
        await OnExtensionInstalledController.onUpdate();
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
  const urlWebStoreRegex = `https:\/\/(chrome.google.com\/webstore|addons.mozilla.org)\/(.*)\/passbolt`;
  return Promise.all(tabs.map(tab => tab.url.match(urlWebStoreRegex) ? browser.tabs.remove(tab.id) : tab));
};


/**
 * Reload the tabs that match pagemod url
 * @param tabs
 */
const reloadTabsMatchPagemodUrl = tabs => {
  tabs.map(tab => {
    if (PagemodManager.hasPagemodMatchUrlToReload(tab.url)) {
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
  });
};

export default OnExtensionInstalledController;
