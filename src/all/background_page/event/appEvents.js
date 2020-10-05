/**
 * App events.
 * Used to handle the events coming and going to the APPJS
 * e.g. the JS application served by the server
 *
 * @copyright (c) 2020 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const __ = require('../sdk/l10n').get;

// Controllers
const passphraseController = require('../controller/passphrase/passphraseController');
const progressController = require('../controller/progress/progressController');

const {SecretDecryptController} = require('../controller/secret/secretDecryptController');
const {ResourceExportController} = require('../controller/resource/resourceExportController');
const {MoveController} = require('../controller/move/moveController');

const Worker = require('../model/worker');
const {Crypto} = require('../model/crypto');
const {User} = require('../model/user');
const {ResourceTypeModel} = require('../model/resourceType/resourceTypeModel');
const {FolderModel} = require('../model/folder/folderModel');
const {UserModel} = require('../model/user/userModel');
const {GroupModel} = require('../model/group/groupModel');

const {InvalidMasterPasswordError} = require('../error/invalidMasterPasswordError');
const {UserAbortsOperationError} = require('../error/userAbortsOperationError');

const listen = function (worker) {
  /* ==================================================================================
   * Window App Events
   * ================================================================================== */
  /*
   * Broadcast the window resize event to all workers.
   *
   * @listens passbolt.app.window-resized
   * @param cssClasses {array} When the window is resized the application
   *  updates the css classes applied to its html tag, these classes are given
   *  as parameter.
   */
  worker.port.on('passbolt.app.window-resized', function (cssClasses) {
    var workersIds = Worker.getAllKeys(worker.tab.id);
    for (var i in workersIds) {
      Worker.get(workersIds[i], worker.tab.id).port.emit('passbolt.app.window-resized', cssClasses);
    }
  });

  /* ==================================================================================
   * Secret App Events
   * ================================================================================== */
  /*
   * Decrypt a given armored string
   *
   * @listens passbolt.app.decrypt-and-copy-to-clipboard-resource-secret
   * @param {uuid} requestId The request identifier
   * @param {string} resourceId The resource identifier
   * @param {string} fieldToCopy The secret field to copy
   */
  worker.port.on('passbolt.app.decrypt-secret-and-copy-to-clipboard', async function (requestId, resourceId, fieldToCopy) {
    try {
      const apiClientOptions = await User.getInstance().getApiClientOptions();
      const controller = new SecretDecryptController(worker, requestId, apiClientOptions);
      const {plaintext} = await controller.main(resourceId);
      let textToCopy;

      // Define what to copy
      fieldToCopy = fieldToCopy || 'password';
      if (typeof plaintext === 'string') {
        textToCopy = plaintext;
      } else {
        if (plaintext.props.hasOwnProperty(fieldToCopy)) {
          textToCopy = plaintext.props[fieldToCopy];
        } else {
          throw new Error(__('Missing property '));
        }
      }

      // Copy and success
      const clipboardWorker = Worker.get('ClipboardIframe', worker.tab.id);
      clipboardWorker.port.emit('passbolt.clipboard-iframe.copy', textToCopy);
      worker.port.emit(requestId, 'SUCCESS', true);

    } catch (error) {
      if (error instanceof InvalidMasterPasswordError || error instanceof UserAbortsOperationError) {
        // The copy operation has been aborted, do nothing
      } else if (error instanceof Error) {
        worker.port.emit(requestId, 'ERROR', worker.port.getEmitableError(error));
      } else {
        worker.port.emit(requestId, 'ERROR', error);
      }
    }
  });

  /* ==================================================================================
   * Bootstrap App Events
   * ================================================================================== */
  /*
   * Is the background page ready.
   *
   * @listens passbolt.app.is-ready
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.app.is-ready', async function (requestId) {
    worker.port.emit(requestId, 'SUCCESS');
  });

  /*
   * Is the react app ready.
   *
   * @listens passbolt.app.react-app.is-ready
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.app.react-app.is-ready', async function (requestId) {
    try {
      const reactWorker = Worker.get('ReactApp', worker.tab.id, false);
      await reactWorker.port.request('passbolt.react-app.is-ready');
      worker.port.emit(requestId, 'SUCCESS');
    } catch(error) {
      worker.port.emit(requestId, 'ERROR');
    }
  });

  /*
   * Whe the appjs is ready
   *
   * @listens assbolt.app.after-appjs-ready
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.app.after-appjs-ready', async function (requestId) {
    // Sync user settings
    const user = User.getInstance();
    try {
      await user.settings.sync()
    } catch (error) {
      // fail silently for CE users
      user.settings.setDefaults();
    }

    try {
      const apiOptions = await user.getApiClientOptions();
      const userModel = new UserModel(apiOptions);
      await userModel.updateLocalStorage();
      const groupModel = new GroupModel(apiOptions);
      await groupModel.updateLocalStorage();
    } catch(error) {
      console.error(error);
      throw error;
    }

    // Sync
    try {
      const resourceTypeModel = new ResourceTypeModel(await user.getApiClientOptions());
      await resourceTypeModel.updateLocalStorage();
    } catch (error) {
      // fail silently for prior version users
    }

    worker.port.emit(requestId, 'SUCCESS');
  });

  /* ==================================================================================
   * RESOURCES App Events
   * ================================================================================== */
  /*
   * Open the resource create dialog.
   *
   * @listens passbolt.resources.open-create-dialog
   * @param {string|null} folderParentId The folder parent id (optional)
   */
  worker.port.on('passbolt.app.resources.open-create-dialog', async function (folderParentId) {
    const reactAppWorker = Worker.get('ReactApp', worker.tab.id);
    reactAppWorker.port.emit('passbolt.resources.open-create-dialog', folderParentId);
  });

  /*
   * Open the resource edit dialog.
   *
   * @listens passbolt.resources.open-edit-dialog
   * @param {string} resourceId the resource to edit
   */
  worker.port.on('passbolt.app.resources.open-edit-dialog', function (resourceId) {
    const reactAppWorker = Worker.get('ReactApp', worker.tab.id);
    reactAppWorker.port.emit('passbolt.resources.open-edit-dialog', resourceId);
  });

  /*
   * Initialize the export passwords process.
   *
   * @listens passbolt.app.export-resources
   * @param requestId {uuid} The request identifier
   * @param resourcesIds {array} The list of resources ids to export
   */
  worker.port.on('passbolt.app.export-resources', async function (requestId, resourcesIds) {
    try {
      await ResourceExportController.exec(worker, resourcesIds);
      worker.port.emit(requestId, 'SUCCESS');
    } catch (error) {
      worker.port.emit(requestId, 'ERROR', worker.port.getEmitableError(error));
    }
  });

  /* ==================================================================================
   * SHARE App Events
   * ================================================================================== */
  /*
   * Initialize the password sharing process.
   *
   * @listens passbolt.app.share.open-share-dialog
   * @param {string} requestId The request identifier
   * @param {object} itemsToShare
   * - {array} resourcesIds The uuids of the resources to share
   * - {array} foldersIds The uuids of the folders to share
   */
  worker.port.on('passbolt.app.share.open-share-dialog', function (requestId, itemsToShare) {
    // Store some variables in the tab storage in order to make it accessible by other workers.
    const reactAppWorker = Worker.get('ReactApp', worker.tab.id);
    reactAppWorker.port.emit('passbolt.share.open-share-dialog', itemsToShare);
    worker.port.emit(requestId, 'SUCCESS');
  });

  /* ==================================================================================
   * FOLDER App Events
   * ================================================================================== */
  /*
   * Pull the resources from the API and update the local storage.
   *
   * @listens passbolt.app.folders.update-local-storage
   * @param {uuid} requestId The request identifier
   */
  worker.port.on('passbolt.app.folders.update-local-storage', async function (requestId) {
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
   * Open the folder create dialog.
   *
   * @listens passbolt.folders.open-create-dialog
   * @param {string|null} folderParentId The folder parent id (optional)
   */
  worker.port.on('passbolt.app.folders.open-create-dialog', async function (folderParentId) {
    const reactAppWorker = Worker.get('ReactApp', worker.tab.id);
    reactAppWorker.port.emit('passbolt.folders.open-create-dialog', folderParentId);
  });

  /*
   * Open the folder rename dialog.
   *
   * @listens passbolt.folders.open-rename-dialog
   * @param {string} folderId The folder id
   */
  worker.port.on('passbolt.app.folders.open-rename-dialog', async function (folderId) {
    const reactAppWorker = Worker.get('ReactApp', worker.tab.id);
    reactAppWorker.port.emit('passbolt.folders.open-rename-dialog', folderId);
  });

  /*
   * Open the folder delete dialog.
   *
   * @listens passbolt.folders.open-delete-dialog
   * @param {string} folderId The folder id
   */
  worker.port.on('passbolt.app.folders.open-delete-dialog', async function (folderId) {
    const reactAppWorker = Worker.get('ReactApp', worker.tab.id);
    reactAppWorker.port.emit('passbolt.folders.open-delete-dialog', folderId);
  });

  /*
   * Open the folder share dialog.
   *
   * @listens passbolt.folders.open-share-dialog
   * @param {string} folderId The folder id
   */
  worker.port.on('passbolt.app.folders.open-share-dialog', async function (folderId) {
    const reactAppWorker = Worker.get('ReactApp', worker.tab.id);
    reactAppWorker.port.emit('passbolt.folders.open-share-dialog', folderId);
  });

  /*
   * Open the folder move confirmation dialog.
   *
   * @listens passbolt.folders.open-move-confirmation-dialog
   * @param {object} moveDto {resources: array of uuids, folders: array of uuids, folderParentId: uuid}
   */
  worker.port.on('passbolt.app.folders.open-move-confirmation-dialog', async function (requestId, moveDto) {
    try {
      const clientOptions = await User.getInstance().getApiClientOptions();
      const controller = new MoveController(worker, requestId, clientOptions);
      await controller.main(moveDto);
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

  /* ==================================================================================
   * DEPRECATED App Events
   * ================================================================================== */
  /*
   * Decrypt a given armored string
   *
   * @listens passbolt.app.decrypt
   * @param requestId {uuid} The request identifier
   * @param armored {string} The armored secret
   * @deprecated since v2.7 will be removed in v3.0
   */
  worker.port.on('passbolt.app.deprecated.decrypt-copy', async function (requestId, armored) {
    const crypto = new Crypto();
    let privateKey;

    try {
      let passphrase = await passphraseController.get(this.worker);
      privateKey = await crypto.getAndDecryptPrivateKey(passphrase);
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', this.worker.port.getEmitableError(error));
    }

    try {
      await progressController.open(worker, 'Decrypting...', 1, 'Decrypting...');
      const decrypted = await crypto.decryptWithKey(armored, privateKey);
      const clipboardWorker = Worker.get('ClipboardIframe', worker.tab.id);
      clipboardWorker.port.emit('passbolt.clipboard-iframe.copy', decrypted);
      await progressController.close(worker);
      worker.port.emit(requestId, 'SUCCESS', decrypted);
    } catch(error) {
      await progressController.close(worker);
      worker.port.emit(requestId, 'ERROR', error.message);
    }
  });
};

exports.listen = listen;
