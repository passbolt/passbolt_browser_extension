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
import MoveResourcesController from "./moveResourcesController";
import MoveFolderController from "./moveFolderController";


class MoveController {
  /**
   * MoveController constructor
   *
   * @param {Worker} worker
   * @param {string} requestId
   * @param {ApiClientOptions} clientOptions
   */
  constructor(worker, requestId, clientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.clientOptions = clientOptions;
  }

  /**
   * Move content.
   * @param moveDto {
   *   resources: {array} The resources ids to move
   *   folders: {array} The folders ids to move
   *   folderParentId: {(string|null)} The destination folder
   * }
   */
  async main(moveDto) {
    if (!moveDto) {
      throw new TypeError('Move controller parameters cannot be empty');
    }

    const folderParentId = moveDto.folderParentId ? moveDto.folderParentId : null;
    const foldersIds = moveDto.folders ? moveDto.folders : [];
    const resourcesIds = moveDto.resources ? moveDto.resources : [];

    // TODO
    if (resourcesIds.length && foldersIds.length) {
      throw new TypeError('Multi resource and folder move is not supported.');
    }
    if (foldersIds.length > 1) {
      throw new TypeError('Multi folder move is not supported.');
    }

    // Move multiple resources at once
    if (resourcesIds.length) {
      const controller = new MoveResourcesController(this.worker, this.requestId, this.clientOptions);
      await controller.main(resourcesIds, folderParentId);
    }

    // Move one folder
    if (foldersIds.length) {
      const controller = new MoveFolderController(this.worker, this.requestId, this.clientOptions);
      await controller.main(foldersIds[0], folderParentId);
    }
  }
}

export default MoveController;
