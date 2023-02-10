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
import browser from "../sdk/polyfill/browserPolyfill";
import User from "../model/user";
import {BrowserExtensionIconService} from "../service/ui/browserExtensionIcon.service";
import ResourceModel from "../model/resource/resourceModel";
import Toolbar from "../model/toolbar";
import {TabController as tabsController} from "./tabsController";

const UPDATE_SUGGESTED_RESOURCE_BADGE_FLUSH_ALARM = "UpdateSuggestedResourceBadgeCacheFlush";

class ToolbarController {
  constructor() {
    // Initially, set the browser extension icon as inactive
    BrowserExtensionIconService.deactivate();
    this.bindCallbacks();
    this.addEventListeners();
  }

  /**
   * Bind callbacks
   */
  bindCallbacks() {
    this.handleButtonClick = this.handleButtonClick.bind(this);
    this.handleShortcutPressed = this.handleShortcutPressed.bind(this);
    this.handleUserLoggedOut = this.handleUserLoggedOut.bind(this);
    this.handleUserLoggedIn = this.handleUserLoggedIn.bind(this);
    this.handleSuggestedResourcesOnUpdatedTabBound = this.handleSuggestedResourcesOnUpdatedTab.bind(this);
    this.handleSuggestedResourcesOnActivatedTabBound = this.handleSuggestedResourcesOnActivatedTab.bind(this);
    this.handleSuggestedResourcesOnFocusedWindowBound = this.handleSuggestedResourcesOnFocusedWindow.bind(this);
    this.handleFlushEvent = this.handleFlushEvent.bind(this);
  }

  /**
   * Add event listeners.
   */
  addEventListeners() {
    browser.action.onClicked.addListener(this.handleButtonClick);
    browser.commands.onCommand.addListener(this.handleShortcutPressed);
    self.addEventListener("passbolt.auth.after-logout", this.handleUserLoggedOut);
    self.addEventListener("passbolt.auth.after-login", this.handleUserLoggedIn);
  }

  /**
   * Handle the click on the passbolt toolbar icon.
   * @private
   */
  handleButtonClick() {
    this.openPassboltTab();
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
   * @private
   */
  async handleUserLoggedIn() {
    const user = User.getInstance();
    const apiClientOptions = await user.getApiClientOptions();
    this.resourceModel = new ResourceModel(apiClientOptions);

    BrowserExtensionIconService.activate();
    this.updateSuggestedResourcesBadge();

    browser.tabs.onUpdated.addListener(this.handleSuggestedResourcesOnUpdatedTabBound);
    browser.tabs.onActivated.addListener(this.handleSuggestedResourcesOnActivatedTabBound);
    browser.windows.onFocusChanged.addListener(this.handleSuggestedResourcesOnFocusedWindowBound);
  }

  /**
   * Handle when the user is logged out.
   * @private
   */
  handleUserLoggedOut() {
    BrowserExtensionIconService.deactivate();
    browser.tabs.onUpdated.removeListener(this.handleSuggestedResourcesOnUpdatedTabBound);
    browser.tabs.onActivated.removeListener(this.handleSuggestedResourcesOnActivatedTabBound);
    browser.windows.onFocusChanged.removeListener(this.handleSuggestedResourcesOnFocusedWindowBound);
  }

  /**
   * Handle the change of the count of suggested resources when the tab url is updated
   * @param tabId The tab identifier
   * @param changeInfo The change info
   * @private
   */
  async handleSuggestedResourcesOnUpdatedTab(tabId, changeInfo) {
    if (changeInfo.url) {
      this.updateSuggestedResourcesBadge();
    }
  }

  /**
   * Handle the change of the count of suggested resources when the tab active changed
   * @private
   */
  handleSuggestedResourcesOnActivatedTab() {
    this.updateSuggestedResourcesBadge();
  }

  /**
   * Handle the change of the count of suggested resources when the window focused changed.
   * @param {integer} windowId ID of the newly focused window.
   * @private
   */
  handleSuggestedResourcesOnFocusedWindow(windowId) {
    if (windowId === browser.windows.WINDOW_ID_NONE) {
      // If no window selected, reset the suggested resources badge.
      BrowserExtensionIconService.setSuggestedResourcesCount(0);
    } else {
      this.updateSuggestedResourcesBadge();
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
   * Update the suggested resources badge given the current tab
   * @private
   */
  async updateSuggestedResourcesBadge() {
    let currentTab;

    try {
      this.clearAlarm();
      const tabs = await browser.tabs.query({'active': true, 'lastFocusedWindow': true});
      currentTab = tabs[0];
    } catch (error) {
      /*
       * With chrome (seen from 91), retrieving the current tab can generate error (Tab is busy).
       * Loop until there is no error.
       */
      if (browser.runtime.lastError) {
        this.createAlarm();
        return;
      }
      throw error;
    }

    if (currentTab) {
      const count = await this.resourceModel.countSuggestedResources(currentTab.url);
      BrowserExtensionIconService.setSuggestedResourcesCount(count);
    }
  }

  /**
   * Create alarm to flush the resource
   * @param timeoutInMs
   * @private
   */
  createAlarm() {
    // Create an alarm to restart the update suggested resource badge
    browser.alarms.create(UPDATE_SUGGESTED_RESOURCE_BADGE_FLUSH_ALARM, {
      when: Date.now() + 50
    });
    browser.alarms.onAlarm.addListener(this.handleFlushEvent);
  }

  /**
   * Clear the alarm and listener configured for flushing the resource if any.
   * @private
   */
  clearAlarm() {
    browser.alarms.onAlarm.removeListener(this.handleFlushEvent);
    browser.alarms.clear(UPDATE_SUGGESTED_RESOURCE_BADGE_FLUSH_ALARM);
  }

  /**
   * Flush the current stored resource when the ResourceInProgressCacheFlush alarm triggers.
   * @param {Alarm} alarm
   * @private
   */
  handleFlushEvent(alarm) {
    if (alarm.name === UPDATE_SUGGESTED_RESOURCE_BADGE_FLUSH_ALARM) {
      this.updateSuggestedResourcesBadge();
    }
  }
}

// Exports the Toolbar controller object.
export default ToolbarController;
