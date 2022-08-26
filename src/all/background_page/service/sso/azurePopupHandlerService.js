/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.7.3
 */
import browser from "webextension-polyfill";
import SsoConfigurationEntity from "../../model/entity/sso/ssoConfigurationEntity";
import SsoConfigurationModel from "../../model/sso/ssoConfigurationModel";

const AZURE_POPUP_WINDOW_HEIGHT = 600;
const AZURE_POPUP_WINDOW_WIDTH = 380;

class AzurePopupHandlerService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    this.ssoConfigurationModel = new SsoConfigurationModel(apiClientOptions);
    this.popup = null;
    this.popupTabId = null;
    this.verifyCodeInTab = this.verifyCodeInTab.bind(this);
    this.verifyPopupClosed = this.verifyPopupClosed.bind(this);
  }

  /**
   * Get the SSO configuration from the server
   * @returns {Promise<void>}
   * @public
   */
  async getCodeFromThirdParty() {
    const ssoConfiguration = await this.ssoConfigurationModel.findSsoConfiguration();
    if (ssoConfiguration.provider !== SsoConfigurationEntity.AZURE) {
      throw new Error("Unsupported SSO provider");
    }

    const popUrl = ssoConfiguration.data.url;
    this.popup = await this.openPopup(popUrl);
    this.popupTabId = this.popup.tabs[0].id;

    return new Promise((resolve, reject) => {
      this.resolvePromise = resolve;
      this.rejectPromise = reject;
      browser.tabs.onUpdated.addListener(this.verifyCodeInTab);
      browser.tabs.onRemoved.addListener(this.verifyPopupClosed);
    });
  }

  /**
   * Popup's tab URL change handler to verify we obtained the third party code.
   * @returns {void}
   * @private
   */
  verifyCodeInTab(tabId, changeInfo, tab) {
    if (tabId !== this.popupTabId) {
      return;
    }

    if (tab.status !== "complete") {
      return;
    }

    const code = this.grabCodeFromHash(tab.url);
    if (code !== null) {
      this.resolvePromise(code);
    }
  }

  /**
   * Popup close handler.
   * @returns {void}
   * @private
   */
  verifyPopupClosed(tabId, removeInfo) {
    if (tabId !== this.popupTabId) {
      return; //It's not our tab
    }

    if (removeInfo.isWindowClosing) {
      this.rejectPromise("The user closed the popup");
      return;
    }

    this.rejectPromise("The popup closed unexpectedly");
  }

  /**
   * Closes the current popup opened by the handler if any.
   * @returns {Promise<void>}
   * @public
   */
  async closeHandler() {
    console.log("Closing handler");
    browser.tabs.onUpdated.removeListener(this.verifyCodeInTab);
    browser.tabs.onRemoved.removeListener(this.verifyPopupClosed);
    this.rejectPromise = null;
    this.resolvePromise = null;
    this.codeFound = null;

    if (this.popup && !this.popup.closed) {
      browser.tabs.remove(this.popupTabId);
    }
    this.popup = null;
  }

  /**
   * Open the third party SSO authentication popup
   * @param {string} url the url for the popup to point at
   * @return {Promise<windows.Window>}
   * @private
   */
  async openPopup(url) {
    const type = "popup";
    const width = AZURE_POPUP_WINDOW_WIDTH;
    const height = AZURE_POPUP_WINDOW_HEIGHT;
    const windowCreateData = {url, type, width, height};
    return await browser.windows.create(windowCreateData);
  }

  /**
   * Tries to extract a well-formatted third party code from a URL's hash.
   * @param {string} url the url from which to extract the code
   * @return {string|null}
   * @private
   */
  grabCodeFromHash(url) {
    //@todo @mock use a real mmiplementation it's unknown at this stage
    try {
      const parsedUrl = new URL(url);
      const code = parsedUrl.searchParams.get('login_hint') || null;
      if (code) {
        console.log("Code found:", code);
      }
      return code;
    } catch (e) {
      return null;
    }
  }
}

export default AzurePopupHandlerService;
