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
import User from "../model/user";
import InformMenuController from "../controller/InformMenuController/InformMenuController";
import GetLocaleController from "../controller/locale/getLocaleController";

/**
 * Listens the inform menu events
 * @param worker
 */
const listen = function(worker) {
  /** Whenever the in-form menu need initialization */
  worker.port.on('passbolt.in-form-menu.init', async requestId => {
    const apiClientOptions =  await User.getInstance().getApiClientOptions();
    const informMenuController = new InformMenuController(worker, apiClientOptions);
    await informMenuController.getInitialConfiguration(requestId);
  });

  /** Whenever the user clicks on create new credentials of the in-form-menu */
  worker.port.on('passbolt.in-form-menu.create-new-credentials', async requestId => {
    const apiClientOptions =  await User.getInstance().getApiClientOptions();
    const informMenuController = new InformMenuController(worker, apiClientOptions);
    await informMenuController.createNewCredentials(requestId);
  });

  /** Whenever the user clicks on create new credentials of the in-form-menu */
  worker.port.on('passbolt.in-form-menu.save-credentials', async requestId => {
    const apiClientOptions =  await User.getInstance().getApiClientOptions();
    const informMenuController = new InformMenuController(worker, apiClientOptions);
    await informMenuController.saveCredentials(requestId);
  });

  /**
   * Whenever the user intends to use a suggested resource as credentials for the current page
   */
  worker.port.on('passbolt.in-form-menu.use-suggested-resource', async(requestId, resourceId) => {
    const apiClientOptions =  await User.getInstance().getApiClientOptions();
    const informMenuController = new InformMenuController(worker, apiClientOptions);
    await informMenuController.useSuggestedResource(requestId, resourceId);
  });

  /** Whenever the user clicks on browse credentials of the in-form-menu */
  worker.port.on('passbolt.in-form-menu.browse-credentials', async requestId => {
    const apiClientOptions =  await User.getInstance().getApiClientOptions();
    const informMenuController = new InformMenuController(worker, apiClientOptions);
    informMenuController.browseCredentials(requestId);
  });

  /** Whenever the user wants to fill the password field with a password */
  worker.port.on('passbolt.in-form-menu.fill-password', async(requestId, password) => {
    const apiClientOptions =  await User.getInstance().getApiClientOptions();
    const informMenuController = new InformMenuController(worker, apiClientOptions);
    await informMenuController.fillPassword(requestId, password);
  });

  /** Whenever the user wants to close the in-form-menu */
  worker.port.on('passbolt.in-form-menu.close', async requestId => {
    const apiClientOptions =  await User.getInstance().getApiClientOptions();
    const informMenuController = new InformMenuController(worker, apiClientOptions);
    await informMenuController.close(requestId);
  });

  /*
   * Get locale language
   *
   * @listens passbolt.locale.get
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.locale.get', async requestId => {
    const apiClientOptions = await User.getInstance().getApiClientOptions();
    const getLocaleController = new GetLocaleController(worker, apiClientOptions);

    try {
      const localeEntity = await getLocaleController.getLocale();
      worker.port.emit(requestId, 'SUCCESS', localeEntity);
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });
};

export const InformMenuEvents = {listen};
