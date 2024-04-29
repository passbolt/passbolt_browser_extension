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
import BrowserTabService from "../ui/browserTab.service";

class TabService {
  /**
   * Handle tabs onUpdated events.
   * @see /doc/worker-port-lifecycle.md to know more about worker and content script applications port lifecycle.
   *
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

    console.debug(`TabService::exec(id: ${tabId}, url: ${tab.url}): Navigation detected.`);

    // Get the worker on the main frame
    const worker = await WorkersSessionStorage.getWorkerOnMainFrame(tabId);

    /*
     * If there is still a worker in memory relative to the tab top frame. It means that the tab was previously
     * identified by a pagemod and a worker attached to it.
     *
     * If an application remains active on the tab, abort the pagemods identification process, otherwise start
     * the process and flush the previous worker attached to this tab.
     */
    if (worker) {
      const workerEntity = new WorkerEntity(worker);
      /*
       * A pagemod might already trying to attach a worker to the tab and is awaiting the content script to open or
       * reopen the port and connect to it. It can happen when the tabs onUpdated event send too many events with the
       * complete status, especially happening when a user reloads the tab multiple times very fast.
       *
       * To avoid this scenario, ensure that the worker attachment process triggered by the first tabs onUpdated
       * event had time to complete its treatment. The attachment will be completed when the content script inserted
       * in the tab successfully opened the port and connect to the background script.
       *
       * To avoid any deadlock on the tab, if the content script was not able to connect to the background page within
       * 300ms, treat the last tabs onUpdated event and trigger a pagemod identification process on it.
       */
      if (workerEntity.isWaitingConnection || workerEntity.isReconnecting) {
        console.debug(`TabService::exec(id: ${tabId}): Waiting content script port initial connection or reconnection.`);
        await WorkerService.checkAndExecNavigationForWorkerWaitingConnection(workerEntity);
        return;
      }

      /*
       * If a port associated to this worker still exists in memory, try to connect to the content script application
       * that opened it.
       */
      if (PortManager.isPortExist(worker.id)) { // Port exists in runtime memory.
        const port = PortManager.getPortById(workerEntity.id);
        /*
         * Only try to connect with the content script application if the origin of the tab url is similar to the
         * origin of the application url referenced by the associated port. If the origin change, the tab DOM has
         * been flushed and within any application on it.
         */
        if (hasUrlSameOrigin(port._port.sender.url, tab.url)) {
          try {
            await PromiseTimeoutService.exec(port.request('passbolt.port.check'));
            console.debug(`TabService::exec(id: ${tabId}):  Content script application acknowledged presence on worker runtime memory port.`);
            return;
          } catch (error) {
            console.debug(`TabService::exec(id: ${tabId}): No content script application acknowledged presence on worker runtime memory port.`, error);
          }
        }
      } else {
        /*
         * If the worker port cannot be found in runtime memory, it could be due to the browser stopping the service
         * worker (MV3) and with it disconnecting all the ports. If any application remains on the tab message it and
         * request it to reconnect its port.
         */
        try {
          workerEntity.status = WorkerEntity.STATUS_RECONNECTING;
          await WorkersSessionStorage.updateWorker(workerEntity);
          await BrowserTabService.sendMessage(workerEntity, "passbolt.port.connect", workerEntity.id);
          console.debug(`TabService::exec(id: ${tabId}): A content script application reconnected its port.`);
          return;
        } catch (error) {
          console.debug(`TabService::exec(id: ${tabId}): No content script application was able to reconnect its port.`, error);
        }
      }
    }

    // Execute the process of a web navigation to detect pagemod and script to insert
    const frameDetails = mappingFrameDetailsFromTab(tab);
    await WebNavigationService.exec(frameDetails);
    console.debug(`TabService::exec(id: ${tabId}): Trigger pagemods identification process.`);
  }
}

/**
 * Mapping tab as a frame details to be compliant with webNavigation API
 * @param tab
 * @return {{tabId, frameId: number, url}}
 */
function mappingFrameDetailsFromTab(tab) {
  return {
    // Mapping the tab info as a frame details to be compliant with webNavigation API
    frameId: 0,
    tabId: tab.id,
    url: tab.url
  };
}

export default TabService;
