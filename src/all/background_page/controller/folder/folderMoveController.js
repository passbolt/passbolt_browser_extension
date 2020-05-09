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
const Resource = require('../../model/resource').Resource;
const {FolderEntity} = require('../../model/entity/folder/folderEntity');
const {FolderModel} = require('../../model/folder/folderModel');
const {ResourceModel} = require('../../model/resource/resourceModel');

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
    this.folderModel = new FolderModel(clientOptions)
  }

  /**
   * Move content.
   * @param moveDto {object} The move data
   * {
   *   resources: {array} The resources ids to move
   *   folders: {array} The folders ids to move
   *   folderParentId: {string} The destination folder
   * }
   */
  async main(moveDto) {
    const folderParentId = moveDto.folderParentId ? moveDto.folderParentId : null;
    const foldersIds = moveDto.folders ? moveDto.folders : [];
    const resourcesIds = moveDto.resources ? moveDto.resources : null;

    await this.moveFolders(foldersIds, folderParentId);
    await this.moveResources(resourcesIds, folderParentId);
  }

  /**
   * Move folders.
   * @param {array} ids Folders to move
   * @param {string} folderParentId The destination folder.
   * @returns {Promise<void>}
   */
  async moveFolders(ids, folderParentId) {
    for (let i in ids) {
      const id = ids[i];
      const folderDto = {id, 'folder_parent_id': folderParentId};
      await this.folderModel.update(new FolderEntity(folderDto));
    }
  }

  /**
   * Move resources.
   * @param {array} ids Resources to move
   * @param {string} folderParentId The destination folder.
   * @returns {Promise<void>}
   */
  async moveResources(ids, folderParentId) {
    for (let i in ids) {
      const id = ids[i];
      const resourceDto = {id, folderParentId};

      // TODO use this.resourceModel.move
      await Resource.update(resourceDto);
    }
  }
}

exports.FolderMoveController = FolderMoveController;

