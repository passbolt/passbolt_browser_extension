/**
 * Master password Listeners
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var Worker = require('../model/worker');
var Keyring = require('../model/keyring').Keyring;
var TabStorage = require('../model/tabStorage').TabStorage;

var listen = function (worker) {

  /*
   * Master password attempt, verify it :
   * - If correct, resolve the master password request promise with the master password
   *  as parameter.
   *  - If wrong :
   *    * And less than 3 attempts done, notify the user their master password is wrong ;
   *    * And 3 attempts done already
   *      ** notify the user;
   *      ** don't allow him to make another attempt with the same dialog;
   *      ** reject the master password request promise
   *
   * @listens passbolt.master-password.submit
   * @param requestId {uuid} The request identifier
   * @param masterPassword {string} The master password filled by the user
   */
  worker.port.on('passbolt.master-password.submit', function (requestId, masterPassword) {
    var keyring = new Keyring(),
      masterPasswordRequest = TabStorage.get(worker.tab.id, 'masterPasswordRequest');

    // New attempt done.
    masterPasswordRequest.attempts++;

    // Check the master password..
    keyring.checkPassphrase(masterPassword).then(
      // correct master password.
      function () {
        worker.port.emit(requestId, 'SUCCESS');
        masterPasswordRequest.deferred.resolve(masterPassword);
      },
      // wrong master password.
      function () {
        worker.port.emit(requestId, 'ERROR', masterPasswordRequest.attempts);
        if (masterPasswordRequest.attempts === 3) {
          masterPasswordRequest.deferred.reject();
        }
      });
  });

  /*
   * Master password cancel prompt process.
   *  - Close the dialog;
   *  - Reject the master password promise associated to the master password request.
   *
   * @listens passbolt.master-password.cancel
   */
  worker.port.on('passbolt.master-password.cancel', function () {
    var masterPasswordRequest = TabStorage.get(worker.tab.id, 'masterPasswordRequest'),
      appWorker = Worker.get('App', worker.tab.id);

    // If the request hasn't been destroyed already.
    // After reaching 3 attempts the requests is destroyed by the
    // passbolt.master-password.submit message handler.
    if (masterPasswordRequest) {
      masterPasswordRequest.deferred.reject();
    }

    appWorker.port.emit('passbolt.master-password.close-dialog');
  });

};
exports.listen = listen;
