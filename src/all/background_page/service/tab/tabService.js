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
      if (PortManager.isPortExist(worker.id)) {
        // Get the port associate to a bootstrap application
        const port = PortManager.getPortById(worker.id);
        // Check if the url has the same origin
        if (hasUrlSameOrigin(port._port.sender.url, tab.url)) {
          try {
            // If the port is still connected do nothing
            port.emit('passbolt.port.check');
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

function mappingFrameDetailsFromTab(tab) {
  return  {
    // Mapping the tab info as a frame details to be compliant with webNavigation
    frameId: 0,
    tabId: tab.id,
    url: tab.url
  };
}

export default TabService;
