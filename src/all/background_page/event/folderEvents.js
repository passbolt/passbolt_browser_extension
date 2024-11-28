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

import FolderModel from "../model/folder/folderModel";
import FolderCreateController from "../controller/folder/folderCreateController";
import FolderEntity from "../model/entity/folder/folderEntity";
import FindAndUpdateResourcesLocalStorage from "../service/resource/findAndUpdateResourcesLocalStorageService";
import UpdateAllFolderLocalStorageController
  from "../controller/folderLocalStorage/updateAllFoldersLocalStorageController";
import FindFolderDetailsController from "../controller/folder/findFolderDetailsController";
import MoveFolderController from "../controller/move/moveFolderController";

/**
 * Listens to the folder events
 * @param {Worker} worker The worker
 * @param {ApiClientOptions} apiClientOptions The
 * api client options
 * @param {AccountEntity} account The account
 */
const listen = function(worker, apiClientOptions, account) {
  /*
   * Create a new folder
   *
   * @listens passbolt.folders.create
   * @param requestId {uuid} The request identifier
   * @param folder {array} The folder
   */
  worker.port.on('passbolt.folders.create', async(requestId, folderDto) => {
    try {
      const folderCreateController = new FolderCreateController(worker, requestId, apiClientOptions, account);
      const folderEntity = await folderCreateController.main(new FolderEntity(folderDto));
      worker.port.emit(requestId, 'SUCCESS', folderEntity);
    } catch (error) {
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * Update a folder
   *
   * @listens passbolt.folders.update
   * @param requestId {uuid} The request identifier
   * @param folder {array} The folder
   */
  worker.port.on('passbolt.folders.update', async(requestId, folderDto) => {
    try {
      const folderModel = new FolderModel(apiClientOptions, account);
      const folderEntity = await folderModel.update(new FolderEntity(folderDto));
      worker.port.emit(requestId, 'SUCCESS', folderEntity);
    } catch (error) {
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * delete a folder
   *
   * @listens passbolt.folders.delete
   * @param requestId {uuid} The request identifier
   * @param folder {array} The folder
   */
  worker.port.on('passbolt.folders.delete', async(requestId, folderId, cascade) => {
    try {
      const folderModel = new FolderModel(apiClientOptions, account);
      const findAndUpdateResourcesLocalStorage = new FindAndUpdateResourcesLocalStorage(account, apiClientOptions);

      await folderModel.delete(folderId, cascade);
      await findAndUpdateResourcesLocalStorage.findAndUpdateAll();

      worker.port.emit(requestId, 'SUCCESS', folderId);
    } catch (error) {
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * Pull the resources from the API and update the local storage.
   *
   * @listens passbolt.app.folders.update-local-storage
   * @param {uuid} requestId The request identifier
   */
  worker.port.on('passbolt.folders.update-local-storage', async requestId => {
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
  worker.port.on('passbolt.folders.find-details', async(requestId, folderId) => {
    const controller = new FindFolderDetailsController(worker, requestId, apiClientOptions);
    await controller._exec(folderId);
  });

  /*
   * Open the folder move confirmation dialog.
   *
   * @listens passbolt.folders.move-one-folder
   * @param {uuid} requestId The request identifier
   * @param {string} folderId The folder id to move
   * @param {string} destinationFolderId The destination folder id
   */
  worker.port.on('passbolt.folders.move-by-id', async(requestId, folderId, destinationFolderId) => {
    const controller = new MoveFolderController(worker, requestId, apiClientOptions, account);
    await controller.exec(folderId, destinationFolderId);
  });
};

export const FolderEvents = {listen};
