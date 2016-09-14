/**
 * Master password controller.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

/* ==========================================================================
 *  Master password dialog management
 * ==========================================================================
 */
/**
 * This utility function allows to manage several password attempts
 * Currently it is used only when decrypting content but this system
 * can be reusable for other features in the future like authentication
 */
var app = require('../main');
const {defer} = require('sdk/core/promise');
var Keyring = require('../model/keyring').Keyring;
var User = require('../model/user').User;
var Worker = require('../model/worker');

var get = function (token, worker) {
  var attempts = 0,
    deferred = defer(),
    workerContext = Worker.getContext(worker),

    _loop = function (masterPassword) {

      if (typeof masterPassword == 'undefined') {
        app.callbacks[token] = function (token, masterPassword) {
          _loop(masterPassword);
        };
        Worker.get('App', workerContext).port.emit('passbolt.master-password.open-dialog', token);
      }
      else {
        // Only up to 3 attempts are authorized
        if (attempts > 2) {
          deferred.reject();
          Worker.get('MasterPassword', workerContext).port.emit('passbolt.keyring.master.request.complete', token, 'ERROR', attempts);
          return;
        }
        var keyring = new Keyring();

        // Check the passphrase entered is correct
        keyring.checkPassphrase(masterPassword).then(
          function () {
            // If everything went fine close the passphrase popup.
            Worker.get('App', workerContext).port.emit('passbolt.master-password.close-dialog', token);
            deferred.resolve(masterPassword);
          },
          function () {
            Worker.get('MasterPassword', workerContext).port.emit('passbolt.keyring.master.request.complete', token, 'ERROR', attempts);
            attempts++;
          });
      }
    };

  // Instantiates user model.
  var user = new User();

  // Try to retrieve a remembered passphrase.
  user.getStoredMasterPassword().then(
    // If a passphrase is remembered, use it.
    function (masterPassword) {
      deferred.resolve(masterPassword);
    },
    // If no passphrase is remembered, ask it.
    function () {
      _loop();
    }
  );

  return deferred.promise;
};
exports.get = get;