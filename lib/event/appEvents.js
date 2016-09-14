/**
 * App events.
 *
 * Used to handle the events related to main application page.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var masterPasswordController = require('../controller/masterPasswordController');
var app = require('../main');
var __ = require("sdk/l10n").get;
var Worker = require('../model/worker');
const { Promise } = require('sdk/core/promise');
var Keyring = require('../model/keyring').Keyring;
var Crypto = require('../model/crypto').Crypto;
var TabStorage = require('../model/tabStorage').TabStorage;
var Secret = require('../model/secret').Secret;
var secret = new Secret();

var listen = function (worker) {

  // Broadcast the window resize event to all workers.
  //
  // @listens passbolt.html_helper.app_window_resized
  // @param cssClasses {array} When the window is resized the application
  //  updates the css classes applied to its html tag, these classes are given
  //  as parameter.
  //
  // @fires passbolt.html_helper.app_window_resized to all the workers
  worker.port.on('passbolt.html_helper.app_window_resized', function (cssClasses) {
    var workersIds = Worker.getAllKeys(worker.tab.id);
    for (var i in workersIds) {
      Worker.get(workersIds[i], worker.tab.id).port.emit('passbolt.html_helper.app_window_resized', cssClasses);
    }
  });

  // Validate the edited secret.
  //
  // @listens passbolt.secret-edit.validate
  // @param requestId {int} The request identifier
  //
  // @fires ~.SUCCESS if the secret is valid
  // @fires ~.ERROR if the secret is not valid
  // @property {string} message - The error message
  // @property {array} validationErrors - An array of errors
  worker.port.on('passbolt.secret-edit.validate', function (requestId) {
    var editedPassword = TabStorage.get(worker.tab.id, 'editedPassword');

    try {
      // If the secret is decrypted validate it, otherwise it is
      // considered as valid.
      if (editedPassword.secret != null) {
        secret.validate({data: editedPassword.secret});
      }
      Worker.get('Secret', worker.tab.id).port.emit('passbolt.secret-edit.validate-success');
      worker.port.emit('passbolt.secret-edit.validate.complete', requestId, 'SUCCESS');
    } catch (e) {
      Worker.get('Secret', worker.tab.id).port.emit('passbolt.secret-edit.validate-error', e.message, e.validationErrors);
      worker.port.emit('passbolt.secret-edit.validate.complete', requestId, 'ERROR', e.message, e.validationErrors);
    }
  });

  // Encrypt the currently edited secret for all given users. Send the armored
  // secrets in the response to the requester. If the secret hasn't been
  // decrypted send an empty array.
  //
  // @listens passbolt.secret-edit.encrypt
  // @param requestId {int} The request identifier
  // @param usersIds {array} The users to encrypt the edited secret for
  //
  // @fires ~.SUCCESS
  // @property {arrays} armoreds - The secret encrypted for all the users (key:userId, value: armored secret)
  worker.port.on('passbolt.secret-edit.encrypt', function (requestId, usersIds) {
    var editedPassword = TabStorage.get(worker.tab.id, 'editedPassword'),
      keyring = new Keyring(),
      crypto = new Crypto(),
      armoreds = {};

    // If the currently edited secret hasn't been decrypted, leave.
    if (editedPassword.secret == null) {
      worker.port.emit('passbolt.secret-edit.encrypt.complete', requestId, 'SUCCESS', armoreds);
      return;
    }

    // Open the progress dialog.
    worker.port.emit('passbolt.progress.open-dialog', 'Encrypting ...', usersIds.length);

    // Sync the keyring with the server.
    keyring.sync()

      // Once the keyring is synced, encrypt the secret for each user.
      .then(function () {
        // Store the encryption promise for each user in this array.
        // Encryptions will be treated in parallel to optimize the treatment.
        var promises = [],
          progress = 0,
          progressWorker = null;

        usersIds.forEach(function (userId) {
          var p = crypto.encrypt(editedPassword.secret, userId);
          promises.push(p);

          // Update the progress dialog.
          p.then(function () {
            progress++;
            progressWorker = Worker.get('Progress', worker.tab.id);
            if (progressWorker != null) {
              progressWorker.port.emit('passbolt.progress.update', 'Encrypted for ' + userId, progress);
            }
          });
        });

        return Promise.all(promises);
      })

      // Once the secret is encrypted for all users notify the application and
      // close the progress dialog.
      .then(function (data) {
        for (var i in data) {
          armoreds[usersIds[i]] = data[i];
        }
        worker.port.emit('passbolt.secret-edit.encrypt.complete', requestId, 'SUCCESS', armoreds);
        worker.port.emit('passbolt.progress.close-dialog');
      });
  });

  // Initialize the password sharing process.
  //
  // @listens passbolt.app.share-password-init
  // @param requestId {int} The request identifier
  // @param sharedPassword {array} The password to share
  //
  // @fires ~.SUCCESS
  worker.port.on('passbolt.app.share-password-init', function (requestId, sharedPassword) {
    // Store some variables in the tab storage in order to make it accessible by other workers.
    TabStorage.set(worker.tab.id, 'sharedPassword', sharedPassword);
    TabStorage.set(worker.tab.id, 'shareWith', []);
    worker.port.emit('passbolt.app.share-password-init.complete', requestId, 'SUCCESS');
  });

  // Encrypt the shared password for all the new users it has been shared with.
  //
  // @listens passbolt.share.encrypt
  // @param requestId {int} The request identifier
  //
  // @fires ~.SUCCESS
  // @property {arrays} armoreds - The secret encrypted for all the new users
  //  (key:userId, value: armored secret)
  worker.port.on('passbolt.share.encrypt', function (requestId) {
    var sharedPassword = TabStorage.get(worker.tab.id, 'sharedPassword'),
      usersIds = TabStorage.get(worker.tab.id, 'shareWith'),
      keyring = new Keyring(),
      crypto = new Crypto(),
      armoreds = {};

    if (!usersIds.length) {
      worker.port.emit('passbolt.share.encrypt.complete', requestId, 'SUCCESS', {});
      return;
    }

    // Master password required to decrypt a secret before sharing it.
    masterPasswordController.get(requestId, worker)

      // Once the master password retrieved, decrypt the secret.
      .then(function (masterPassword) {
        worker.port.emit('passbolt.progress.open-dialog', 'Encrypting ...', usersIds.length);
        worker.port.emit('passbolt.event.trigger_to_page', 'passbolt_loading');
        return crypto.decrypt(sharedPassword.armored, masterPassword)
      })

      // Once the password decrypted, store it locally.
      .then(function (secret) {
        sharedPassword.secret = secret;
      })

      // Sync the keyring with the server.
      .then(function() {
        return keyring.sync();
      })

      // Once the keyring is synced, encrypt the secret for each user.
      .then(function () {
        // Store the encryption promise for each user in this array.
        // Encryptions will be treated in parallel to optimize the treatment.
        var promises = [],
          progress = 0,
          progressWorker = null;

        usersIds.forEach(function (userId) {
          var p = crypto.encrypt(sharedPassword.secret, userId);
          promises.push(p);

          // Update the progress dialog.
          p.then(function () {
            progress++;
            progressWorker = Worker.get('Progress', worker.tab.id);
            if (progressWorker != null) {
              progressWorker.port.emit('passbolt.progress.update', 'Encrypted for ' + userId, progress);
            }
          });
        });

        return Promise.all(promises);
      })

      // Once the secret is encrypted for all users notify the application and
      // close the progress dialog.
      .then(function (data) {
        for (var i in data) {
          armoreds[usersIds[i]] = data[i];
        }
        worker.port.emit('passbolt.share.encrypt.complete', requestId, 'SUCCESS', armoreds);
        worker.port.emit('passbolt.progress.close-dialog');
        worker.port.emit('passbolt.event.trigger_to_page', 'passbolt_loading_complete');
      });

  });

  // A permission has been temporary deleted.
  // Remove it from the list of users to shared the password with, it added
  // previously.
  //
  // @listens passbolt.share.remove_permission
  // @param userId {string} The user who has been removed.
  worker.port.on('passbolt.share.remove_permission', function (userId) {
    var shareWith = TabStorage.get(worker.tab.id, 'shareWith') || [],
      index = shareWith.indexOf(userId);

    if (index != -1) {
      shareWith.splice(index, 1);
      TabStorage.set(worker.tab.id, 'shareWith', shareWith);
    }
  });

};

exports.listen = listen;
