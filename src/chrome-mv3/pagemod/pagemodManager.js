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
import storage from "../../all/background_page/sdk/storage";
import {Config} from "../../all/background_page/model/config";
import RecoverBootstrapPagemod from "./recoverBootstrapPagemod";
import RecoverPagemod from "./recoverPagemod";
import SetupBootstrapPagemod from "./setupBootstrapPagemod";
import SetupPagemod from "./setupPagemod";
import AuthBootstrapPagemod from "./authBootstrapPagemod";
import AuthPagemod from "./authPagemod";
import AppBootstrapPagemod from "./appBootstrapPagemod";
import AppPagemod from "./appPagemod";
import WebIntegrationPagemod from "./webIntegrationPagemod";

/**
 * The pagemod manager have the role of dispatching the process to the correct pagemod
 */
class PagemodManager {
  constructor() {
    // TODO find a way to init the storage one time
    storage.init().then(Config.init);
    this.pagemods = [
      RecoverBootstrapPagemod,
      RecoverPagemod,
      SetupBootstrapPagemod,
      SetupPagemod,
      AuthBootstrapPagemod,
      AuthPagemod,
      AppBootstrapPagemod,
      AppPagemod,
      WebIntegrationPagemod
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
    const pagemods = await this.getPagemodsThatCanBeAttachedTo(frameDetails);
    await pagemods.forEach(pagemod => pagemod?.injectFiles(frameDetails.tabId, frameDetails.frameId));
  }

  /**
   * Get the pagemods that can be attached to a frame
   * @param {object} frameDetails The browser frame details
   * @returns {Promise<Pagemod>}
   */
  async getPagemodsThatCanBeAttachedTo(frameDetails) {
    const canAttachPagemod = pagemod => pagemod.canBeAttachedTo(frameDetails);
    const filterPagemodsThatCanBeAttachedTo = canAttachPagemodsResults => this.pagemods.filter((pagemod, index) => canAttachPagemodsResults[index]);
    // Keep only the pagemods that can be attached.
    return Promise.all(this.pagemods.map(canAttachPagemod)).then(filterPagemodsThatCanBeAttachedTo);
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
}

export default new PagemodManager();
