/**
 * Keyring events
 * @TODO refactor with public and private listeners separate
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var __ = require('../sdk/l10n').get;

var Keyring = require('../model/keyring').Keyring;
var Key = require('../model/key').Key;
var Config = require('../model/config');
var User = require('../model/user').User;
var keyring = new Keyring();
var key = new Key();

var fileController = require('../controller/fileController');

var listen = function (worker) {

  /* ==================================================================================
   *  Get Key info events
   * ================================================================================== */

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
   * Get the user private key object
   *
   * @listens passbolt.keyring.private.get
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.keyring.private.get', function (requestId) {
    var info = keyring.findPrivate();
    if (typeof info !== 'undefined') {
      worker.port.emit(requestId, 'SUCCESS', info);
    } else {
      worker.port.emit(requestId, 'ERROR');
    }
  });

  /*
   * Get the user public key in armored format
   *
   * @listens passbolt.keyring.public.get_armored
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.keyring.public.get_armored', function (requestId) {
    var info = keyring.findPrivate();
    if (typeof info !== 'undefined') {
      var publicKeyArmored = keyring.extractPublicKey(info.key);
      if (typeof publicKeyArmored !== 'undefined') {
        return worker.port.emit(requestId, 'SUCCESS', publicKeyArmored);
      }
    }
    worker.port.emit(requestId, 'ERROR');
  });

  /*
   * Get the server's public key.
   *
   * @listens passbolt.keyring.server.get
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.keyring.server.get', function (requestId) {

    var user = User.getInstance(),
      Crypto = require('../model/crypto').Crypto,
      serverkeyid = Crypto.uuid(user.settings.getDomain()),
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
  worker.port.on('passbolt.keyring.public.extract', function (requestId, privateKeyArmored) {
    var publicKeyArmored = keyring.extractPublicKey(privateKeyArmored);
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
      var validate = key.validate(keyData, fields);
      worker.port.emit(requestId, 'SUCCESS', validate);
    } catch (e) {
      worker.port.emit(requestId, 'ERROR', e.message, e.validationErrors);
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
  worker.port.on('passbolt.keyring.private.import', function (requestId, privateKeyArmored) {
    keyring.importPrivate(privateKeyArmored).then(function() {
      worker.port.emit(requestId, 'SUCCESS');
    }, function(error) {
      worker.port.emit(requestId, 'ERROR', privateKeyArmored);
    });
  });

  /*
   * Import the server public armored key.
   *
   * @listens passbolt.keyring.server.import
   * @param requestId {uuid} The request identifier
   * @param publicKeyArmored {string} The public armored key to import
   */
  worker.port.on('passbolt.keyring.server.import', function (requestId, publicKeyArmored) {
      var user = User.getInstance();
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
  worker.port.on('passbolt.keyring.private.checkpassphrase', function (requestId, passphrase) {
    keyring.checkPassphrase(passphrase).then(
      function () {
        worker.port.emit(requestId, 'SUCCESS');
      },
      function (error) {
        console.error(error);
        worker.port.emit(requestId, 'ERROR', __('This is not a valid passphrase'));
      }
    );
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
    if (filename == undefined) {
      filename = 'passbolt.asc';
    }
    // If debug mode is enabled, add .txt at the end of filename.
    if (Config.isDebug() == true) {
      filename += '.txt';
    }

    fileController.saveFile(filename, key, worker.tab.id)
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

};
exports.listen = listen;