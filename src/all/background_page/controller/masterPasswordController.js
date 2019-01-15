/**
 * Master password controller.
 *
 * @copyright (c) 2017-2018 Passbolt SARL, 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

/**
 * This utility function allows to manage several password attempts
 * Currently it is used only when decrypting content but this system
 * can be reusable for other features in the future like authentication
 */
var User = require('../model/user').User;
var Worker = require('../model/worker');
var TabStorage = require('../model/tabStorage').TabStorage;

/**
 * Get the user master password. If a remembered master password exists
 * return it, otherwise prompt the user.
 *
 * @param worker The worker asking for the master password.
 * @returns {d.promise|*|promise} The promise to resolve/reject when the master password is retrieved.
 */
var get = async function (worker) {
  const user = User.getInstance();

  try {
    return await user.getStoredMasterPassword();
  } catch (error) {
    return _promptUser(worker);
  }
};
exports.get = get;

/**
 * Prompt the user to enter their master password.
 *
 * @param worker The worker asking for the master password.
 * @private
 */
var _promptUser = function (worker) {
  return new Promise(function(resolve, reject) {
    const masterPasswordRequest = {
      attempts: 0,
      deferred: {
        resolve: resolve,
        reject: reject
      }
    };
    // Store the masterPassword request in the tab storage.
    TabStorage.set(worker.tab.id, 'masterPasswordRequest', masterPasswordRequest);
    // Init the master password dialog.
    Worker.get('App', worker.tab.id).port.emit('passbolt.master-password.open-dialog');
  });
};
