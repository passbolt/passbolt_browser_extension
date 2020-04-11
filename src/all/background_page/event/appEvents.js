/**
 * App events.
 *
 * Used to handle the events related to main application page.
 *
 * @copyright (c) 2017 Passbolt SARL, 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const __ = require('../sdk/l10n').get;
const {Crypto} = require('../model/crypto');
const {InvalidMasterPasswordError} = require('../error/invalidMasterPasswordError');
const {Keyring} = require('../model/keyring');
const passphraseController = require('../controller/passphrase/passphraseController');
const progressController = require('../controller/progress/progressController');
const {ResourceExportController} = require('../controller/resource/resourceExportController');
const {User} = require('../model/user');
const {Secret} = require('../model/secret');
const {FolderModel} = require('../model/folderModel');
const {TabStorage} = require('../model/tabStorage');
const {UserAbortsOperationError} = require('../error/userAbortsOperationError');
const Worker = require('../model/worker');

const listen = function (worker) {

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
   * Encrypt the currently edited secret for all given users. Send the armored
   * secrets in the response to the requester. If the secret hasn't been
   * decrypted send an empty array.
   *
   * @listens passbolt.secret-edit.encrypt
   * @param requestId {uuid} The request identifier
   * @param usersIds {array} The users to encrypt the edited secret for
   * @deprecated since v2.12.0 will be removed with v2.3.0
   */
  worker.port.on('passbolt.secret-edit.encrypt', function (requestId, usersIds) {
    var editedPassword = TabStorage.get(worker.tab.id, 'editedPassword'),
      keyring = new Keyring(),
      crypto = new Crypto(),
      armoreds = {};

    // If the currently edited secret hasn't been decrypted, leave.
    if (editedPassword.secret == null) {
      worker.port.emit(requestId, 'SUCCESS', armoreds);
      return;
    }

    // Open the progress dialog.
    progressController.start(worker, 'Encrypting ...', usersIds.length);

    // Sync the keyring with the server.
    keyring.sync()

      // Once the keyring is synced, encrypt the secret for each user.
      .then(function () {
        var progress = 0;

        // Prepare the data for encryption.
        var encryptAllData = usersIds.map(function(userId) {
          return {
            userId: userId,
            message: editedPassword.secret
          }
        });

        // Encrypt all the messages.
        return crypto.encryptAll(encryptAllData, function () {
          progressController.update(worker, progress++);
        }, function (position) {
          progressController.update(worker, progress, 'Encrypting ' + position + '/' + usersIds.length);
        });
      })

      // Once the secret is encrypted for all users notify the application and
      // close the progress dialog.
      .then(function (data) {
        for (var i in data) {
          armoreds[usersIds[i]] = data[i];
        }
        worker.port.emit(requestId, 'SUCCESS', armoreds);
        progressController.complete(worker);
      });
  });

  /*
   * Decrypt a given armored string
   *
   * @listens passbolt.app.decrypt
   * @param requestId {uuid} The request identifier
   * @param armored {string} The armored secret
   * @deprecated since v2.7 will be removed in v3.0
   */
  worker.port.on('passbolt.app.decrypt-copy', function (requestId, armored) {
    var crypto = new Crypto();

    // Master password required to decrypt a secret.
    passphraseController.get(worker)
      .then(async function (masterPassword) {
        await progressController.start(worker, 'Decrypting...');
        return crypto.decrypt(armored, masterPassword)
      })
      .then(function (decrypted) {
        var clipboardWorker = Worker.get('ClipboardIframe', worker.tab.id);
        clipboardWorker.port.emit('passbolt.clipboard-iframe.copy', decrypted);
        progressController.complete(worker);
        worker.port.emit(requestId, 'SUCCESS', decrypted);
      })
      .catch(function (error) {
        progressController.complete(worker);
        worker.port.emit(requestId, 'ERROR', error.message);
      });
  });

  /*
   * Decrypt a given armored string
   *
   * @listens passbolt.app.decrypt-and-copy-to-clipboard-resource-secret
   * @param requestId {uuid} The request identifier
   * @param resourceId {string} The resource identifier
   */
  worker.port.on('passbolt.app.decrypt-secret-and-copy-to-clipboard', async function (requestId, resourceId) {
    var crypto = new Crypto();

    try {
      if (!Validator.isUUID(resourceId)) {
        throw new Error(__('The resource id should be a valid UUID'))
      }
      const secretPromise = Secret.findByResourceId(resourceId);
      const masterPassword = await passphraseController.get(worker);
      await progressController.start(worker, 'Decrypting...');
      const secret = await secretPromise;
      const message = await crypto.decrypt(secret.data, masterPassword);
      const clipboardWorker = Worker.get('ClipboardIframe', worker.tab.id);
      clipboardWorker.port.emit('passbolt.clipboard-iframe.copy', message);
      worker.port.emit(requestId, 'SUCCESS', message);
    } catch (error) {
      if (error instanceof InvalidMasterPasswordError || error instanceof UserAbortsOperationError) {
        // The copy operation has been aborted.
      } else if (error instanceof Error) {
        worker.port.emit(requestId, 'ERROR', worker.port.getEmitableError(error));
      } else {
        worker.port.emit(requestId, 'ERROR', error);
      }
    } finally {
      progressController.complete(worker);
    }
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
      Worker.get('ReactApp', worker.tab.id).port.request('passbolt.react-app.is-ready');
      worker.port.emit(requestId, 'SUCCESS');
    } catch(error) {
      worker.port.emit(requestId, 'ERROR');
    }
  });

  //
  // RESOURCES App Events
  //

  /*
   * Open the resource create dialog.
   *
   * @listens passbolt.resources.open-create-dialog
   * @param folderParentId {string} The folder parent id
   */
  worker.port.on('passbolt.app.resources.open-create-dialog', async function (folderParentId) {
    const reactAppWorker = Worker.get('ReactApp', worker.tab.id);
    reactAppWorker.port.emit('passbolt.resources.open-create-dialog', folderParentId);
  });

  /*
   * Open the resource edit dialog.
   *
   * @listens passbolt.resources.open-edit-dialog
   */
  worker.port.on('passbolt.app.resources.open-edit-dialog', function (id) {
    const reactAppWorker = Worker.get('ReactApp', worker.tab.id);
    reactAppWorker.port.emit('passbolt.resources.open-edit-dialog', id);
  });

  // SHARE App Events
  /*
  * Initialize the password sharing process.
  *
  * @listens passbolt.app.share.open-share-dialog
  * @param requestId {uuid} The request identifier
  * @param sharedPassword {array} The password to share
  */
  worker.port.on('passbolt.app.share.open-share-dialog', function (requestId, resourcesIds) {
    // Store some variables in the tab storage in order to make it accessible by other workers.
    TabStorage.set(worker.tab.id, 'shareResourcesIds', resourcesIds);
    const reactAppWorker = Worker.get('ReactApp', worker.tab.id);
    reactAppWorker.port.emit('passbolt.share.open-share-dialog', resourcesIds);
    worker.port.emit(requestId, 'SUCCESS');
  });

  //
  // FOLDER App Events
  //

  /*
   * Pull the resources from the API and update the local storage.
   *
   * @listens passbolt.app.folders.update-local-storage
   * @param requestId {uuid} The request identifier
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
   * @param folderParentId {string} The folder parent id
   */
  worker.port.on('passbolt.app.folders.open-create-dialog', async function (folderParentId) {
    const reactAppWorker = Worker.get('ReactApp', worker.tab.id);
    reactAppWorker.port.emit('passbolt.folders.open-create-dialog', folderParentId);
  });

  /*
   * Open the folder rename dialog.
   *
   * @listens passbolt.folders.open-create-dialog
   * @param requestId {uuid} The request identifier
   * @param folder {object} The folder meta data
   * @param password {string} The password to encrypt
   */
  worker.port.on('passbolt.app.folders.open-rename-dialog', async function (folderId) {
    const reactAppWorker = Worker.get('ReactApp', worker.tab.id);
    reactAppWorker.port.emit('passbolt.folders.open-rename-dialog', folderId);
  });

  /*
   * Open the folder delete dialog.
   *
   * @listens passbolt.folders.open-create-dialog
   * @param requestId {uuid} The request identifier
   * @param folder {object} The folder meta data
   * @param password {string} The password to encrypt
   */
  worker.port.on('passbolt.app.folders.open-delete-dialog', async function (folderId) {
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
  worker.port.on('passbolt.app.folders.open-move-dialog', async function (folderId) {
    const reactAppWorker = Worker.get('ReactApp', worker.tab.id);
    reactAppWorker.port.emit('passbolt.folders.open-move-dialog', folderId);
  });

};

exports.listen = listen;
