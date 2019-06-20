/**
 * Quick access events
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const __ = require('../sdk/l10n').get;
const UseResourceOnCurrentTabController = require('../controller/quickaccess/useResourceOnCurrentTabController').UseResourceOnCurrentTabController;

const listen = function (worker) {
  /*
   * Use a resource on the current tab.
   *
   * @listens passbolt.quickaccess.use-resource-on-current-tab
   * @param requestId {uuid} The request identifier
   * @param resourceId {uuid} The resource identifier

   */
  worker.port.on('passbolt.quickaccess.use-resource-on-current-tab', async function (requestId, resourceId) {
    if (!Validator.isUUID(resourceId)) {
      worker.port.emit(requestId, 'ERROR', worker.port.getEmitableError(new Error(__('The resource id should be a valid UUID'))));
      return;
    }
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });  // Code to get browser's current active tab
    const controller = new UseResourceOnCurrentTabController(worker, requestId);
    // Passing current active tab to `use-resource-on-current-tab` controller, to check the same origin request
    controller.main(resourceId, tabs[0]);
  });

};

exports.listen = listen;
