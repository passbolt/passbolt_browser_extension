/**
 * Tab events
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const {i18n} = require("../sdk/i18n");
const browser = require("webextension-polyfill/dist/browser-polyfill");

const listen = function (worker) {
  /*
   * Get the current tab url.
   *
   * @listens passbolt.active-tab.get-url
   */
  worker.port.on('passbolt.active-tab.get-url', async function (requestId) {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    // There's a possiblity when `tabs` will be undefined.
    // By instance separate `facebook.com` login window serves its usecase (login by facebook/google)
    if (!tabs || !tabs[0]) {
      worker.port.emit(requestId, 'ERROR', new Error(i18n.t('Unable to retrieve the active tab info.')));
      return;
    }
    worker.port.emit(requestId, 'SUCCESS', tabs[0].url);
  });

  /*
   * Get the current tab info.
   *
   * @listens passbolt.active-tab.get-info
   */
  worker.port.on('passbolt.active-tab.get-info', async function (requestId) {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tabs || !tabs[0]) {
      worker.port.emit(requestId, 'ERROR', new Error(i18n.t('Unable to retrieve the active tab info.')));
      return;
    }
    const info = {
      title: tabs[0].title,
      url: tabs[0].url
    }
    worker.port.emit(requestId, 'SUCCESS', info);
  });

};
exports.listen = listen;
