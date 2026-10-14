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
 * @since         1.0.0
 */

import FolderCreateController from "../controller/folder/folderCreateController";
import UpdateFolderController from "../controller/folder/updateFolderController";
import DeleteFolderController from "../controller/folder/deleteFolderController";
import FolderEntity from "../model/entity/folder/folderEntity";
import UpdateAllFolderLocalStorageController from "../controller/folderLocalStorage/updateAllFoldersLocalStorageController";
import FindFolderDetailsController from "../controller/folder/findFolderDetailsController";
import MoveFolderController from "../controller/move/moveFolderController";

/**
 * Listens to the folder events
 * @param {Worker} worker The worker
 * @param {ApiClientOptions} apiClientOptions The
 * api client options
 * @param {AccountEntity} account The account
 */
const listen = function (worker, apiClientOptions, account) {
  /*
   * Create a new folder
   *
   * @listens passbolt.folders.create
   * @param requestId {uuid} The request identifier
   * @param folder {array} The folder
   */
  worker.port.on("passbolt.folders.create", async (requestId, folderDto) => {
    try {
      const folderCreateController = new FolderCreateController(worker, requestId, apiClientOptions, account);
      const folderEntity = await folderCreateController.main(new FolderEntity(folderDto));
      worker.port.emit(requestId, "SUCCESS", folderEntity);
    } catch (error) {
      worker.port.emit(requestId, "ERROR", error);
    }
  });

  /*
   * Update a folder
   *
   * @listens passbolt.folders.update
   * @param requestId {uuid} The request identifier
   * @param folder {array} The folder
   */
  worker.port.on("passbolt.folders.update", async (requestId, folderDto) => {
    const controller = new UpdateFolderController(worker, requestId, apiClientOptions);
    await controller._exec(folderDto);
  });

  /*
   * delete a folder
   *
   * @listens passbolt.folders.delete
   * @param requestId {uuid} The request identifier
   * @param folder {array} The folder
   */
  worker.port.on("passbolt.folders.delete", async (requestId, folderId, cascade) => {
    const controller = new DeleteFolderController(worker, requestId, apiClientOptions, account);
    await controller._exec(folderId, cascade);
  });

  /*
   * Pull the resources from the API and update the local storage.
   *
   * @listens passbolt.app.folders.update-local-storage
   * @param {uuid} requestId The request identifier
   */
  worker.port.on("passbolt.folders.update-local-storage", async (requestId) => {
    const controller = new UpdateAllFolderLocalStorageController(worker, requestId, apiClientOptions, account);
    await controller._exec();
  });

  /**
   * Find a folder with its details given an id
   *
   * @listens passbolt.folders.find-details
   * @param requestId {uuid} The request identifier
   * @param folderId {uuid} The folder id
   */
  worker.port.on("passbolt.folders.find-details", async (requestId, folderId) => {
    const controller = new FindFolderDetailsController(worker, requestId, apiClientOptions);
    await controller._exec(folderId);
  });

  /*
   * Move a folder, and apply the permissions the operator confirmed when there are any.
   *
   * @listens passbolt.folders.move-by-id
   * @param {uuid} requestId The request identifier
   * @param {string} folderId The folder id to move
   * @param {string} destinationFolderId The destination folder id
   * @param {Object<string, Array<object>>|null} permissionsDto The permissions the operator confirmed, keyed by item id. Null to keep the permissions as they are.
   */
  worker.port.on("passbolt.folders.move-by-id", async (requestId, folderId, destinationFolderId, permissionsDto) => {
    const controller = new MoveFolderController(worker, requestId, apiClientOptions, account);
    await controller._exec(folderId, destinationFolderId, permissionsDto);
  });
};

export const FolderEvents = { listen };
