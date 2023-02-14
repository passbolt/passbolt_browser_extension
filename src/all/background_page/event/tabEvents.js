/**
 * Tab events
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
import i18n from "../sdk/i18n";
import BrowserTabService from "../service/ui/browserTab.service";

const listen = function(worker) {
  /*
   * Get the current tab url.
   *
   * @listens passbolt.active-tab.get-url
   */
  worker.port.on('passbolt.active-tab.get-url', async(requestId, tabId) => {
    const tab = tabId ? await BrowserTabService.getById(tabId) : await BrowserTabService.getCurrent();
    /*
     * There's a possiblity when `tab` will be empty.
     * By instance separate `facebook.com` login window serves its usecase (login by facebook/google)
     */
    if (!tab) {
      worker.port.emit(requestId, 'ERROR', new Error(i18n.t('Unable to retrieve the active tab info.')));
      return;
    }
    worker.port.emit(requestId, 'SUCCESS', tab.url);
  });
};
export const TabEvents = {listen};
