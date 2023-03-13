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
import RecoverBootstrapPagemod from "./recoverBootstrapPagemod";
import RecoverPagemod from "./recoverPagemod";
import SetupBootstrapPagemod from "./setupBootstrapPagemod";
import SetupPagemod from "./setupPagemod";
import AuthBootstrapPagemod from "./authBootstrapPagemod";
import AuthPagemod from "./authPagemod";
import AppBootstrapPagemod from "./appBootstrapPagemod";
import AppPagemod from "./appPagemod";
import WebIntegrationPagemod from "./webIntegrationPagemod";
import PublicWebsiteSignInPagemod from "./publicWebsiteSignInPagemod";
import QuickAccessPagemod from "./quickAccessPagemod";
import InFormCallToActionPagemod from "./informCallToActionPagemod";
import InFormMenuPagemod from "./informMenuPagemod";
import AccountRecoveryBootstrapPagemod from "./accountRecoveryBootstrapPagemod";
import AccountRecoveryPagemod from "./accountRecoveryPagemod";

/**
 * The pagemod manager have the role of dispatching the process to the correct pagemod
 */
class PagemodManager {
  constructor() {
    // The order is very important keep the bootstrap application first follow by the webIntegration
    this.pagemods = [
      RecoverBootstrapPagemod,
      SetupBootstrapPagemod,
      AuthBootstrapPagemod,
      AppBootstrapPagemod,
      AccountRecoveryBootstrapPagemod,
      PublicWebsiteSignInPagemod,
      // WebIntegration should always be under all bootstrap application
      WebIntegrationPagemod,
      RecoverPagemod,
      SetupPagemod,
      AuthPagemod,
      AppPagemod,
      QuickAccessPagemod,
      InFormCallToActionPagemod,
      InFormMenuPagemod,
      AccountRecoveryPagemod,
    ];
    this.exec = this.exec.bind(this);
  }

  /**
   * Execute the pagemod process
   * Find the pagemod form the details and inject the css and content script
   * @param frameDetails The browser frame details
   * @returns {Promise<void>}
   */
  async exec(frameDetails) {
    const pagemod = await this.getPagemodThatCanBeAttachedTo(frameDetails);
    await pagemod?.injectFiles(frameDetails.tabId, frameDetails.frameId);
  }

  /**
   * Get the first pagemod that can be attached to a frame
   * @param {object} frameDetails The browser frame details
   * @returns {Promise<Pagemod>}
   */
  async getPagemodThatCanBeAttachedTo(frameDetails) {
    const canAttachPagemod = pagemod => pagemod.canBeAttachedTo(frameDetails);
    const findPagemodThatCanBeAttachedTo = canAttachPagemodsResults => this.pagemods.find((pagemod, index) => canAttachPagemodsResults[index]);
    // Keep only one pagemod that can be attached.
    return Promise.all(this.pagemods.map(canAttachPagemod)).then(findPagemodThatCanBeAttachedTo);
  }

  /**
   * Attach the port to the pagemod
   * @param port the port
   * @param appName the application name
   * @returns <void>
   */
  async attachEventToPort(port, appName) {
    const pagemod = this.findPagemodByAppName(appName);
    await pagemod?.attachEvents(port);
  }

  /**
   * Find pagemod by app name
   * @param {string} appName the application name
   * @returns {*}
   */
  findPagemodByAppName(appName) {
    return this.pagemods.find(pagemod => pagemod.appName === appName);
  }

  /**
   * Has pagemod that match tab url to reload
   * @param url The url
   * @return {boolean}
   */
  hasPagemodMatchUrlToReload(url) {
    return this.pagemods.some(pagemod => pagemod.mustReloadOnExtensionUpdate && pagemod.assertUrlAttachConstraint({url}));
  }
}

export default new PagemodManager();
