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
  worker.port.on('passbolt.quickaccess.use-resource-on-current-tab', async function (requestId, resourceId) {
    let tab;
    if (!worker.port) {
      const err = new Error(i18n.t('Inactive worker on the page.'));
      worker.port.emit(requestId, 'ERROR', err);
    }
    try {
      const tabs = await browser.tabs.query({active: true, currentWindow: true});  // Code to get browser's current active tab
      if (!tabs || !tabs.length) {
        const err = new Error(i18n.t('Autofill failed. Could not find the active tab.'));
        worker.port.emit(requestId, 'ERROR', err);
      }
      tab = tabs[0];
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
        password = plaintext.password || ''
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
      const resourceInProgress = ResourceInProgressCacheService.getAndConsume() || {};
      const tab = tabId ? await BrowserTabService.getById(tabId) : await BrowserTabService.getCurrent();
      resourceInProgress.name = tab.title;
      resourceInProgress.uri = tab.url;
      worker.port.emit(requestId, 'SUCCESS', resourceInProgress);
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

};

exports.listen = listen;
