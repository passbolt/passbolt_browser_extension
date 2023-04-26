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

import {v4 as uuidv4} from 'uuid';
import ScriptExecution from "../sdk/scriptExecution";
import WorkersSessionStorage from "../service/sessionStorage/workersSessionStorage";
import WorkerEntity from "../model/entity/worker/workerEntity";

/**
 * Top browser frame id
 * @type {number}
 */
const TOP_FRAME_ID = 0;

/**
 * Abstract class Pagemod
 */
class Pagemod {
  /**
   * Get browser top frame id.
   * @returns {number}
   */
  static get TOP_FRAME_ID() {
    return TOP_FRAME_ID;
  }

  /**
   * get the content style file
   * @returns {string[]}
   */
  get contentStyleFiles() {
    return [];
  }

  /**
   * get the content script file
   * @returns {string[]}
   */
  get contentScriptFiles() {
    return [];
  }

  /**
   * Get the app name
   * @returns {string}
   */
  get appName() {
    return "";
  }

  /**
   * Get events
   * @returns {array}
   */
  get events() {
    return [];
  }

  /**
   * Must reload on extension update
   * @return {boolean}
   */
  get mustReloadOnExtensionUpdate() {
    return false;
  }

  /**
   * Check a pagemod can be attached to a browser frame.
   * @param {object} frameDetails The browser frame details.
   * @returns {Promise<boolean>}
   */
  /* eslint-disable no-unused-vars */
  async canBeAttachedTo(frameDetails) {
    console.debug(`The pagemod "${this.appName}" should implement canBeAttachedTo. Default false.`);
    return false;
  }

  /**
   * Inject files into the tab id and frame id
   * @param tabId
   * @param frameId
   * @returns {Promise<void>}
   */
  async injectFiles(tabId, frameId) {
    const worker = {
      id: uuidv4(),
      name: this.appName,
      tabId: tabId,
      frameId: frameId
    };
    await WorkersSessionStorage.addWorker(new WorkerEntity(worker));
    // a helper to handle insertion of scripts, variables and css in target page
    const scriptExecution = new ScriptExecution(tabId, frameId);
    // Inject port name
    scriptExecution.injectPortname(worker.id);
    // Insert Css files
    scriptExecution.injectCss(this.contentStyleFiles);
    // Insert script files
    scriptExecution.injectJs(this.contentScriptFiles);
  }

  /**
   * Attach events
   * @param port the port
   * @return {Promise<void>}
   */
  async attachEvents(port) {
    const tab = port._port.sender.tab;
    for (const event of this.events) {
      await event.listen({port: port, tab: tab, name: this.appName});
    }
  }
}

export default Pagemod;
