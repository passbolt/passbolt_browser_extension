/**
 * Secret Listeners
 *
 * Used for encryption and decryption events
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

var masterPasswordController = require('../controller/masterPasswordController');
var Crypto = require('../model/crypto').Crypto;
var app = require('../main');
var Worker = require('../model/worker');
var Secret = require('../model/secret').Secret;
var secret = new Secret();
var TabStorage = require('../model/tabStorage').TabStorage;

var listen = function (worker) {

  // Validate the edited secret.
  // Notify the secret worker & the application worker so they can display
  // a feedback in case of error.
  //
  // @listens passbolt.secret-edit.validate
  //
  // @fires passbolt.secret-edit.validate-success if valid
  // @fires passbolt.secret-edit.validate-error if not valid
  // @property {string} message - The error message
  // @property {array} validationErrors - An array of errors
  worker.port.on('passbolt.secret-edit.validate', function () {
    // Retrieve the currently edited password.
    var editedPassword = TabStorage.get(worker.tab.id, 'editedPassword');

    try {
      // If the secret is decrypted validate it, otherwise it is
      // considered as valid.
      if (editedPassword.secret != null) {
        secret.validate({data: editedPassword.secret});
      }
      Worker.get('App', worker.tab.id).port.emit('passbolt.secret-edit.validate-success');
      worker.port.emit('passbolt.secret-edit.validate-success');
    } catch (e) {
      Worker.get('App', worker.tab.id).port.emit('passbolt.secret-edit.validate-error', e.message, e.validationErrors);
      worker.port.emit('passbolt.secret-edit.validate-error', e.message, e.validationErrors);
    }
  });

  // Decrypt a given armored string.
  //
  // @listens passbolt.secret-edit.validate
  // @param requestId {int} The request identifier
  // @param armored {string} The armored secret
  //
  // @fires ~.SUCCESS
  // @property {string} unarmored - The unarmored string
  // @fires ~.ERROR
  // @property {string} message - The error message
  worker.port.on('passbolt.secret.decrypt', function (requestId, armored) {
    var crypto = new Crypto();

    // Master password required to decrypt a secret.
    masterPasswordController.get(requestId, worker)

      // Once the master password retrieved, decrypt the secret.
      .then(function (masterPassword) {
        // Start loading bar.
        Worker.get('App', worker.tab.id).port.emit('passbolt.event.trigger_to_page', 'passbolt_loading');
        return crypto.decrypt(armored, masterPassword)
      })

      // Once the secret is decrypted, answer to the requester.
      .then(function (decrypted) {
        // Answser to the requester with decrypted secret.
        worker.port.emit('passbolt.secret.decrypt.complete', requestId, 'SUCCESS', decrypted);
        // Complete the progress.
        Worker.get('App', worker.tab.id).port.emit('passbolt.event.trigger_to_page', 'passbolt_loading_complete');
      })

      // Catch any error.
      .then(null, function (error) {
        worker.port.emit('passbolt.secret.decrypt.complete', requestId, 'ERROR', error);
        // Stop loading bar.
        Worker.get('App', worker.tab.id).port.emit('passbolt.event.trigger_to_page', 'passbolt_loading_complete');
      });
  });

};
exports.listen = listen;
