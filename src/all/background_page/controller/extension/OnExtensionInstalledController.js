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
class OnExtensionInstalledController {
  /**
   * On installed the extension, add first install in the url tab of setup or recover
   */
  static onInstall(details) {
    const isExtensionReasonInstall = details.reason === browser.runtime.OnInstalledReason.INSTALL;
    if (isExtensionReasonInstall) {
      // Apply on tabs that match the regex
      browser.tabs.query({currentWindow: true}).then(updateTabMatchUrl).then(closeTabWebStore);
    }
  }
}

/**
 *  Find the tab setup or recover and update url
 * @param tabs
 * @returns {Promise<unknown[]>}
 */
const updateTabMatchUrl = tabs => {
  const uuidRegex = "[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[0-5][a-fA-F0-9]{3}-[089aAbB][a-fA-F0-9]{3}-[a-fA-F0-9]{12}";
  const urlExtensionRegex = `(.*)\/setup\/(install|recover)\/(${uuidRegex})\/(${uuidRegex})`;
  return Promise.all(tabs.map(tab => {
    if (tab && tab.url.match(urlExtensionRegex)) {
      const url = new URL(tab.url);
      url.searchParams.set('first-install', 1);
      return browser.tabs.update(tab.id, {
        url: url.href,
        active: true
      });
    }
    return tab;
  }));
};

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

exports.OnExtensionInstalledController = OnExtensionInstalledController;