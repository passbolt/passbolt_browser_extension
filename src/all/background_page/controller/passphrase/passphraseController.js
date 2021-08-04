/**
 * Passphrase controller.
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

const {QuickAccessService} = require("../../service/ui/quickAccess.service");
const {i18n} = require('../../sdk/i18n');
const Keyring = require('../../model/keyring').Keyring;
const User = require('../../model/user').User;
const Worker = require('../../model/worker');
const {BrowserTabService} = require("../../service/ui/browserTab.service");

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
 * Request the user passphrase from the Quick Access
 */
const requestPassphraseFromQuickAccess = async function() {
  const user = User.getInstance();
  try {
    return await user.getStoredMasterPassword();
  } catch (error) {
    const requestId = 'passbolt.quickaccess.request-passphrase';
    // Open the quick access to ask for the master passphrase
    const queryParameters = [
      {name: "uiMode", value: "detached"},
      {name: "feature", value: "request-passphrase"},
      {name: "requestId", value: requestId}
    ];
    await QuickAccessService.openInDetachedMode(queryParameters);
    return await getPassphraseFromQuickAccess(requestId);
  }
};

const getPassphraseFromQuickAccess = async function(requestId) {
  return  new Promise((resolve, reject) => {
    const quickAccessWorkerInterval = setInterval(async() => {
      const currentTab = await BrowserTabService.getCurrent();
      const quickAccessWorker = Worker.get('QuickAccess', currentTab.id);
      if (quickAccessWorker) {
        clearInterval(quickAccessWorkerInterval);
        try {
          quickAccessWorker.port.on(requestId, (status, requestResult)  => {
            if (status === 'SUCCESS') {
              const {passphrase, rememberMe} = requestResult;
              validatePassphrase(passphrase, rememberMe);
              rememberPassphrase(passphrase, rememberMe);
              resolve(passphrase);
            }
          });
        } catch (error) {
          reject(error);
        }
      }
    }, 100);
  });
};

exports.requestFromQuickAccess = requestPassphraseFromQuickAccess;

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
    throw new Error(i18n.t('The passphrase should be a valid UTF8 string.'));
  }
  if (!Validator.isBoolean(rememberMe) && !Validator.isInt(rememberMe)) {
    throw new Error(i18n.t('The remember me should be a valid integer.'));
  }

  const keyring = new Keyring();
  keyring.checkPassphrase(passphrase);
};

