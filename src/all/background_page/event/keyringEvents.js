/**
 * Keyring events
 * @TODO refactor with public and private listeners separate
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const __ = require('../sdk/l10n').get;
const {Keyring} = require('../model/keyring');
const {Key} = require('../model/key');
const Config = require('../model/config');
const {User} = require('../model/user');
const Uuid = require('../utils/uuid');
const keyring = new Keyring();
const key = new Key();

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
   * Get the public key information.
   *
   * @listens passbolt.keyring.public.info
   * @param requestId {uuid} The request identifier
   * @param publicKeyArmored {string} The public key
   */
  worker.port.on('passbolt.keyring.public.info', function (requestId, publicKeyArmored) {
    keyring.keyInfo(publicKeyArmored).then(function (info) {
      if (typeof info !== 'undefined') {
        worker.port.emit(requestId, 'SUCCESS', info);
      } else {
        worker.port.emit(requestId, 'ERROR', __('No key information provided'));
      }
    }, function(error) {
      worker.port.emit(requestId, 'ERROR', error.message);
    });
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

  /*
   * Extract the public key from a private armored key.
   *
   * @listens passbolt.keyring.public.extract
   * @param requestId {uuid} The request identifier
   * @param privateKeyArmored {string} The private armored key
   */
  worker.port.on('passbolt.keyring.public.extract', async function (requestId, privateKeyArmored) {
    const publicKeyArmored = await keyring.extractPublicKey(privateKeyArmored);
    if (typeof publicKeyArmored !== 'undefined') {
      worker.port.emit(requestId, 'SUCCESS', publicKeyArmored);
    } else {
      worker.port.emit(requestId, 'ERROR');
    }
  });

  /*
   * Validate the key information.
   *
   * @listens passbolt.keyring.key.validate
   * @param requestId {uuid} The request identifier
   * @param keyData {array} The key information
   * @param fields {array} The names of the variable to validate
   */
  worker.port.on('passbolt.keyring.key.validate', function (requestId, keyData, fields) {
    try {
      const validate = key.validate(keyData, fields);
      worker.port.emit(requestId, 'SUCCESS', validate);
    } catch (e) {
      worker.port.emit(requestId, 'ERROR', e);
    }
  });

  /* ==================================================================================
   *  Import Key & Sync' events
   * ================================================================================== */

  /*
   * Import the user private armored key.
   *
   * @listens passbolt.keyring.private.import
   * @param requestId {uuid} The request identifier
   * @param privateKeyArmored {string} The private armored key to import
   */
  worker.port.on('passbolt.keyring.private.import', async function (requestId, privateKeyArmored) {
    try {
      await keyring.importPrivate(privateKeyArmored);
      const publicKeyArmored = await keyring.extractPublicKey(privateKeyArmored);
      const user = User.getInstance();
      await keyring.importPublic(publicKeyArmored, user.get().id);
      worker.port.emit(requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', privateKeyArmored);
    }
  });

  /*
   * Import the server public armored key.
   *
   * @listens passbolt.keyring.server.import
   * @param requestId {uuid} The request identifier
   * @param publicKeyArmored {string} The public armored key to import
   */
  worker.port.on('passbolt.keyring.server.import', function (requestId, publicKeyArmored) {
      const user = User.getInstance();
      keyring.importServerPublicKey(publicKeyArmored, user.settings.getDomain()).then(function() {
        worker.port.emit(requestId, 'SUCCESS');
      }, function (error) {
        worker.port.emit(requestId, 'ERROR', error.message)
      });
  });

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
   *  Generate and backups key events
   * ================================================================================== */

  /*
   * Offer to the user to backup their key by downloading it.
   *
   * @listens passbolt.keyring.key.backup
   * @param requestId {uuid} The request identifier
   * @param key {string} The key to backup
   * @param filename {string} The filename to use for the downloadable file
   */
  worker.port.on('passbolt.keyring.key.backup', function (requestId, key, filename) {
    if (filename === undefined) {
      filename = 'passbolt.asc';
    }
    // If debug mode is enabled, add .txt at the end of filename.
    if (Config.isDebug() === true) {
      filename += '.txt';
    }

    fileController.saveFile(filename, key, "text/plain", worker.tab.id)
      .then(function () {
        worker.port.emit(requestId, 'SUCCESS');
      }, function () {
        worker.port.emit(requestId, 'ERROR');
      });
  });

  /*
   * Generate a private armored key.
   *
   * @listens passbolt.keyring.generateKeyPair
   * @param requestId {uuid} The request identifier
   * @param keyInfo {array} The key parameters
   * @param passphrase {string} The key passphrase
   */
  worker.port.on('passbolt.keyring.generateKeyPair', function (requestId, keyInfo, passphrase) {
    try {
      keyring.generateKeyPair(keyInfo, passphrase)
        .then(
          function (key) {
            worker.port.emit(requestId, 'SUCCESS', key);
          },
          function (errorMsg) {
            worker.port.emit(requestId, 'ERROR', errorMsg);
          });

    } catch (e) {
      worker.port.emit(requestId, 'ERROR', e.message);
    }
  });

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
