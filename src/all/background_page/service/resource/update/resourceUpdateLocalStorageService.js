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
 * @since         5.2.0
 */
import ResourceLocalStorage from "../../local_storage/resourceLocalStorage";
import ResourcesCollection from "../../../model/entity/resource/resourcesCollection";
import {assertArrayUUID, assertUuid} from "../../../utils/assertions";

class ResourceUpdateLocalStorageService {
  /**
   * Update folder parent id for the resource with ids
   *
   * @param {Array<string>} resourceIds The resource ids
   * @param {string | null} folderParentId The folder parent id
   * @returns {Promise<void>}
   */
  async updateFolderParentId(resourceIds, folderParentId) {
    assertArrayUUID(resourceIds, 'The parameter "resourcesIds" should contain only uuid');
    if (folderParentId !== null) {
      assertUuid(folderParentId, 'The folder parent id should be a valid UUID');
    }
    // Get the resources from local storage by ids to update only folder parent_id
    const resourcesDto = await ResourceLocalStorage.getResourcesByIds(resourceIds);
    if (resourcesDto?.length > 0) {
      // Create the resource collection that should be updated
      const resourceCollection = new ResourcesCollection(resourcesDto);

      for (const resource of resourceCollection) {
        resource.folderParentId = folderParentId;
      }
      // Update the collection with the resources updated
      await ResourceLocalStorage.updateResourcesCollection(resourceCollection);
    }
  }
}

export default ResourceUpdateLocalStorageService;
