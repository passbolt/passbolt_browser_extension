/**
 * Quick access events
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
import browser from "../sdk/polyfill/browserPolyfill";
import BrowserTabService from "../service/ui/browserTab.service";
import ResourceInProgressCacheService from "../service/cache/resourceInProgressCache.service";
import i18n from "../sdk/i18n";
import FindMeController from "../controller/rbac/findMeController";
import GetOrFindLoggedInUserController from "../controller/user/getOrFindLoggedInUserController";
import GetOrFindPasswordPoliciesController from "../controller/passwordPolicies/getOrFindPasswordPoliciesController";
import AutofillController from "../controller/autofill/AutofillController";
import GetOrFindPasswordExpirySettingsController from "../controller/passwordExpiry/getOrFindPasswordExpirySettingsController";

/**
 * Listens to the quickaccess application events
 * @param {Worker} worker
 * @param {ApiClientOptions} apiClientOptions the api client options
 * @param {AccountEntity} account the user account
 */
const listen = function(worker, apiClientOptions, account) {
  /*
   * Use a resource on the current tab.
   *
   * @listens passbolt.quickaccess.use-resource-on-current-tab
   * @param requestId {uuid} The request identifier
   * @param resourceId {uuid} The resource identifier
   */
  worker.port.on('passbolt.quickaccess.use-resource-on-current-tab', async(requestId, resourceId, tabId) => {
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
    } catch (error) {
      worker.port.emit(requestId, 'ERROR', error);
    }
    const autofillController = new AutofillController(worker, requestId, apiClientOptions, account);
    await autofillController._exec(resourceId, tab.id);
  });

  /*
   * Prepare to create a new resource.
   *
   * @listens passbolt.resources.prepare-create
   * @param requestId {uuid} The request identifier
   * @param tabId {string} The tab id
   */
  worker.port.on('passbolt.quickaccess.prepare-resource', async(requestId, tabId) => {
    try {
      const resourceInProgress = await ResourceInProgressCacheService.consume();
      if (resourceInProgress === null) {
        // Retrieve resource name and uri from tab.
        const tab = tabId ? await BrowserTabService.getById(tabId) : await BrowserTabService.getCurrent();
        const name = tab.title;
        const uri = tab.url;
        worker.port.emit(requestId, 'SUCCESS', {name: name, uri: uri});
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
  worker.port.on('passbolt.quickaccess.prepare-autosave', async requestId => {
    try {
      const resourceInProgress = await ResourceInProgressCacheService.consume() || {};
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
  worker.port.on('passbolt.quickaccess.update-window-height', async height => {
    try {
      const quickAccessTab = await BrowserTabService.getById(worker.tab.id);
      browser.windows.update(quickAccessTab.windowId, {height: height + 30});
    } catch (error) {
      console.error(error);
    }
  });

  /*
   * Find the logged in user
   *
   * @listens passbolt.users.find-logged-in-user
   * @param requestId {uuid} The request identifier
   * @param refreshCache {bool} (Optional) Default false. Should request the API and refresh the cache.
   */
  worker.port.on('passbolt.users.find-logged-in-user', async(requestId, refreshCache = false) => {
    const controller = new GetOrFindLoggedInUserController(worker, requestId, apiClientOptions, account);
    await controller._exec(refreshCache);
  });

  /*
   * ==================================================================================
   *  Role based control action
   * ==================================================================================
   */

  worker.port.on('passbolt.rbacs.find-me', async(requestId, name) => {
    const controller = new FindMeController(worker, requestId, apiClientOptions, account);
    await controller._exec(name);
  });

  /*
   * ==================================================================================
   *  Password policies events.
   * ==================================================================================
   */

  worker.port.on('passbolt.password-policies.get', async requestId => {
    const controller = new GetOrFindPasswordPoliciesController(worker, requestId, account, apiClientOptions);
    await controller._exec();
  });

  worker.port.on('passbolt.password-expiry.get-or-find', async(requestId, refreshCache = false) => {
    const controller = new GetOrFindPasswordExpirySettingsController(worker, requestId, account, apiClientOptions);
    await controller._exec(refreshCache);
  });
};

export const QuickAccessEvents = {listen};
