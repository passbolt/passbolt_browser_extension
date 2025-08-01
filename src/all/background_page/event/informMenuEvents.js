/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 */
import InformMenuController from "../controller/InformMenuController/InformMenuController";
import GetLocaleController from "../controller/locale/getLocaleController";
import GetOrFindPasswordPoliciesController from "../controller/passwordPolicies/getOrFindPasswordPoliciesController";
import AutofillController from "../controller/autofill/AutofillController";
import GetOrFindLoggedInUserController from "../controller/user/getOrFindLoggedInUserController";
import GetOrFindMetadataKeysSettingsController from "../controller/metadata/getOrFindMetadataKeysSettingsController";

/**
 * Listens the inform menu events
 * @param {Worker} worker
 * @param {ApiClientOptions} apiClientOptions the api client options
 * @param {AccountEntity} account the user account
 */
const listen = function(worker, apiClientOptions, account) {
  /** Whenever the in-form menu need initialization */
  worker.port.on('passbolt.in-form-menu.init', async requestId => {
    const informMenuController = new InformMenuController(worker, apiClientOptions, account);
    await informMenuController.getInitialConfiguration(requestId);
  });

  /** Whenever the user clicks on create new credentials of the in-form-menu */
  worker.port.on('passbolt.in-form-menu.create-new-credentials', async requestId => {
    const informMenuController = new InformMenuController(worker, apiClientOptions, account);
    await informMenuController.createNewCredentials(requestId);
  });

  /** Whenever the user clicks on create new credentials of the in-form-menu */
  worker.port.on('passbolt.in-form-menu.save-credentials', async requestId => {
    const informMenuController = new InformMenuController(worker, apiClientOptions, account);
    await informMenuController.saveCredentials(requestId);
  });

  /**
   * Whenever the user intends to use a suggested resource as credentials for the current page
   */
  worker.port.on('passbolt.in-form-menu.use-suggested-resource', async(requestId, resourceId) => {
    const autofillController = new AutofillController(worker, requestId, apiClientOptions, account);
    await autofillController._exec(resourceId, worker.tab.id);
  });

  /** Whenever the user clicks on browse credentials of the in-form-menu */
  worker.port.on('passbolt.in-form-menu.browse-credentials', async requestId => {
    const informMenuController = new InformMenuController(worker, apiClientOptions, account);
    informMenuController.browseCredentials(requestId);
  });

  /** Whenever the user wants to fill the password field with a password */
  worker.port.on('passbolt.in-form-menu.fill-password', async(requestId, password) => {
    const informMenuController = new InformMenuController(worker, apiClientOptions, account);
    await informMenuController.fillPassword(requestId, password);
  });

  /** Whenever the user wants to close the in-form-menu */
  worker.port.on('passbolt.in-form-menu.close', async requestId => {
    const informMenuController = new InformMenuController(worker, apiClientOptions, account);
    await informMenuController.close(requestId);
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
   * Get locale language
   *
   * @listens passbolt.locale.get
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.locale.get', async requestId => {
    const getLocaleController = new GetLocaleController(worker, apiClientOptions);

    try {
      const localeEntity = await getLocaleController.getLocale();
      worker.port.emit(requestId, 'SUCCESS', localeEntity);
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
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

  /*
   * ==================================================================================
   *  Metadata events.
   * ==================================================================================
   */

  /*
   * Get or find metadata keys settings.
   *
   * @listens passbolt.metadata.get-or-find-metadata-keys-settings
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.metadata.get-or-find-metadata-keys-settings', async requestId => {
    const controller = new GetOrFindMetadataKeysSettingsController(worker, requestId, apiClientOptions, account);
    await controller._exec();
  });
};

export const InformMenuEvents = {listen};
