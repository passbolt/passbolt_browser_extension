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
 * @since         2.0.0
 */
import {BrowserExtensionIconService} from "../ui/browserExtensionIcon.service";
import ResourceModel from "../../model/resource/resourceModel";
import Toolbar from "../../model/toolbar";
import {TabController as tabsController} from "../../controller/tabsController";
import BuildApiClientOptionsService from "../account/buildApiClientOptionsService";
import GetActiveAccountService from "../account/getActiveAccountService";
import CheckAuthStatusService from "../auth/checkAuthStatusService";
import Log from "../../model/log";

class ToolbarService {
  constructor() {
    this.bindCallbacks();
    this.addEventListeners();
    this.tabUrl = null; // The tab url the toolbar is displaying the count of suggested resources for.
  }

  /**
   * Bind callbacks
   */
  bindCallbacks() {
    this.handleShortcutPressed = this.handleShortcutPressed.bind(this);
    this.handleUserLoggedOut = this.handleUserLoggedOut.bind(this);
    this.handleUserLoggedIn = this.handleUserLoggedIn.bind(this);
    this.handleSuggestedResourcesOnUpdatedTab = this.handleSuggestedResourcesOnUpdatedTab.bind(this);
    this.handleSuggestedResourcesOnActivatedTab = this.handleSuggestedResourcesOnActivatedTab.bind(this);
    this.handleSuggestedResourcesOnFocusedWindow = this.handleSuggestedResourcesOnFocusedWindow.bind(this);
  }

  /**
   * Add event listeners.
   */
  addEventListeners() {
    browser.commands.onCommand.addListener(this.handleShortcutPressed);
  }

  /**
   * Handle the shortcut pressed event.
   * @private
   */
  handleShortcutPressed(command) {
    if (command === "passbolt-open") {
      this.openPassboltTab();
    }
  }

  /**
   * Handle when the user is logged in.
   * @returns {Promise<void>}
   */
  async handleUserLoggedIn() {
    BrowserExtensionIconService.activate();
    await this.updateSuggestedResourcesBadge();
  }

  /**
   * Handle when the user is logged out.
   * @private
   */
  handleUserLoggedOut() {
    this.tabUrl = null;
    BrowserExtensionIconService.deactivate();
  }

  /**
   * Handle the change of the count of suggested resources when the tab url is updated
   * @param tabId The tab identifier
   * @param changeInfo The change info
   * @return {Promise<void>}
   */
  async handleSuggestedResourcesOnUpdatedTab(tabId, changeInfo) {
    if (changeInfo.url) {
      await this.updateSuggestedResourcesBadge();
    }
  }

  /**
   * Handle the change of the count of suggested resources when the tab active changed
   * @return {Promise<void>}
   */
  async handleSuggestedResourcesOnActivatedTab() {
    await this.updateSuggestedResourcesBadge();
  }

  /**
   * Handle the change of the count of suggested resources when the window focused changed.
   * @param {integer} windowId ID of the newly focused window.
   * @return {Promise<void>}
   */
  async handleSuggestedResourcesOnFocusedWindow(windowId) {
    if (windowId === browser.windows.WINDOW_ID_NONE) {
      // If no window selected, reset the suggested resources badge.
      await this.resetSuggestedResourcesBadge();
    } else {
      await this.updateSuggestedResourcesBadge();
    }
  }

  /**
   * Open a new tab and go to passbolt.
   */
  openPassboltTab() {
    const url = Toolbar.getToolbarUrl();
    tabsController.open(url);
  }

  /**
   * Reset the suggested resources badge
   * @private
   */
  async resetSuggestedResourcesBadge() {
    this.tabUrl = null;
    // Should do nothing if the user is not authenticated
    if (!await this.isUserAuthenticated()) {
      return;
    }
    BrowserExtensionIconService.setSuggestedResourcesCount(0);
  }

  /**
   * Update the suggested resources badge given the current tab
   * @private
   */
  async updateSuggestedResourcesBadge() {
    try {
      const account = await GetActiveAccountService.get();
      const apiClientOptions = BuildApiClientOptionsService.buildFromAccount(account);
      // Should do nothing if the user is not authenticated
      if (!await this.isUserAuthenticated()) {
        return;
      }

      this.resourceModel = new ResourceModel(apiClientOptions, account);

      const tabs = await browser.tabs.query({'active': true, 'lastFocusedWindow': true});
      const currentTab = tabs?.[0];

      const tabUrl = currentTab?.url;
      let suggestedResourcesCount = 0;

      // The toolbar is already displaying the count of suggested resources for the current url.
      if (this.tabUrl === tabUrl) {
        return;
      }

      this.tabUrl = tabUrl;
      if (!this.isUrlPassboltDomain(this.tabUrl, account) && !this.isUrlPassboltExtension(this.tabUrl)) {
        suggestedResourcesCount = await this.resourceModel.countSuggestedResources(this.tabUrl);
      }

      BrowserExtensionIconService.setSuggestedResourcesCount(suggestedResourcesCount);
    } catch (error) {
      // Error happens only if no account is associate
      console.error(error);
    }
  }

  /**
   * Is the user authenticated
   * @returns {Promise<{boolean}|boolean>}
   */
  async isUserAuthenticated() {
    try {
      const checkAuthStatusService = new CheckAuthStatusService();
      // use the cached data as the worker could wake up every 30 secondes.
      const authStatus = await checkAuthStatusService.checkAuthStatus(false);
      return authStatus.isAuthenticated;
    } catch (error) {
      // Service is unavailable, do nothing...
      Log.write({level: 'debug', message: 'Could not check if the user is authenticated, the service is unavailable.'});
      // The user is not authenticated
      return false;
    }
  }

  /**
   * Check if the url has the user account trusted domain.
   * @param {string} tabUrl The url to check.
   * @param {AccountEntity} account The account
   * @returns {boolean}
   */
  isUrlPassboltDomain(tabUrl, account) {
    const passboltDomain = new URL(account.domain);
    const url = tabUrl && new URL(tabUrl);
    return passboltDomain.hostname === url?.hostname;
  }

  /**
   * Check if the url is a passbolt extension url.
   * @param {string} tabUrl The url to check.
   * @returns {boolean}
   */
  isUrlPassboltExtension(tabUrl) {
    return Boolean(tabUrl?.startsWith(browser.runtime.getURL("/")));
  }
}

const toolbarService = new ToolbarService();

// Exports the Toolbar service object.
export default toolbarService;
