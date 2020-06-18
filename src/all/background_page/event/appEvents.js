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
const {ResourceExportController} = require('../controller/resource/resourceExportController');
const {MoveController} = require('../controller/move/moveController');

const Worker = require('../model/worker');
const {Crypto} = require('../model/crypto');
const {Keyring} = require('../model/keyring');
const {User} = require('../model/user');
const {Secret} = require('../model/secret');
const {FolderModel} = require('../model/folder/folderModel');
const {TabStorage} = require('../model/tabStorage');

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
   * Give the focus to the secret-edit iframe.
   *
   * @listens passbolt.secret-edit.focus
   */
  worker.port.on('passbolt.secret-edit.focus', function () {
    Worker.get('Secret', worker.tab.id).port.emit('passbolt.secret-edit.focus');
  });

  /* Validate the edited secret.
   *
   * @listens passbolt.secret-edit.validate
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.secret-edit.validate', function (requestId) {
    var editedPassword = TabStorage.get(worker.tab.id, 'editedPassword');

    try {
      // If the secret is decrypted validate it, otherwise it is
      // considered as valid.
      if (editedPassword.secret != null) {
        const secret = new Secret();
        secret.validate({data: editedPassword.secret});
      }
      Worker.get('Secret', worker.tab.id).port.emit('passbolt.secret-edit.validate-success');
      worker.port.emit(requestId, 'SUCCESS');
    } catch (e) {
      Worker.get('Secret', worker.tab.id).port.emit('passbolt.secret-edit.validate-error', e.message, e.validationErrors);
      worker.port.emit(requestId, 'ERROR', worker.port.getEmitableError(e));
    }
  });

  /*
   * Decrypt a given armored string
   *
   * @listens passbolt.app.decrypt-and-copy-to-clipboard-resource-secret
   * @param {uuid} requestId The request identifier
   * @param {string} resourceId The resource identifier
   */
  worker.port.on('passbolt.app.decrypt-secret-and-copy-to-clipboard', async function (requestId, resourceId) {
    const crypto = new Crypto();
    let privateKey;

    try {
      if (!Validator.isUUID(resourceId)) {
        throw new Error(__('The resource id should be a valid UUID'))
      }
      // Start fetching secret
      const secretPromise = Secret.findByResourceId(resourceId);

      // Ask for passphrase if needed
      let passphrase = await passphraseController.get(worker);
      privateKey = await crypto.getAndDecryptPrivateKey(passphrase);

      // Finish fetching if needed and decrypt
      await progressController.open(worker, 'Decrypting...');
      const secret = await secretPromise;
      const message = await crypto.decryptWithKey(secret.data, privateKey);

      // Copy and success
      const clipboardWorker = Worker.get('ClipboardIframe', worker.tab.id);
      clipboardWorker.port.emit('passbolt.clipboard-iframe.copy', message);
      worker.port.emit(requestId, 'SUCCESS', message);

    } catch (error) {
      if (error instanceof InvalidMasterPasswordError || error instanceof UserAbortsOperationError) {
        // The copy operation has been aborted.
        // Do nothing
      } else if (error instanceof Error) {
        worker.port.emit(requestId, 'ERROR', worker.port.getEmitableError(error));
      } else {
        worker.port.emit(requestId, 'ERROR', error);
      }
    } finally {
      await progressController.close(worker);
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
      const reactWorker = Worker.get('ReactApp', worker.tab.id);
      reactWorker.port.request('passbolt.react-app.is-ready');
      worker.port.emit(requestId, 'SUCCESS');
    } catch(error) {
      worker.port.emit(requestId, 'ERROR');
    }
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
   * Encrypt the currently edited secret for all given users. Send the armored
   * secrets in the response to the requester. If the secret hasn't been
   * decrypted send an empty array.
   *
   * @listens passbolt.app.deprecated.secret-edit.encrypt
   * @param requestId {uuid} The request identifier
   * @param usersIds {array} The users to encrypt the edited secret for
   * @deprecated since v2.12.0 will be removed with v3.0
   */
  worker.port.on('passbolt.app.deprecated.secret-edit.encrypt', async function (requestId, usersIds) {
    const editedPassword = TabStorage.get(worker.tab.id, 'editedPassword');
    const keyring = new Keyring();
    const crypto = new Crypto();
    const armoreds = {};
    let privateKey;

    // If the currently edited secret hasn't been decrypted, leave.
    if (editedPassword.secret == null) {
      worker.port.emit(requestId, 'SUCCESS', armoreds);
      return;
    }

    // Get the passphrase if needed and decrypt secret key
    try {
      let passphrase = await passphraseController.get(this.worker);
      privateKey = await crypto.getAndDecryptPrivateKey(passphrase);
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', this.worker.port.getEmitableError(error));
    }

    // Open the progress dialog.
    await progressController.open(worker, 'Encrypting ...', usersIds.length, 'Please wait...');

    // Sync the keyring with the server.
    await keyring.sync();

    // Once the keyring is synced, encrypt the secret for each user.
    let progress = 0;

    // Prepare the data for encryption.
    let encryptAllData = usersIds.map((userId) => {
      return {
        userId: userId,
        message: editedPassword.secret
      }
    });

    // Encrypt all the messages.
    const data = await crypto.encryptAll(encryptAllData, privateKey, function () {
      progressController.update(worker, progress++);
    }, function (position) {
      progressController.update(worker, progress, 'Encrypting ' + position + '/' + usersIds.length);
    });

    // Once the secret is encrypted for all users notify the application and
    // close the progress dialog.
    for (let i in data) {
      if (data.hasOwnProperty(i)) {
        armoreds[usersIds[i]] = data[i];
      }
    }
    worker.port.emit(requestId, 'SUCCESS', armoreds);
    await progressController.close(worker);
  });

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

    // Get the passphrase if needed and decrypt secret key
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
