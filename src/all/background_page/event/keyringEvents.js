/**
 * Keyring events
 * @TODO refactor with public and private listeners separate
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const __ = require('../sdk/l10n').get;
const {Keyring} = require('../model/keyring');
const {User} = require('../model/user');
const Uuid = require('../utils/uuid');
const keyring = new Keyring();
const passphraseController = require('../controller/passphrase/passphraseController');

const fileController = require('../controller/fileController');

const listen = function (worker) {

  /* ==================================================================================
   *  Get Key info events
   * ================================================================================== */

  /*
   * Get the public key information for a user.
   *
   * @listens passbolt.keyring.get-public-key-info-by-user
   * @param requestId {uuid} The request identifier
   * @param userId {string} The user identifier
   */
  worker.port.on('passbolt.keyring.get-public-key-info-by-user', async function (requestId, userId) {
    let key = keyring.findPublic(userId);
    // If the key is not in the keyring, try to sync the keyring and try again
    if (!key) {
      await keyring.sync();
      key = keyring.findPublic(userId);
    }

    if (key) {
      const keyInfo = await keyring.keyInfo(key.key);
      worker.port.emit(requestId, 'SUCCESS', keyInfo);
    } else {
      worker.port.emit(requestId, 'ERROR', __('Key not found'));
    }
  });

  /*
   * Get the server's public key.
   *
   * @listens passbolt.keyring.server.get
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.keyring.server.get', function (requestId) {
    let user, domain;

    try {
      user = User.getInstance();
      domain = user.settings.getDomain();
    } catch (error) {
      worker.port.emit(requestId, 'ERROR', error.message);
      return;
    }

    let serverkeyid = Uuid.get(domain),
      serverkey = keyring.findPublic(serverkeyid);

    if (typeof serverkey !== 'undefined') {
      worker.port.emit(requestId, 'SUCCESS', serverkey);
    } else {
      worker.port.emit(requestId, 'ERROR');
    }
  });

  /* ==================================================================================
   *  Import Key & Sync' events
   * ================================================================================== */

  /*
   * Check the private key passphrase.
   *
   * @listens passbolt.keyring.private.checkpassphrase
   * @param requestId {uuid} The request identifier
   * @param passphrase {string} The passphrase to check
   */
  worker.port.on('passbolt.keyring.private.checkpassphrase', async function (requestId, passphrase) {
    try {
      await keyring.checkPassphrase(passphrase);
      worker.port.emit(requestId, 'SUCCESS');
    } catch (error) {
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /* ==================================================================================
   *  Backups key events
   * ================================================================================== */

  /*
   * Offer to users to download their public key
   *
   * @listens passbolt.keyring.download-my-public-key
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.keyring.download-my-public-key', async function (requestId) {
    let publicKeyArmored;
    let filename = "passbolt_public.asc";
    try {
      const privateKeyInfo = await keyring.findPrivate();
      if (privateKeyInfo) {
        publicKeyArmored = await keyring.extractPublicKey(privateKeyInfo.key);
      }
      if (!publicKeyArmored) {
        throw new Error('Public key not found.');
      }
      await fileController.saveFile(filename, publicKeyArmored, "text/plain", worker.tab.id);
      worker.port.emit(requestId, 'SUCCESS');
    } catch(error) {
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
 * Offer to users to download their private key
 *
 * @listens passbolt.keyring.download-my-private-key
 * @param requestId {uuid} The request identifier
 */
  worker.port.on('passbolt.keyring.download-my-private-key', async function (requestId) {
    let filename = "passbolt_private.asc";
    try {
      await passphraseController.request(worker);
      const privateKeyInfo = await keyring.findPrivate();
      if (!privateKeyInfo) {
        throw new Error('Private key not found.');
      }
      await fileController.saveFile(filename, privateKeyInfo.key, "text/plain", worker.tab.id);
      worker.port.emit(requestId, 'SUCCESS');
    } catch(error) {
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

};
exports.listen = listen;
