/**
 * Quick access events
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
import BrowserTabService from "../service/ui/browserTab.service";
import i18n from "../sdk/i18n";
import FindRbacMeController from "../controller/rbac/findRbacMeController";
import GetOrFindLoggedInUserController from "../controller/user/getOrFindLoggedInUserController";
import GetOrFindPasswordPoliciesController from "../controller/passwordPolicies/getOrFindPasswordPoliciesController";
import AutofillController from "../controller/autofill/AutofillController";
import LaunchResourceController from "../controller/autofill/launchResourceController";
import OpenResourceUriInOpenerTabController from "../controller/tab/openResourceUriInOpenerTabController";
import GetOrFindPasswordExpirySettingsController from "../controller/passwordExpiry/getOrFindPasswordExpirySettingsController";
import GetOrFindMetadataTypesController from "../controller/metadata/getMetadataTypesSettingsController";
import CopyToClipboardController from "../controller/clipboard/copyToClipboardController";
import CopyTemporarilyToClipboardController from "../controller/clipboard/copyTemporarilyToClipboardController";
import PrepareResourceController from "../controller/quickaccess/prepareResourceController";
import ConsumeInProgressCreationResourceController from "../controller/quickaccess/consumeInProgressCreationResourceController";
import GetOrFindMetadataKeysSettingsController from "../controller/metadata/getOrFindMetadataKeysSettingsController";

/**
 * Listens to the quickaccess application events
 * @param {Worker} worker
 * @param {ApiClientOptions} apiClientOptions the api client options
 * @param {AccountEntity} account the user account
 */
