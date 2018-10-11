/**
 * App events.
 *
 * Used to handle the events related to main application page.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var masterPasswordController = require('../controller/masterPasswordController');
var progressDialogController = require('../controller/progressDialogController');
var app = require('../app');
var Worker = require('../model/worker');

var Keyring = require('../model/keyring').Keyring;
var Crypto = require('../model/crypto').Crypto;
var TabStorage = require('../model/tabStorage').TabStorage;
var Secret = require('../model/secret').Secret;
var secret = new Secret();
var User = require('../model/user').User;
var user = User.getInstance();

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
      worker.port.emit(requestId, 'ERROR', e.message, e.validationErrors);
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
   * Initialize the export passwords process.
   *
   * @listens passbolt.app.export-passwords-init
   * @param requestId {uuid} The request identifier
   * @param resources {array} The list of resources to export
   */
  worker.port.on('passbolt.app.export-passwords-init', function (requestId, resources) {
    // Store some variables in the tab storage in order to make it accessible by other workers.
    TabStorage.set(worker.tab.id, 'exportedResources', resources);
    worker.port.emit(requestId, 'SUCCESS');
  });
};

exports.listen = listen;
