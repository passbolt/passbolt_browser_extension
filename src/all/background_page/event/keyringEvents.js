/**
 * Keyring events
 * @TODO refactor with public and private listeners separate
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
import Keyring from "../model/keyring";
import {PassphraseController as passphraseController} from "../controller/passphrase/passphraseController";
import CheckPassphraseController from "../controller/crypto/checkPassphraseController";
import GetUserKeyInfoController from "../controller/crypto/getUserKeyInfoController";
import GetKeyInfoController from "../controller/crypto/getKeyInfoController";
import DownloadUserPublicKeyController from "../controller/crypto/downloadUserPublicKeyController";
import DownloadUserPrivateKeyController from "../controller/crypto/downloadUserPrivateKeyController";

const listen = function(worker) {
  /*
   * ==================================================================================
   *  Get Key info events
   * ==================================================================================
   */

  /*
   * Get the public key information for a user.
   *
   * @listens passbolt.keyring.get-public-key-info-by-user
   * @param requestId {uuid} The request identifier
   * @param userId {string} The user identifier
   */
  worker.port.on('passbolt.keyring.get-public-key-info-by-user', async(requestId, userId) => {
    const controller = new GetUserKeyInfoController(worker, requestId);
    await controller._exec(userId);
  });

  /**
   * Get information from the given armored key.
   *
   * @listens passbolt.keyring.get-key-info
   * @param {uuid} requestId The request identifier
   * @param {string} armoredKey The armored key to get info from
   */
  worker.port.on('passbolt.keyring.get-key-info', async(requestId, armoredKey) => {
    const controller = new GetKeyInfoController(worker, requestId);
    await controller._exec(armoredKey);
  });

  /*
   * ==================================================================================
   *  Import Key & Sync' events
   * ==================================================================================
   */

  /*
   * Check the private key passphrase.
   *
   * @listens passbolt.keyring.private.checkpassphrase
   * @param requestId {uuid} The request identifier
   * @param passphrase {string} The passphrase to check
   */
  worker.port.on('passbolt.keyring.private.checkpassphrase', async(requestId, passphrase) => {
    const controller = new CheckPassphraseController(worker, requestId);
    await controller._exec(passphrase);
  });

  /*
   * ==================================================================================
   *  Backups key events
   * ==================================================================================
   */

  /*
   * Offer to users to download their public key
   *
   * @listens passbolt.keyring.download-my-public-key
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.keyring.download-my-public-key', async requestId => {
    const controller = new DownloadUserPublicKeyController(worker, requestId);
    await controller._exec();
  });

  /*
   * Offer to users to download their private key
   *
   * @listens passbolt.keyring.download-my-private-key
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.keyring.download-my-private-key', async requestId => {
    const controller = new DownloadUserPrivateKeyController(worker, requestId);
    await controller._exec();
  });

  /*
   * Get private key
   *
   * @listens passbolt.keyring.get-private-key
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.keyring.get-private-key', async requestId => {
    try {
      await passphraseController.request(worker);
      const keyring = new Keyring();
      const privateKeyInfo = keyring.findPrivate();
      if (!privateKeyInfo) {
        throw new Error('Private key not found.');
      }
      worker.port.emit(requestId, 'SUCCESS', privateKeyInfo.armoredKey);
    } catch (error) {
      worker.port.emit(requestId, 'ERROR', error);
    }
  });
};
export const KeyringEvents = {listen};