const listen = function (worker, apiClientOptions, account) {
  /*
   * Use a resource on the current tab.
   *
   * @listens passbolt.quickaccess.use-resource-on-current-tab
   * @param requestId {uuid} The request identifier
   * @param resourceId {uuid} The resource identifier
   */
  worker.port.on("passbolt.quickaccess.use-resource-on-current-tab", async (requestId, resourceId, tabId) => {
    let tab;
    if (!worker.port) {
      const err = new Error(i18n.t("Inactive worker on the page."));
      worker.port.emit(requestId, "ERROR", err);
    }
    try {
      tab = tabId ? await BrowserTabService.getById(tabId) : await BrowserTabService.getCurrent(); // Code to get browser's tab
      if (!tab) {
        const err = new Error(i18n.t("Autofill failed. Could not find the active tab."));
        worker.port.emit(requestId, "ERROR", err);
      }
    } catch (error) {
      worker.port.emit(requestId, "ERROR", error);
    }
    const autofillController = new AutofillController(worker, requestId, apiClientOptions, account);
    await autofillController._exec(resourceId, tab.id);
  });

  /*
   * Launch a resource: navigate to its URI then autofill the login form once the page has loaded.
   * Only dispatched by the popup when the autofillOnLaunch setting is enabled.
   *
   * @listens passbolt.quickaccess.launch-resource
   * @param requestId {uuid} The request identifier
   * @param resourceId {uuid} The resource identifier
   * @param openerTabId {number} The id of the tab that was active when the popup opened
   */
  worker.port.on("passbolt.quickaccess.launch-resource", async (requestId, resourceId, openerTabId) => {
    try {
      const controller = new LaunchResourceController(worker, requestId, apiClientOptions, account);
      await controller._exec(resourceId, openerTabId);
    } catch (error) {
      // _exec handles its own outcome; this guards controller construction so a failure there
      // cannot become an unhandled rejection.
      console.error(error);
      worker.port.emit(requestId, "ERROR", new Error("Unable to launch and autofill the resource."));
    }
  });

  /*
   * Open a resource URI in a tab WITHOUT autofilling (autofill-on-launch disabled). Reuses the
   * opener tab when it is blank (e.g. an incognito new-tab page) for parity with the autofill path.
   *
   * @listens passbolt.quickaccess.open-resource-uri
   * @param requestId {uuid} The request identifier
   * @param uri {string} The resource URI to open
   * @param openerTabId {number} The id of the tab that was active when the popup opened
   */
  worker.port.on("passbolt.quickaccess.open-resource-uri", async (requestId, uri, openerTabId) => {
    try {
      const controller = new OpenResourceUriInOpenerTabController(worker, requestId);
      await controller._exec(uri, openerTabId);
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, "ERROR", new Error("Unable to open the resource URL."));
    }
  });

  /*
   * Prepare to create a new resource.
   *
   * @listens passbolt.resources.prepare-create
   * @param requestId {uuid} The request identifier
   * @param tabId {string} The tab id
   */
  worker.port.on("passbolt.quickaccess.prepare-resource", async (requestId, tabId) => {
    const controller = new PrepareResourceController(worker, requestId);
    await controller._exec(tabId);
  });

  /*
   * Prepare to auto-save a new resource.
   *
   * @listens passbolt.resources.prepare-autosave
   * @param requestId {uuid} The request identifier
   */
  worker.port.on("passbolt.quickaccess.prepare-autosave", async (requestId) => {
    const controller = new ConsumeInProgressCreationResourceController(worker, requestId);
    await controller._exec();
  });

  /*
   * Update the quickacess window height
   *
   * @listens passbolt.quickaccess.update-window-height
   * @param height {int} the height to apply
   */
  worker.port.on("passbolt.quickaccess.update-window-height", async (height) => {
    try {
      const quickAccessTab = await BrowserTabService.getById(worker.tab.id);
      browser.windows.update(quickAccessTab.windowId, { height: height + 30 });
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
  worker.port.on("passbolt.users.find-logged-in-user", async (requestId, refreshCache = false) => {
    const controller = new GetOrFindLoggedInUserController(worker, requestId, apiClientOptions, account);
    await controller._exec(refreshCache);
  });

  /*
   * ==================================================================================
   *  Role based control action
   * ==================================================================================
   */

  worker.port.on("passbolt.rbacs.find-me", async (requestId, name) => {
    const controller = new FindRbacMeController(worker, requestId, apiClientOptions, account);
    await controller._exec(name);
  });

  /*
   * ==================================================================================
   *  Password policies events.
   * ==================================================================================
   */

  worker.port.on("passbolt.password-policies.get", async (requestId) => {
    const controller = new GetOrFindPasswordPoliciesController(worker, requestId, account, apiClientOptions);
    await controller._exec();
  });

  worker.port.on("passbolt.password-expiry.get-or-find", async (requestId, refreshCache = false) => {
    const controller = new GetOrFindPasswordExpirySettingsController(worker, requestId, account, apiClientOptions);
    await controller._exec(refreshCache);
  });

  /*
   * ==================================================================================
   *  Metadata events.
   * ==================================================================================
   */

  /*
   * Get or find metadata types settings.
   *
   * @listens passbolt.metadata.get-or-find-metadata-types-settings
   * @param requestId {uuid} The request identifier
   */
  worker.port.on("passbolt.metadata.get-or-find-metadata-types-settings", async (requestId) => {
    const controller = new GetOrFindMetadataTypesController(worker, requestId, apiClientOptions, account);
    await controller._exec();
  });

  /*
   * Get or find metadata keys settings.
   *
   * @listens passbolt.metadata.get-or-find-metadata-keys-settings
   * @param requestId {uuid} The request identifier
   */
  worker.port.on("passbolt.metadata.get-or-find-metadata-keys-settings", async (requestId) => {
    const controller = new GetOrFindMetadataKeysSettingsController(worker, requestId, apiClientOptions, account);
    await controller._exec();
  });

  /*
   * ==================================================================================
   *  Clipboard events.
   * ==================================================================================
   */

  /**
   * Copies the given content into the clipboard and clear any clipboard flush alarms.
   *
   * @listens assbolt.clipboard.copy
   * @param {string} requestId The request identifier
   * @param {string} text the content to copy
   */
  worker.port.on("passbolt.clipboard.copy", async (requestId, text) => {
    const clipboardController = new CopyToClipboardController(worker, requestId);
    await clipboardController._exec(text);
  });

  /**
   * Copies temporarily the given content into the clipboard and set a clipboard flush alarm.
   *
   * @listens assbolt.clipboard.copy-temporarily
   * @param {string} requestId The request identifier
   * @param {string} text the content to copy
   */
  worker.port.on("passbolt.clipboard.copy-temporarily", async (requestId, text) => {
    const clipboardController = new CopyTemporarilyToClipboardController(worker, requestId);
    await clipboardController._exec(text);
  });
};

export const QuickAccessEvents = { listen };
