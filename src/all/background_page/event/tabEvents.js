/**
 * Tab events
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
import i18n from "../sdk/i18n";
import CloseActiveTabController from "../controller/tab/closeActiveTabController";
import BrowserTabService from "../service/ui/browserTab.service";
import OpenTabController from "../controller/tab/openTabController";

const listen = function (worker) {
  /*
   * Get the current tab url.
   *
   * @listens passbolt.active-tab.get-url
   */
  worker.port.on("passbolt.active-tab.get-url", async (requestId, tabId) => {
    const tab = tabId ? await BrowserTabService.getById(tabId) : await BrowserTabService.getCurrent();
    /*
     * There's a possiblity when `tab` will be empty.
     * By instance separate `facebook.com` login window serves its usecase (login by facebook/google)
     */
    if (!tab) {
      worker.port.emit(requestId, "ERROR", new Error(i18n.t("Unable to retrieve the active tab info.")));
      return;
    }
    worker.port.emit(requestId, "SUCCESS", tab.url);
  });

  /**
   * Closes the current active tab.
   * @param {string} requestId
   * @listens passbolt.active-tab.close
   */
  worker.port.on("passbolt.active-tab.close", async (requestId) => {
    const controller = new CloseActiveTabController(worker, requestId);
    await controller._exec();
  });

  /**
   * Opens a new tab given a URL.
   * @param {string} requestId
   * @listens passbolt.tabs.open
   */
  worker.port.on("passbolt.tabs.open", async (requestId, url) => {
    const controller = new OpenTabController(worker, requestId);
    await controller._exec(url);
  });
};

export const TabEvents = { listen };
