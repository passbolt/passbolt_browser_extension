/**
 * Passphrase controller.
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

const Keyring = require('../../model/keyring').Keyring;
const User = require('../../model/user').User;
const Worker = require('../../model/worker');

/**
 * Get the user master password.
 *
 * @param {Worker} worker The worker from which the request comes from.
 * @return {Promise<string>}
 * @throw Error if the passphrase is not valid.
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
 * Request the user passphrase.
 *
 * @param {Worker} worker The worker from which the request comes from.
 * @throw Error if the passphrase is not valid.
 * @return {Promise<string>}
 */
const requestPassphrase = async function(worker) {
  try {
    const requestResult = await worker.port.request('passbolt.passphrase.request');
    const { passphrase, rememberMe } = requestResult;
    validatePassphrase(passphrase, rememberMe);
    rememberPassphrase(passphrase, rememberMe);

    return passphrase;
  } catch (error) {
    throw error;
  }
};
exports.request = requestPassphrase;

/**
 * Remember the user passphrase for a given duration.
 * @param {string} passphrase The passphrase.
 * @param {integer|string} duration The duration in second to remember the passphrase for. If -1 given then it will.
 *   remember the passphrase until the user is logged out.
 */
const rememberPassphrase = function(passphrase, duration) {
  if (!duration || !Validator.isInt(duration)) {
    return;
  }
  const user = User.getInstance();
  user.storeMasterPasswordTemporarily(passphrase, duration);
};

/**
 * Validate the passphrase.
 * @param {string} passphrase The passphrase.
 * @param {integer|string} rememberMe (Optional) The duration in second to remember the passphrase for. If -1 given then it will.
 * @throw Error if the passphrase is not valid.
 */
const validatePassphrase = function(passphrase, rememberMe) {
  if (!Validator.isUtf8(passphrase)) {
    throw new Error(__('The passphrase should be a valid UTF8 string.'));
  }
  if (!Validator.isBoolean(rememberMe) && !Validator.isInt(rememberMe)) {
    throw new Error(__('The remember me should be a valid integer.'));
  }

  const keyring = new Keyring();
  keyring.checkPassphrase(passphrase);
};

