/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2021 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2021 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.0.6
 */

import FindAllRoleController from "../controller/role/findAllRoleControler";
import RolesUpdateLocalStorageController from "../controller/role/rolesUpdateLocalStorageController";

/**
 * Listens the role events
 * @param {Worker} worker
 * @param {ApiClientOptions} apiClientOptions the api client options
 * @param {AccountEntity} the currently signed in user account
 */
const listen = function(worker, apiClientOptions, account) {
  /*
   * Get the roles from the local storage.
   *
   * @listens passbolt.role.get-all
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.role.get-all', async requestId => {
    const controller = new FindAllRoleController(worker, requestId, apiClientOptions, account);
    await controller._exec();
  });

  /*
   * Find roles from the API and udpates the local storage with it.
   *
   * @listens passbolt.role.update-local-storage
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.role.update-local-storage', async requestId => {
    const controller = new RolesUpdateLocalStorageController(worker, requestId, apiClientOptions, account);
    await controller._exec();
  });
};

export const RoleEvents = {listen};
