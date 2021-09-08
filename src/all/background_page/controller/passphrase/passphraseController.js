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
const {UserAbortsOperationError} = require("../../error/userAbortsOperationError");
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
    /*
     Open the quick access to request the master passphrase to the user.
     Then once the quick access will have captured the passphrase, it will communicate it to its worker using requestId
     as message name. Basically, without changing the way the passphrase will be returned if the quick access was already
     open and it will have to reply to the request "passbolt.passphrase.request".
    */
    const requestId = (Math.round(Math.random() * Math.pow(2, 32))).toString();
    const queryParameters = [
      {name: "uiMode", value: "detached"},
      {name: "feature", value: "request-passphrase"},
      {name: "requestId", value: requestId}
    ];
    const quickAccessWindow = await QuickAccessService.openInDetachedMode(queryParameters);
    const {passphrase, rememberMe} = await listenToDetachedQuickaccessPassphraseRequestResponse(requestId, quickAccessWindow);
    validatePassphrase(passphrase, rememberMe);
    rememberPassphrase(passphrase, rememberMe);

    return passphrase;
  }
};
exports.requestFromQuickAccess = requestPassphraseFromQuickAccess;

/**
 * Listen to the quick access passphrase request response.
 * @param {string} requestId The requestId used by the quick access to return the user passphrase
 * @param {window.Window} quickAccessWindow The window the quick access runs on.
 * @returns {Promise<{passphrase: string, rememberMe: string}>}
 */
const listenToDetachedQuickaccessPassphraseRequestResponse = async function(requestId, quickAccessWindow) {
  const tabId = quickAccessWindow?.tabs?.[0]?.id;
  await Worker.waitExists('QuickAccess', tabId);
  const quickAccessWorker = Worker.get('QuickAccess', tabId);
  let isResolved = false;

  const promise = new Promise((resolve, reject) => {
    // When the passphrase is entered and valid, the quickaccess responds on the port with the requestId that has been given to it when opening it.
    quickAccessWorker.port.on(requestId, (status, requestResult)  => {
      isResolved = true;
      if (status === 'SUCCESS') {
        resolve(requestResult)
      } else {
        reject(requestResult);
      }
    });
    // If the users closes the window manually before entering their passphrase, the operation is aborted.
    quickAccessWorker.port.onDisconnect(() => {
      if (!isResolved) {
        isResolved = true;
        const error = new UserAbortsOperationError("The dialog has been closed.");
        reject(error);
      }
    })
  });

  return promise;
};

/**
 * Remember the user passphrase for a given duration.
 * @param {string} passphrase The passphrase.
 * @param {integer|string} duration The duration in second to remember the passphrase for. If -1 given then it will.
 *   remember the passphrase until the user is logged out.
 */
const rememberPassphrase = function(passphrase, duration) {
  if (!duration || !Number.isInteger(duration)) {
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
  if (!(typeof rememberMe === 'boolean') && !Number.isInteger(rememberMe)) {
    throw new Error(i18n.t('The remember me should be a valid integer.'));
  }

  const keyring = new Keyring();
  keyring.checkPassphrase(passphrase);
};

