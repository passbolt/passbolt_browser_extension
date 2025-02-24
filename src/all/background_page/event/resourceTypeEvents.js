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
import FindAllByDeletedAndNonDeletedResourceTypesContoller from "../controller/resourceType/findAllByDeletedAndNonDeletedResourceTypesContoller";
import GetResourceTypesController from "../controller/resourceType/getResourceTypesController";

/**
 * Listens the resource type events
 * @param {Worker} worker
 * @param {ApiClientOptions} apiClientOptions the api client options
 */
const listen = function(worker, apiClientOptions) {
  /*
   * Get the resource types from the local storage.
   *
   * @listens passbolt.resource-type.get-all
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.resource-type.get-or-find-all', async requestId => {
    const controller = new GetResourceTypesController(worker, requestId, apiClientOptions);
    await controller._exec();
  });

  /*
   * Find all the resource types (deleted and available) from the API.
   *
   * @listens passbolt.resource-type.get-all
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.resource-type.find-all-by-deleted-and-non-deleted', async requestId => {
    const controller = new FindAllByDeletedAndNonDeletedResourceTypesContoller(worker, requestId, apiClientOptions);
    await controller._exec();
  });
};

export const ResourceTypeEvents = {listen};
