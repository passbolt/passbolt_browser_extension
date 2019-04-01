/**
 * Master password controller.
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

const Keyring = require('../model/keyring').Keyring;
const User = require('../model/user').User;
const Worker = require('../model/worker');
const TabStorage = require('../model/tabStorage').TabStorage;

/**
 * Get the user passphrase.
 * If the passphrase is remembered return it, otherwise request the users to enter their passphrase.
 *
 * @param worker The worker requesting the passphrase
 * @returns {Promise<string>}
 */
const get = async function (worker) {
  const user = User.getInstance();

  try {
    return await user.getStoredMasterPassword();
  } catch (error) {
    return requestPassphrase(worker);
  }
};
exports.get = get;

/**
 * Request the users to enter their passphrase.
 *
 * @param worker The worker requesting the passphrase.
 * @return {Promise}
 * @private
 */
const requestPassphrase = function (worker) {
  // @todo the quickaccess worker should have a pagemod too
  // If the requester is the Quick access worker
  if (!worker.pageMod) {
    return requestQuickAccessPassphrase(worker)
  } else {
    return requestAppPassphrase(worker);
  }
};

/**
 * Request the passphrase on the quickaccess worker
 * @param {Worker} worker
 * @return {Promise}
 */
const requestQuickAccessPassphrase = async function(worker) {
  const requestResult = await worker.port.request('passbolt.passphrase.request');
  const { passphrase, rememberMe } = requestResult;

  if (!Validator.isUtf8(passphrase)) {
    throw new Error(__('The passphrase should be a valid UTF8 string.'));
  }
  if (!Validator.isBoolean(rememberMe)) {
    throw new Error(__('The remember me should be a valid boolean.'));
  }

  const keyring = new Keyring()
  keyring.checkPassphrase(passphrase)

  if (rememberMe) {
    const user = User.getInstance();
    user.storeMasterPasswordTemporarily(passphrase, -1);
  }

  return passphrase;
};

/**
 * Request the passphrase on the app worker
 * @param {Worker} worker
 * @return {Promise}
 */
const requestAppPassphrase = function(worker) {
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
