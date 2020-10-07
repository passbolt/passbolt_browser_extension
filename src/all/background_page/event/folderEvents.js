/**
 * Folder events
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const {FolderCreateController} = require('../controller/folder/folderCreateController');
const {FolderEntity} = require('../model/entity/folder/folderEntity');
const {FolderModel} = require('../model/folder/folderModel');
const {ResourceModel} = require('../model/resource/resourceModel');
const {User} = require('../model/user');
const {MoveController} = require('../controller/move/moveController');

const listen = function (worker) {

  /*
   * Find a folder with complete permissions
   *
   * @listens passbolt.resources.find-for-permissions
   * @param requestId {uuid} The request identifier
   * @param folderId {uuid} the folder uuid
   */
  worker.port.on('passbolt.folders.find-permissions', async function (requestId, folderId) {
    try {
      const clientOptions = await User.getInstance().getApiClientOptions();
      const folderModel = new FolderModel(clientOptions);
      const permissions = await folderModel.findFolderPermissions(folderId);
      worker.port.emit(requestId, 'SUCCESS', permissions);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        worker.port.emit(requestId, 'ERROR', worker.port.getEmitableError(error));
      } else {
        worker.port.emit(requestId, 'ERROR', error);
      }
    }
  });

  /*
   * Create a new folder
   *
   * @listens passbolt.folders.create
   * @param requestId {uuid} The request identifier
   * @param folder {array} The folder
   */
  worker.port.on('passbolt.folders.create', async function (requestId, folderDto) {
    try {
      const clientOptions = await User.getInstance().getApiClientOptions();
      const folderCreateController = new FolderCreateController(worker, requestId, clientOptions);
      const folderEntity = await folderCreateController.main(new FolderEntity(folderDto));
      worker.port.emit(requestId, 'SUCCESS', folderEntity);
    } catch (error) {
      worker.port.emit(requestId, 'ERROR', worker.port.getEmitableError(error));
    }
  });

  /*
   * Update a folder
   *
   * @listens passbolt.folders.update
   * @param requestId {uuid} The request identifier
   * @param folder {array} The folder
   */
  worker.port.on('passbolt.folders.update', async function (requestId, folderDto) {
    try {
      const folderModel = new FolderModel(await User.getInstance().getApiClientOptions());
      const folderEntity = await folderModel.update(new FolderEntity(folderDto));
      worker.port.emit(requestId, 'SUCCESS', folderEntity);
    } catch (error) {
      worker.port.emit(requestId, 'ERROR', worker.port.getEmitableError(error));
    }
  });

  /*
   * delete a folder
   *
   * @listens passbolt.folders.delete
   * @param requestId {uuid} The request identifier
   * @param folder {array} The folder
   */
  worker.port.on('passbolt.folders.delete', async function (requestId, folderId, cascade) {
    try {
      const apiClientOptions = await User.getInstance().getApiClientOptions();
      const folderModel = new FolderModel(apiClientOptions);
      const resourceModel = new ResourceModel(apiClientOptions);

      await folderModel.delete(folderId, cascade);
      await resourceModel.updateLocalStorage();

      worker.port.emit(requestId, 'SUCCESS', folderId);
    } catch (error) {
      worker.port.emit(requestId, 'ERROR', worker.port.getEmitableError(error));
    }
  });

  /*
   * Pull the resources from the API and update the local storage.
   *
   * @listens passbolt.app.folders.update-local-storage
   * @param {uuid} requestId The request identifier
   */
  worker.port.on('passbolt.folders.update-local-storage', async function (requestId) {
    try {
      let folderModel = new FolderModel(await User.getInstance().getApiClientOptions());
      await folderModel.updateLocalStorage();
      worker.port.emit(requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        worker.port.emit(requestId, 'ERROR', worker.port.getEmitableError(error));
      } else {
        worker.port.emit(requestId, 'ERROR', error);
      }
    }
  });

  /*
   * Open the folder move confirmation dialog.
   *
   * @listens passbolt.folders.open-move-confirmation-dialog
   * @param {object} moveDto {resources: array of uuids, folders: array of uuids, folderParentId: uuid}
   */
  worker.port.on('passbolt.folders.open-move-confirmation-dialog', async function (requestId, moveDto) {
    try {
      const clientOptions = await User.getInstance().getApiClientOptions();
      const controller = new MoveController(worker, requestId, clientOptions);
      await controller.main(moveDto);
      worker.port.emit(requestId, 'SUCCESS');
    } catch (error) {
      if (error instanceof Error) {
        worker.port.emit(requestId, 'ERROR', worker.port.getEmitableError(error));
      } else {
        worker.port.emit(requestId, 'ERROR', error);
      }
    }
  });
};

exports.listen = listen;
