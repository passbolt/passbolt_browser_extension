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
import { BrowserExtensionIconService } from "../ui/browserExtensionIcon.service";
import BuildApiClientOptionsService from "../account/buildApiClientOptionsService";
import GetActiveAccountService from "../account/getActiveAccountService";
import GetOrFindResourcesService from "../resource/getOrFindResourcesService";
import User from "../../../../all/background_page/model/user";
import OpenWebsiteGettingStartedPageService from "../ui/openWebsiteGettingStartedPageService";
import OpenTrustedDomainTabService from "../ui/openTrustedDomainTabService";
import GetOrFindActiveSessionService from "../activeSession/getOrFindActiveSessionService";
import GetOrFindOfflineResourcesService from "../resource/getOrFindOfflineResourcesService";

export const QUICKACCESS_POPUP_URL = "webAccessibleResources/quickaccess.html?passbolt=quickaccess";

// picking the right API between browser.browserAction (MV2 only) and browser.action (MV3 only)
const browserAction = browser.browserAction ?? browser.action;

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
    this.handleIconToolbarClicked = this.handleIconToolbarClicked.bind(this);
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
  async handleShortcutPressed(command) {
    if (command !== "passbolt-open") {
      return;
    }

    const user = User.getInstance();
    if (!user.isValid()) {
      // if the user is not set, a tab on passbolt start page is opened
      await this.openGettingStartedPage();
      return;
    }

    await this.openTrustedDomainPage();
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
   * Handles click on the icon in the toolbar.
   * The event is called by the browser only if no quickaccess popup URL is set (neither from the manifest nor in script).
   */
  async handleIconToolbarClicked() {
    const user = User.getInstance();
    if (!user.isValid()) {
      // if the user is not set, a tab on passbolt start page is opened
      await this.openGettingStartedPage();
      return;
    }

    // if the user account is set, sets the QA popup to the expected URL and open it.
    this.setQuickaccessPopup();
    browserAction?.openPopup(); // 'openPopup' is not available in Edge
  }

  /**
   * Sets the Quickaccess popup with the default popup URL to open to.
   */
  setQuickaccessPopup() {
    browserAction.setPopup({ popup: QUICKACCESS_POPUP_URL });
  }

  /**
   * Opens the https://www.passbolt.com/start page in a new tab.
   */
  async openGettingStartedPage() {
    const service = new OpenWebsiteGettingStartedPageService();
    await service.openTab();
  }

  /**
   * Opens the user's current instance domain URL in a new tab.
   */
  async openTrustedDomainPage() {
    const service = new OpenTrustedDomainTabService();
    await service.openTab();
  }

  /**
   * Reset the suggested resources badge
   * @private
   */
  async resetSuggestedResourcesBadge() {
    this.tabUrl = null;
    // Should do nothing if the user is not authenticated
    const account = await GetActiveAccountService.get();

    const apiClientOptions = BuildApiClientOptionsService.buildFromAccount(account);
    const userActiveSessionEntity = await this.getUserActiveSession(account, apiClientOptions);
    if (!userActiveSessionEntity.isAuthenticated) {
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
      const userActiveSessionEntity = await this.getUserActiveSession(account, apiClientOptions);
      // Should do nothing if the user is not authenticated
      if (!userActiveSessionEntity.isAuthenticated) {
        return;
      }
      // Instantiate the service accordingly to the type of session (online or offline)
      this.getOrFindResourcesService = userActiveSessionEntity.isSessionOnline
        ? new GetOrFindResourcesService(account, apiClientOptions)
        : new GetOrFindOfflineResourcesService(account, apiClientOptions);

      const tabs = await browser.tabs.query({ active: true, lastFocusedWindow: true });
      const currentTab = tabs?.[0];

      const tabUrl = currentTab?.url;
      let suggestedResourcesCount = 0;

      // The toolbar is already displaying the count of suggested resources for the current url.
      if (this.tabUrl === tabUrl) {
        return;
      }

      this.tabUrl = tabUrl;

      if (!this.isUrlPassboltDomain(this.tabUrl, account) && !this.isUrlPassboltExtension(this.tabUrl)) {
        // Get the suggested resources for the current tab
        // As we don't know if the page is using OTP or password, we need to check both
        const resourcesCollection = await this.getOrFindResourcesService.getOrFindSuggested(this.tabUrl);
        suggestedResourcesCount = resourcesCollection.length;
      }

      BrowserExtensionIconService.setSuggestedResourcesCount(suggestedResourcesCount);
    } catch (error) {
      // Error happens only if no account is associate
      console.error(error);
    }
  }

  /**
   * Is the user authenticated
   * @param {AccountEntity} account
   * @param {ApiClientOptions} apiClientOptions
   * @returns {Promise<UserActiveSessionEntity>}
   */
  async getUserActiveSession(account, apiClientOptions) {
    const getOrFindActiveSessionService = new GetOrFindActiveSessionService(account, apiClientOptions);
    // use the cached data as the worker could wake up every 30 secondes.
    return await getOrFindActiveSessionService.getOrFind();
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
