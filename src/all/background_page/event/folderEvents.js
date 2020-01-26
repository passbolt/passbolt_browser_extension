/**
 * Folder events
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const {FolderEntity} = require('../model/entity/folder/folderEntity');
const {FolderModel} = require('../model/folderModel');
const {User} = require('../model/user');
const {CsrfToken} = require('../utils/csrfToken/csrfToken');
const Worker = require('../model/worker');

const listen = function (worker) {

  // ================================
  // DIALOG ACTIONS
  // ================================

  /*
   * Open the folder create dialog.
   *
   * @listens passbolt.folders.open-create-dialog
   * @param requestId {uuid} The request identifier
   * @param folder {object} The folder meta data
   * @param password {string} The password to encrypt
   */
  worker.port.on('passbolt.folders.open-create-dialog', async function () {
    const reactAppWorker = Worker.get('ReactApp', worker.tab.id);
    reactAppWorker.port.emit('passbolt.folders.open-create-dialog');
  });

  /*
   * Open the folder rename dialog.
   *
   * @listens passbolt.folders.open-create-dialog
   * @param requestId {uuid} The request identifier
   * @param folder {object} The folder meta data
   * @param password {string} The password to encrypt
   */
  worker.port.on('passbolt.folders.open-rename-dialog', async function (folderId) {
    const reactAppWorker = Worker.get('ReactApp', worker.tab.id);
    reactAppWorker.port.emit('passbolt.folders.open-rename-dialog', folderId);
    // try {
    //   let folderModel = new FolderModel(await User.getInstance().getApiClientOptions());
    //   const folder = await folderModel.findOne(folderId);
    // } catch (error) {
    //   console.error(error);
    //   const title = 'Folder not found!';
    //   const message = 'This folder may have been deleted or you do not have the permission to view its content.';
    //   reactAppWorker.port.emit('passbolt.errors.open-error-dialog', title, message);
    //   folderModel.updateLocalStorage();
    // }
  });

  /*
   * Open the folder delete dialog.
   *
   * @listens passbolt.folders.open-create-dialog
   * @param requestId {uuid} The request identifier
   * @param folder {object} The folder meta data
   * @param password {string} The password to encrypt
   */
  worker.port.on('passbolt.folders.open-delete-dialog', async function (folderId) {
    const reactAppWorker = Worker.get('ReactApp', worker.tab.id);
    reactAppWorker.port.emit('passbolt.folders.open-delete-dialog', folderId);
  });

  /*
   * Open the folder move dialog.
   *
   * @listens passbolt.folders.open-create-dialog
   * @param requestId {uuid} The request identifier
   * @param folder {object} The folder meta data
   * @param password {string} The password to encrypt
   */
  worker.port.on('passbolt.folders.open-move-dialog', async function (folderId) {
    const reactAppWorker = Worker.get('ReactApp', worker.tab.id);
    reactAppWorker.port.emit('passbolt.folders.open-move-dialog', folderId);
  });

  // ================================
  // SERVICE ACTIONS
  // ================================

  /*
   * Pull the resources from the API and update the local storage.
   *
   * @listens passbolt.folders.update-local-storage
   * @param requestId {uuid} The request identifier
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
   * Create a new folder
   *
   * @listens passbolt.folders.create
   * @param requestId {uuid} The request identifier
   * @param folder {array} The folder
   */
  worker.port.on('passbolt.folders.create', async function (requestId, folderDto) {
    try {
      let folderModel = new FolderModel(await User.getInstance().getApiClientOptions());
      let folderEntity = await folderModel.create(new FolderEntity(folderDto));
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
      let folderModel = new FolderModel(await User.getInstance().getApiClientOptions());
      let folderEntity = await folderModel.update(new FolderEntity(folderDto));
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
  worker.port.on('passbolt.folders.delete', async function (requestId, folderId) {
    try {
      let folderModel = new FolderModel(await User.getInstance().getApiClientOptions());
      await folderModel.delete(folderId);
      worker.port.emit(requestId, 'SUCCESS', folderId);
    } catch (error) {
      worker.port.emit(requestId, 'ERROR', worker.port.getEmitableError(error));
    }
  });

};

exports.listen = listen;
