/**
 * Tab events
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const browser = require("webextension-polyfill/dist/browser-polyfill");

const listen = function (worker) {
  /*
   * Get the current tab url.
   *
   * @listens passbolt.active-tab.get-url
   */
  worker.port.on('passbolt.active-tab.get-url', async function (requestId) {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    worker.port.emit(requestId, 'SUCCESS', tabs[0].url);
  });

};
exports.listen = listen;
