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
import User from "../model/user";
import ResourceTypeModel from "../model/resourceType/resourceTypeModel";


const listen = function(worker) {
  /*
   * Get the resource types from the local storage.
   *
   * @listens passbolt.resource-type.get-all
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.resource-type.get-all', async requestId => {
    try {
      const apiClientOptions = await User.getInstance().getApiClientOptions();
      const resourceTypeModel = new ResourceTypeModel(apiClientOptions);
      const resourceTypes = await resourceTypeModel.getOrFindAll();
      worker.port.emit(requestId, 'SUCCESS', resourceTypes);
    } catch (error) {
      worker.port.emit(requestId, 'ERROR', error);
    }
  });
};

export const ResourceTypeEvents = {listen};
