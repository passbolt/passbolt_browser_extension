/**
 * Quick access events
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const {i18n} = require('../sdk/i18n');
const Worker = require('../model/worker');
const {BrowserTabService} = require("../service/ui/browserTab.service");
const {ResourceInProgressCacheService} = require("../service/cache/resourceInProgressCache.service");
const {User} = require('../model/user');
const {SecretDecryptController} = require('../controller/secret/secretDecryptController');

const listen = function (worker) {
  /*
   * Use a resource on the current tab.
   *
   * @listens passbolt.quickaccess.use-resource-on-current-tab
   * @param requestId {uuid} The request identifier
   * @param resourceId {uuid} The resource identifier
   */
  worker.port.on('passbolt.quickaccess.use-resource-on-current-tab', async function (requestId, resourceId, tabId) {
    let tab;
    if (!worker.port) {
      const err = new Error(i18n.t('Inactive worker on the page.'));
      worker.port.emit(requestId, 'ERROR', err);
    }
    try {
      tab = tabId ? await BrowserTabService.getById(tabId) : await BrowserTabService.getCurrent();  // Code to get browser's tab
      if (!tab) {
        const err = new Error(i18n.t('Autofill failed. Could not find the active tab.'));
        worker.port.emit(requestId, 'ERROR', err);
      }
    } catch(error) {
      worker.port.emit(requestId, 'ERROR', error);
    }

    try {
      const apiClientOptions = await User.getInstance().getApiClientOptions();
      const controller = new SecretDecryptController(worker, requestId, apiClientOptions);
      const {plaintext, resource} = await controller.main(resourceId, false);

      // Define what to do autofill
      const username = resource.username || '';
      let password;
      if (typeof plaintext === 'string') {
        password = plaintext;
      } else {
        password = plaintext.password || '';
      }

      // Current active tab's url is passing to quick access to check the same origin request
      const webIntegrationWorker = await Worker.get('WebIntegration', tab.id);
      await webIntegrationWorker.port.request('passbolt.quickaccess.fill-form', username, password, tab.url);
      worker.port.emit(requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * Prepare to create a new resource.
   *
   * @listens passbolt.resources.prepare-create
   * @param requestId {uuid} The request identifier
   * @param tabId {string} The tab id
   */
  worker.port.on('passbolt.quickaccess.prepare-resource', async function (requestId, tabId) {
    try {
      const resourceInProgress = ResourceInProgressCacheService.consume();
      if (resourceInProgress === null) {
        // Retrieve resource name and uri from tab.
        const tab = tabId ? await BrowserTabService.getById(tabId) : await BrowserTabService.getCurrent();
        const name = tab.title;
        const uri = tab.url;
        worker.port.emit(requestId, 'SUCCESS', {name, uri});
      } else {
        worker.port.emit(requestId, 'SUCCESS', resourceInProgress);
      }
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * Prepare to auto-save a new resource.
   *
   * @listens passbolt.resources.prepare-autosave
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.quickaccess.prepare-autosave', async function (requestId) {
    try {
      const resourceInProgress = ResourceInProgressCacheService.consume() || {};
      worker.port.emit(requestId, 'SUCCESS', resourceInProgress);
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * Update the quickacess window height
   *
   * @listens passbolt.quickaccess.update-window-height
   * @param height {int} the height to apply
   */
  worker.port.on('passbolt.quickaccess.update-window-height', async function (height) {
    try {
      const quickAccessTab = await BrowserTabService.getById(worker.tab.id);
      browser.windows.update(quickAccessTab.windowId, {height: height + 30});
    } catch (error) {
      console.error(error);
    }
  });

};

exports.listen = listen;
