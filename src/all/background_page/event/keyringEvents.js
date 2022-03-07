/**
 * Keyring events
 * @TODO refactor with public and private listeners separate
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const {i18n} = require('../sdk/i18n');
const {Keyring} = require('../model/keyring');
const keyring = new Keyring();
const passphraseController = require('../controller/passphrase/passphraseController');
const fileController = require('../controller/fileController');
const {GetUserKeyInfoController} = require('../controller/crypto/getUserKeyInfoController');
const {CheckPassphraseController} = require('../controller/crypto/checkPassphraseController');
const {DownloadUserPublicKeyController} = require('../controller/crypto/downloadUserPublicKeyController');

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
    const filename = "passbolt_private.asc";
    try {
      await passphraseController.request(worker);
      const privateKeyInfo = await keyring.findPrivate();
      if (!privateKeyInfo) {
        throw new Error(i18n.t('Private key not found.'));
      }
      await fileController.saveFile(filename, privateKeyInfo.armoredKey, "text/plain", worker.tab.id);
      worker.port.emit(requestId, 'SUCCESS');
    } catch (error) {
      worker.port.emit(requestId, 'ERROR', error);
    }
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
exports.listen = listen;

