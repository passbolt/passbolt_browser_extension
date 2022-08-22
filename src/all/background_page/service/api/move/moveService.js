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
import ResourceEntity from "../../../model/entity/resource/resourceEntity";
import FolderEntity from "../../../model/entity/folder/folderEntity";
import AbstractService from "../abstract/abstractService";

const MOVE_SERVICE_RESOURCE_NAME = 'move';
const MOVE_SERVICE_FOREIGN_MODEL_FOLDER = 'Folder';
const MOVE_SERVICE_FOREIGN_MODEL_RESOURCE = 'Resource';

class MoveService extends AbstractService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, MoveService.RESOURCE_NAME);
  }

  /**
   * API Resource Name
   *
   * @returns {string}
   * @public
   */
  static get RESOURCE_NAME() {
    return MOVE_SERVICE_RESOURCE_NAME;
  }

  /**
   * Move an entity in a user tree.
   *
   * @param {ResourceEntity|FolderEntity} entity The entity to move
   * @throws {TypeError} if entity is not a ResourceEntity or FolderEntity
   * @returns {Promise<*>}
   * @public
   */
  async move(entity) {
    let foreignModel;

    if (entity instanceof FolderEntity) {
      foreignModel = MOVE_SERVICE_FOREIGN_MODEL_FOLDER;
    } else if (entity instanceof ResourceEntity) {
      foreignModel = MOVE_SERVICE_FOREIGN_MODEL_RESOURCE;
    } else {
      throw new TypeError("The entity must be a FolderEntity or a ResourceEntity");
    }

    const url = `${foreignModel.toLowerCase()}/${entity.id}`;
    const data = entity.toDto();
    const response = await this.apiClient.update(url, data);
    return response.body;
  }
}

export default MoveService;
