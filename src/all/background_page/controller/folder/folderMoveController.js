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
 * @since         2.13.0
 */
const {FolderEntity} = require('../../model/entity/folder/folderEntity');
const {FolderLocalStorage} = require('../../service/local_storage/folderLocalStorage');
const {FolderModel} = require('../../model/folder/folderModel');

const {ResourceEntity} = require('../../model/entity/resource/resourceEntity');
const {ResourceModel} = require('../../model/resource/resourceModel');
const {ResourceLocalStorage} = require('../../service/local_storage/resourceLocalStorage');

class FolderMoveController {
  /**
   * FolderMoveController constructor
   *
   * @param worker
   * @param requestId
   * @param clientOptions
   */
  constructor(worker, requestId, clientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.folderModel = new FolderModel(clientOptions);
    this.resourceModel = new ResourceModel(clientOptions);
  }

  /**
   * Move content.
   * @param moveDto {object} The move data
   * {
   *   resources: {array} The resources ids to move
   *   folders: {array} The folders ids to move
   *   folderParentId: {(string|null)} The destination folder
   * }
   */
  async main(moveDto) {
    const folderParentId = moveDto.folderParentId ? moveDto.folderParentId : null;
    const foldersIds = moveDto.folders ? moveDto.folders : [];
    const resourcesIds = moveDto.resources ? moveDto.resources : null;

    // Sanity checks
    if (!(folderParentId === null || Validator.isUUID(folderParentId))) {
      throw new TypeError('Folder move expect a valid folder parent id.');
    }
    if (folderParentId !== null) {
      const folderDto = await FolderLocalStorage.getFolderById(folderParentId);
      if (!folderDto) {
        throw new Error('Could not move, the folder parent id does not exist');
      }
    }

    await this.moveFolders(foldersIds, folderParentId);
    await this.moveResources(resourcesIds, folderParentId);
  }

  /**
   * Move folders.
   * @param {array} ids Folders to move
   * @param {(string|null)} folderParentId The destination folder.
   * @returns {Promise<void>}
   */
  async moveFolders(ids, folderParentId) {
    for (let i in ids) {
      const folderId = ids[i];
      await this.folderModel.move(folderId, folderParentId);
    }
  }

  /**
   * Move resources.
   * @param {array} ids Resources to move
   * @param {(string|null)} folderParentId The destination folder.
   * @returns {Promise<void>}
   */
  async moveResources(ids, folderParentId) {
    for (let i in ids) {
      const resourceId = ids[i];
      await this.resourceModel.move(resourceId, folderParentId);
    }
  }
}

exports.FolderMoveController = FolderMoveController;

