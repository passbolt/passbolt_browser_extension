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
import WorkersSessionStorage from "../sessionStorage/workersSessionStorage";
import hasUrlSameOrigin from "../../utils/url/hasSameOriginUrl";
import PortManager from "../../sdk/port/portManager";
import WebNavigationService from "../webNavigation/webNavigationService";
import PromiseTimeoutService from "../../utils/promise/promiseTimeoutService";
import WorkerEntity from "../../model/entity/worker/workerEntity";
import WorkerService from "../worker/workerService";

class TabService {
  /**
   * Execute the navigation service process
   * @param {number} tabId The tab id
   * @param {object} changeInfo The change info of the tab
   * @param {object} tab The tab
   * @returns {Promise<void>}
   */
  static async exec(tabId, changeInfo, tab) {
    // ignore loading requests
    if (changeInfo.status !== 'complete') {
      return;
    }

    // ignore about:blank urls they can not be interacted with anyway
    if (tab.url === 'about:blank') {
      return;
    }
    /*
     * We can't insert scripts if the url is not https or http
     * as this is not allowed, instead we insert the scripts manually in the background page if needed
     */
    if (!(tab?.url?.startsWith('http://') || tab?.url?.startsWith('https://'))) {
      return;
    }


    // Get the worker on the main frame
    const worker = await WorkersSessionStorage.getWorkerOnMainFrame(tabId);
    // If there is already a worker on the main frame
    if (worker) {
      const workerEntity = new WorkerEntity(worker);
      // If the worker status is still waiting and urls are the same
      if (workerEntity.isWaitingConnection) {
        /*
         * The tabs onUpdated event can send too many events and to avoid multiple content script inserted an alarm will check after 300ms if the worker is still loading
         * Especially when a user reload the page multiple times very fast the content script is not on the page and can block the worker waiting a port connection
         * So, in this case an alarm is created and if the worker is still loading the navigation process is done manually.
         * Also, in case of there is redirection the process wait the last update and trigger the alarm with the last tab url change
         */
        await WorkerService.checkAndExecNavigationForWorkerWaitingConnection(workerEntity);
        return;
      } else if (workerEntity.isConnected) {
        // Get the port associate to a bootstrap application
        const port = PortManager.getPortById(workerEntity.id);
        // Check if the url has the same origin
        if (hasUrlSameOrigin(port._port.sender.url, tab.url)) {
          try {
            // Check if port is connected
            await PromiseTimeoutService.exec(port.request('passbolt.port.check'));
            return;
          } catch (error) {
            console.debug('The port is not connected, navigation detected');
          }
        }
      }
    }
    // Execute the process of a web navigation to detect pagemod and script to insert
    const frameDetails = mappingFrameDetailsFromTab(tab);
    await WebNavigationService.exec(frameDetails);
  }
}

/**
 * Mapping tab as a frame details to be compliant with webNavigation API
 * @param tab
 * @return {{tabId, frameId: number, url}}
 */
function mappingFrameDetailsFromTab(tab) {
  return  {
    // Mapping the tab info as a frame details to be compliant with webNavigation API
    frameId: 0,
    tabId: tab.id,
    url: tab.url
  };
}

export default TabService;
