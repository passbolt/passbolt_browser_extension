/**
 * App events.
 *
 * Used to handle the events related to main application page.
 *
 * @copyright (c) 2017 Passbolt SARL, 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const __ = require('../sdk/l10n').get;
var Crypto = require('../model/crypto').Crypto;
const InvalidMasterPasswordError = require('../error/invalidMasterPasswordError').InvalidMasterPasswordError;
var Keyring = require('../model/keyring').Keyring;
var masterPasswordController = require('../controller/masterPasswordController');
var progressDialogController = require('../controller/progressDialogController');
const ResourceExportController = require('../controller/resource/resourceExportController').ResourceExportController;
var Secret = require('../model/secret').Secret;
var secret = new Secret();
var TabStorage = require('../model/tabStorage').TabStorage;
const UserAbortsOperationError = require('../error/userAbortsOperationError').UserAbortsOperationError;
var Worker = require('../model/worker');

var listen = function (worker) {

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
    progressDialogController.open(worker, 'Encrypting ...', usersIds.length);

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
          progressDialogController.update(worker, progress++);
        }, function (position) {
          progressDialogController.update(worker, progress, 'Encrypting ' + position + '/' + usersIds.length);
        });
      })

      // Once the secret is encrypted for all users notify the application and
      // close the progress dialog.
      .then(function (data) {
        for (var i in data) {
          armoreds[usersIds[i]] = data[i];
        }
        worker.port.emit(requestId, 'SUCCESS', armoreds);
        progressDialogController.close(worker);
      });
  });

  /*
   * Initialize the password sharing process.
   *
   * @listens passbolt.app.share-password-init
   * @param requestId {uuid} The request identifier
   * @param sharedPassword {array} The password to share
   */
  worker.port.on('passbolt.app.share-init', function (requestId, resourcesIds) {
    // Store some variables in the tab storage in order to make it accessible by other workers.
    TabStorage.set(worker.tab.id, 'shareResourcesIds', resourcesIds);
    worker.port.emit(requestId, 'SUCCESS');
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
    masterPasswordController.get(worker)
      .then(function (masterPassword) {
        worker.port.emit('passbolt.progress.open-dialog', 'Decrypting...');
        return crypto.decrypt(armored, masterPassword)
      })
      .then(function (decrypted) {
        var clipboardWorker = Worker.get('ClipboardIframe', worker.tab.id);
        clipboardWorker.port.emit('passbolt.clipboard-iframe.copy', decrypted);
        worker.port.emit('passbolt.progress.close-dialog');
        worker.port.emit(requestId, 'SUCCESS', decrypted);
      })
      .catch(function (error) {
        worker.port.emit('passbolt.progress.close-dialog');
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
      const masterPassword = await masterPasswordController.get(worker);
      await progressDialogController.open(worker, 'Decrypting...');
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
      progressDialogController.close(worker);
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

  // Notify the content code about the background page ready.
  let readyEventSent = false;
  async function isReady() {
    // The ready event has already been sent.
    if (!worker || readyEventSent) {
      return;
    }

    const requestResult = worker.port.request('passbolt.app.worker.ready');

    // In the case the content code events listener are not yet bound, plan to request the
    // content again.
    setTimeout(() => {
      isReady();
    }, 50);

    // Once the promise completed then we consider the event has been received by the content code.
    await requestResult;
    readyEventSent = true;
  };
  isReady();
};

exports.listen = listen;
