/**
 * Passphrase controller.
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

import { OpenpgpAssertion } from "../../utils/openpgp/openpgpAssertions";
import Keyring from "../../model/keyring";
import DecryptPrivateKeyService from "../crypto/decryptPrivateKeyService";
import { QuickAccessService } from "../ui/quickAccess.service";
import UserAbortsOperationError from "../../error/userAbortsOperationError";
import PassphraseStorageService from "../session_storage/passphraseStorageService";
import WorkerService from "../worker/workerService";
import PortManager from "../../sdk/port/portManager";
import UserRememberMeLatestChoiceLocalStorage from "../local_storage/userRememberMeLatestChoiceLocalStorage";
import UserRememberMeLatestChoiceEntity from "../../model/entity/rememberMe/userRememberMeLatestChoiceEntity";
import { assertPassphrase } from "../../utils/assertions";
import KeepSessionAliveService from "../session_storage/keepSessionAliveService";
import { v4 as uuidv4 } from "uuid";

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
    const requestResult = await worker.port.request("passbolt.passphrase.request");
    const { passphrase, rememberMe } = requestResult;
    await this.validatePassphrase(passphrase);
    await this.rememberPassphrase(passphrase, rememberMe);

    return passphrase;
  }

  /**
   * Request the user passphrase from the Quick Access in detached mode.
   * This method intentionally uses openInDetachedMode directly (not open()) because it depends on the
   * returned window object to find the QuickAccess tab/port and set up the passphrase response listener.
   * On Safari, the passphrase is requested differently via the attached popup,
   * see listenToAttachedQuickaccessPassphraseRequestResponse().
   * @returns {Promise<string>}
   */
  async requestPassphraseFromQuickAccess() {
    const storedPassphrase = await PassphraseStorageService.get();
    if (storedPassphrase) {
      return storedPassphrase;
    }

    const requestId = uuidv4();
    const queryParameters = [
      { name: "feature", value: "request-passphrase" },
      { name: "requestId", value: requestId },
    ];

    let quickAccessResponse;
    if (QuickAccessService.isAttachedModeAvailable()) {
      // Open attached popup — returns the workerId used as the port name
      const workerId = await QuickAccessService.open(queryParameters);
      quickAccessResponse = await this.listenToAttachedQuickaccessPassphraseRequestResponse(requestId, workerId);
    } else {
      const quickAccessWindow = await QuickAccessService.openInDetachedMode(queryParameters);
      quickAccessResponse = await this.listenToDetachedQuickaccessPassphraseRequestResponse(
        requestId,
        quickAccessWindow,
      );
    }

    const { passphrase, rememberMe } = quickAccessResponse;
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
    await WorkerService.waitExists("QuickAccess", tabId);
    const quickAccessWorker = await WorkerService.get("QuickAccess", tabId);

    return this.listenForPassphraseInQuickaccess(quickAccessWorker.port, requestId);
  }

  /**
   * Listen to the attached quick access passphrase request response.
   * Polls for the QuickAccess port to connect, then listens for the passphrase response.
   * @param {string} requestId The requestId used by the quick access to return the user passphrase
   * @param {string} workerId The worker id used as the port identifier
   * @returns {Promise<{passphrase: string, rememberMe: string}>}
   */
  async listenToAttachedQuickaccessPassphraseRequestResponse(requestId, workerId) {
    const port = await this.waitForPort(workerId);
    return await this.listenForPassphraseInQuickaccess(port, requestId);
  }

  /**
   * Listens for when the passphrase has been given in the quickaccess.
   * @param {Port} port
   * @param {string} requestId
   * @returns {Promise<string>}
   */
  async listenForPassphraseInQuickaccess(port, requestId) {
    let isResolved = false;
    return new Promise((resolve, reject) => {
      // When the passphrase is entered and valid, the quickaccess responds on the port with the requestId.
      port.on(requestId, (status, requestResult) => {
        isResolved = true;
        if (status === "SUCCESS") {
          resolve(requestResult);
        } else {
          reject(requestResult);
        }
      });
      // If the user closes the popup before entering their passphrase, the operation is aborted.
      port._port.onDisconnect.addListener(() => {
        if (!isResolved) {
          isResolved = true;
          const error = new UserAbortsOperationError("The dialog has been closed.");
          reject(error);
        }
      });
    });
  }

  /**
   * Wait for a port to be available in the PortManager.
   * @param {string} portId The port identifier to wait for
   * @param {number} timeout The maximum time to wait in milliseconds
   * @returns {Promise<Port>}
   */
  async waitForPort(portId, timeout = 5000) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      if (PortManager.isPortExist(portId)) {
        return PortManager.getPortById(portId);
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error("The QuickAccess port did not connect in time.");
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

    await Promise.all([PassphraseStorageService.set(passphrase, duration), KeepSessionAliveService.start()]);
    const userRememberMeLatestChoiceEntity = new UserRememberMeLatestChoiceEntity({
      duration: parseInt(duration, 10),
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
