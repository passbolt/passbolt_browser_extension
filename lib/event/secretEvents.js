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
  // @listens passbolt.secret-edit.decrypt
  // @param requestId {int} The request identifier
  // @param armored {string} The armored secret
  //
  // @fires ~.SUCCESS
  // @property {string} unarmored - The unarmored string
  // @fires ~.ERROR
  // @property {string} message - The error message
  worker.port.on('passbolt.secret-edit.decrypt', function (requestId, armored) {
    var crypto = new Crypto();

    // Master password required to decrypt a secret.
    masterPasswordController.get(worker)

      // Once the master password retrieved, decrypt the secret.
      .then(function (masterPassword) {
        return crypto.decrypt(armored, masterPassword)
      })

      // Once the secret is decrypted, respond to the requester.
      .then(function (decrypted) {
        worker.port.emit('passbolt.secret-edit.decrypt.complete', requestId, 'SUCCESS', decrypted);
      })

      // Catch any error.
      .then(null, function (error) {
        worker.port.emit('passbolt.secret-edit.decrypt.complete', requestId, 'ERROR', error);
      });
  });

  // Listen when the secret is updated.
  // Notify the application. The application needs to know if the secret has
  // changed to
  //
  // @listens passbolt.edit-password.secret-updated
  worker.port.on('passbolt.secret-edit.secret-updated', function () {
    Worker.get('App', worker.tab.id).port.emit('passbolt.secret-edit.secret-updated');
  });

  // Listen when the secret field has the focus and the user press the tab key.
  // Notify the application. The application will put the focus on the field
  // following the secret field.
  //
  // @listens passbolt.secret-edit.tab-pressed
  // @fires passbolt.secret-edit.tab-pressed on the App worker
  worker.port.on('passbolt.secret-edit.tab-pressed', function () {
    Worker.get('App', worker.tab.id).port.emit('passbolt.secret-edit.tab-pressed');
  });

  // Listen when the secret field has the focus and the user press the back tab
  // key. Notify the application. The application will put the focus on the
  // field above the secret field.
  //
  // @listens passbolt.secret-edit.back-tab-pressed
  // @fires passbolt.secret-edit.back-tab-pressed on the App worker
  worker.port.on('passbolt.secret-edit.back-tab-pressed', function () {
    Worker.get('App', worker.tab.id).port.emit('passbolt.secret-edit.back-tab-pressed');
  });

};
exports.listen = listen;
