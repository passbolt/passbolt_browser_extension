/**
 * Passphrase controller.
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import Keyring from "../../model/keyring";
import DecryptPrivateKeyService from "../crypto/decryptPrivateKeyService";
import {QuickAccessService} from "../ui/quickAccess.service";
import UserAbortsOperationError from "../../error/userAbortsOperationError";
import PassphraseStorageService from "../session_storage/passphraseStorageService";
import WorkerService from "../worker/workerService";
import UserRememberMeLatestChoiceLocalStorage from "../local_storage/userRememberMeLatestChoiceLocalStorage";
import UserRememberMeLatestChoiceEntity from "../../model/entity/rememberMe/userRememberMeLatestChoiceEntity";
import {assertPassphrase} from "../../utils/assertions";
import KeepSessionAliveService from "../session_storage/keepSessionAliveService";

export default class GetPassphraseService {
  constructor(account) {
    this.userRememberMeLatestChoiceStorage = new UserRememberMeLatestChoiceLocalStorage(account);
  }

  /**
   * Get the user master password.
   *
   * @param {Worker} worker The worker from which the request comes from.
   * @return {Promise<string>}
   * @throw Error if the passphrase is not valid.
   */
  async getPassphrase(worker) {
    const passphrase = await PassphraseStorageService.get();
    if (passphrase) {
      return passphrase;
    }
    return this.requestPassphrase(worker);
  }

  /**
   * Read the user master password from the storage.
   * @return {Promise<string>}
   * @throw Error if the passphrase is not available.
   */
  async getFromStorageOrFail() {
    const passphrase = await PassphraseStorageService.get();
    if (!passphrase) {
      throw new Error("No passphrase found in the session storage.");
    }
    return passphrase;
  }

  /**
   * Request the user passphrase.
   *
   * @param {Worker} worker The worker from which the request comes from.
   * @throw Error if the passphrase is not valid.
   * @return {Promise<string>}
   */
  async requestPassphrase(worker) {
    const requestResult = await worker.port.request('passbolt.passphrase.request');
    const {passphrase, rememberMe} = requestResult;
    await this.validatePassphrase(passphrase);
    await this.rememberPassphrase(passphrase, rememberMe);

    return passphrase;
  }

  /**
   * Request the user passphrase from the Quick Access
   * @returns {Promise<string>}
   */
  async requestPassphraseFromQuickAccess() {
    const storedPassphrase = await PassphraseStorageService.get();
    if (storedPassphrase) {
      return storedPassphrase;
    }

    /*
     * Open the quick access to request the master passphrase to the user.
     * Then once the quick access will have captured the passphrase, it will communicate it to its worker using requestId
     * as message name. Basically, without changing the way the passphrase will be returned if the quick access was already
     * open and it will have to reply to the request "passbolt.passphrase.request".
     */
    const requestId = (Math.round(Math.random() * Math.pow(2, 32))).toString();
    const queryParameters = [
      {name: "uiMode", value: "detached"},
      {name: "feature", value: "request-passphrase"},
      {name: "requestId", value: requestId}
    ];
    const quickAccessWindow = await QuickAccessService.openInDetachedMode(queryParameters);
    const {passphrase, rememberMe} = await this.listenToDetachedQuickaccessPassphraseRequestResponse(requestId, quickAccessWindow);
    await this.validatePassphrase(passphrase);
    await this.rememberPassphrase(passphrase, rememberMe);

    return passphrase;
  }

  /**
   * Listen to the quick access passphrase request response.
   * @param {string} requestId The requestId used by the quick access to return the user passphrase
   * @param {window.Window} quickAccessWindow The window the quick access runs on.
   * @returns {Promise<{passphrase: string, rememberMe: string}>}
   */
  async listenToDetachedQuickaccessPassphraseRequestResponse(requestId, quickAccessWindow) {
    const tabId = quickAccessWindow?.tabs?.[0]?.id;
    await WorkerService.waitExists('QuickAccess', tabId);
    const quickAccessWorker = await WorkerService.get('QuickAccess', tabId);
    let isResolved = false;

    return new Promise((resolve, reject) => {
      // When the passphrase is entered and valid, the quickaccess responds on the port with the requestId that has been given to it when opening it.
      quickAccessWorker.port.on(requestId, (status, requestResult)  => {
        isResolved = true;
        if (status === 'SUCCESS') {
          resolve(requestResult);
        } else {
          reject(requestResult);
        }
      });
      // If the users closes the window manually before entering their passphrase, the operation is aborted.
      quickAccessWorker.port._port.onDisconnect.addListener(() => {
        if (!isResolved) {
          isResolved = true;
          const error = new UserAbortsOperationError("The dialog has been closed.");
          reject(error);
        }
      });
    });
  }

  /**
   * Remember the user passphrase for a given duration.
   * @param {string} passphrase The passphrase.
   * @param {integer|string} duration The duration in second to remember the passphrase for.
   *  If -1 given then it will remember the passphrase until the user is logged out.
   * @private
   */
  async rememberPassphrase(passphrase, duration) {
    if (!duration || !Number.isInteger(duration)) {
      return;
    }

    await Promise.all([
      PassphraseStorageService.set(passphrase, duration),
      KeepSessionAliveService.start(),
    ]);
    const userRememberMeLatestChoiceEntity = new UserRememberMeLatestChoiceEntity({
      duration: parseInt(duration, 10)
    });
    this.userRememberMeLatestChoiceStorage.set(userRememberMeLatestChoiceEntity);
  }

  /**
   * Validate the passphrase.
   * @param {string} passphrase The passphrase.
   * @returns {Promise<void>}
   * @throws {Error} Error if the passphrase is not a valid utf-8 string.
   * @throws {InvalidMasterPasswordError} if the passphrase is not valid.
   */
  async validatePassphrase(passphrase) {
    assertPassphrase(passphrase);

    const keyring = new Keyring();
    const userPrivateArmoredKey = keyring.findPrivate().armoredKey;
    const userPrivateKey = await OpenpgpAssertion.readKeyOrFail(userPrivateArmoredKey);
    await DecryptPrivateKeyService.decrypt(userPrivateKey, passphrase);
  }
}
