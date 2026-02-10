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
   * Used by Chrome and Firefox entry points.
   * @see /doc/worker-port-lifecycle.md to know more about worker and content script applications port lifecycle.
   *
   * @param {number} tabId The tab id
   * @param {object} changeInfo The change info of the tab
   * @param {object} tab The tab
   * @returns {Promise<void>}
   */
  static async exec(tabId, changeInfo, tab) {
    // ignore loading requests
    if (changeInfo.status !== "complete") {
      return;
    }

    // ignore about:blank urls they can not be interacted with anyway
    if (tab.url === "about:blank") {
      return;
    }
    /*
     * We can't insert scripts if the url is not https or http
     * as this is not allowed, instead we insert the scripts manually in the background page if needed
     */
    if (!(tab?.url?.startsWith("http://") || tab?.url?.startsWith("https://"))) {
      return;
    }

    await TabService.handleNavigation(tabId, tab.url);
  }

  /**
   * Handle webNavigation.onCompleted events.
   * Used by Safari entry point. The browser-level URL filter ensures only http/https URLs reach this handler.
   * @param {object} details The webNavigation event details
   * @param {number} details.tabId The tab id
   * @param {number} details.frameId The frame id (0 for top frame)
   * @param {string} details.url The URL of the navigation
   * @returns {Promise<void>}
   */
  static async execNavigationCompletion(details) {
    /*
     * SECURITY: Only process top-frame navigations.
     * webNavigation.onCompleted fires for all frames including iframes.
     * Passbolt must never inject content scripts into iframes.
     */
    if (details.frameId !== 0) {
      return;
    }

    await TabService.handleNavigation(details.tabId, details.url);
  }

  /**
   * Handle a completed top-frame navigation. Manages worker lifecycle and triggers pagemod identification.
   * Shared by both tabs.onUpdated (exec) and webNavigation.onCompleted (execNavigationCompletion) entry points.
   * @param {number} tabId The tab id
   * @param {string} url The URL the tab navigated to
   * @returns {Promise<void>}
   */
  static async handleNavigation(tabId, url) {
    console.debug(`TabService::handleNavigation(id: ${tabId}, url: ${url}): Navigation detected.`);

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
       * reopen the port and connect to it. It can happen when the navigation event fires too many events, especially
       * happening when a user reloads the tab multiple times very fast.
       *
       * To avoid this scenario, ensure that the worker attachment process triggered by the first navigation
       * event had time to complete its treatment. The attachment will be completed when the content script inserted
       * in the tab successfully opened the port and connect to the background script.
       *
       * To avoid any deadlock on the tab, if the content script was not able to connect to the background page within
       * 300ms, treat the last navigation event and trigger a pagemod identification process on it.
       */
      if (workerEntity.isWaitingConnection || workerEntity.isReconnecting) {
        console.debug(
          `TabService::handleNavigation(id: ${tabId}): Waiting content script port initial connection or reconnection.`,
        );
        await WorkerService.checkAndExecNavigationForWorkerWaitingConnection(workerEntity);
        return;
      }

      /*
       * If a port associated to this worker still exists in memory, try to connect to the content script application
       * that opened it.
       */
      if (PortManager.isPortExist(worker.id)) {
        // Port exists in runtime memory.
        const port = PortManager.getPortById(workerEntity.id);
        /*
         * Only try to connect with the content script application if the origin of the tab url is similar to the
         * origin of the application url referenced by the associated port. If the origin change, the tab DOM has
         * been flushed and within any application on it.
         */
        if (hasUrlSameOrigin(port._port.sender.url, url)) {
          try {
            await PromiseTimeoutService.exec(port.request("passbolt.port.check"));
            console.debug(
              `TabService::handleNavigation(id: ${tabId}):  Content script application acknowledged presence on worker runtime memory port.`,
            );
            return;
          } catch (error) {
            console.debug(
              `TabService::handleNavigation(id: ${tabId}): No content script application acknowledged presence on worker runtime memory port.`,
              error,
            );
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
          console.debug(
            `TabService::handleNavigation(id: ${tabId}): A content script application reconnected its port.`,
          );
          return;
        } catch (error) {
          console.debug(
            `TabService::handleNavigation(id: ${tabId}): No content script application was able to reconnect its port.`,
            error,
          );
        }
      }
    }

    // Execute the process of a web navigation to detect pagemod and script to insert
    const frameDetails = {
      frameId: 0,
      tabId: tabId,
      url: url,
    };
    await WebNavigationService.exec(frameDetails);
    console.debug(`TabService::handleNavigation(id: ${tabId}): Trigger pagemods identification process.`);
  }
}

export default TabService;
