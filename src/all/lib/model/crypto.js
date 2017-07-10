/**
 * Crypto model.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

const { defer } = require('../sdk/core/promise');

// var openpgp = require('../vendors/openpgp');
// var XRegExp = require('../vendors/xregexp').XRegExp;
// var Validator = require('../vendors/validator');
// var jsSHA = require('../vendors/sha');

var Keyring = require('./keyring').Keyring;
var __ = require('../sdk/l10n').get;
// var randomBytes = require('../vendors/crypto').randomBytes;

/**
 * The class that deals with Passbolt encryption and decryption operations.
 */
var Crypto = function () {
};

/**
 * Generate a random text.
 * @param size {int} The desired random text size.
 * @returns {string}
 */
Crypto.generateRandomHex = function (size) {
  var text = '';
  var possible = 'ABCDEF0123456789';
  var random_array = randomBytes(size);
  for (var i = size; i > 0; i--) {
    text += possible.charAt(Math.floor(random_array[i] % possible.length));
  }
  return text;
};

/**
 * Generate a random uuid.
 * @param seed {string} (optional) The seed to use to generate a predictable uuid
 *  based on its sha1 hashed
 * @returns {string}
 */
Crypto.uuid = function (seed) {
  var hashStr;

  // Generate a random hash if no seed is provided
  if (typeof seed === 'undefined') {
    hashStr = Crypto.generateRandomHex(32);
  }
  else {
    // Create SHA hash from seed.
    var shaObj = new jsSHA('SHA-1', 'TEXT');
    shaObj.update(seed);
    hashStr = shaObj.getHash('HEX').substring(0, 32);
  }
  // Build a uuid based on the hash
  var search = XRegExp('^(?<first>.{8})(?<second>.{4})(?<third>.{1})(?<fourth>.{3})(?<fifth>.{1})(?<sixth>.{3})(?<seventh>.{12}$)');
  var replace = XRegExp('${first}-${second}-3${fourth}-a${sixth}-${seventh}');

  // Replace regexp by corresponding mask, and remove / character at each side of the result.
  var uuid = XRegExp.replace(hashStr, search, replace).replace(/\//g, '');
  return uuid;
};

/**
 * Encrypt a text for a given user id (or an armored key)
 * @param message {string} The text to encrypt
 * @param key {string} The user id or public armored key
 * @return {promise}
 * @throw Exception
 *   in case of key not found, or problem during encryption.
 */
Crypto.prototype.encrypt = function (message, key) {
  var keyring = new Keyring(),
    publicKey = null,
    deferred = defer();

  // if the key is a uuid we get the armored version from the keyring
  if (Validator.isUUID(key)) {
    var keyInfo = keyring.findPublic(key);
    if (!keyInfo) {
      deferred.reject(new Error(__('The public key could not be found for the user')));
      return deferred.promise;
    }
    key = keyInfo.key;
  }

  // parse the armored key
  try {
    publicKey = openpgp.key.readArmored(key);
  } catch (error) {
    return deferred.reject(new Error(__('The public key is not in a valid or supported format.')));
  }

  // Encrypt message.
  openpgp.encrypt({
    publicKeys: publicKey.keys,
    data: message
  }).then(
    function (encrypted) {
      return deferred.resolve(encrypted.data);
    },
    function (error) {
      return deferred.reject(error);
    }
  );

  // Encrypt message.
  return deferred.promise;
};

/**
 * Decrypt an armored text.
 * @param armored The text to decrypt.
 * @param passphrase (optional) The passphrase used to decrypt the private key.
 * @throw Error if something goes wrong in openpgp methods
 * @return promise
 */
Crypto.prototype.decrypt = function (armored, passphrase) {
  var keyring = new Keyring(),
    keyInfo = keyring.findPrivate(),
    privateKey = openpgp.key.readArmored(keyInfo.key).keys[0],
    deferred = defer(),
    self = this;

  if (!privateKey.isDecrypted) {
    openpgp.decryptKey({privateKey: privateKey, passphrase: passphrase})
      .then(function (privateKey) {
        // Openpgp will throw an exception if the message is badly formatted
        var pgpMessage = openpgp.message.readArmored(armored);
        return openpgp.decrypt({privateKey: privateKey.key, message: pgpMessage});
      })
      .then(
        function (decrypted) {
          deferred.resolve(decrypted.data);
        },
        function (error) {
          deferred.reject(error);
        }
      );
  }
  else {
    openpgp.decrypt({privateKey: privateKey, message: pgpMessage})
      .then(
        function (decrypted) {
          deferred.resolve(decrypted.data);
        },
        function (error) {
          deferred.reject(error);
        }
      );
  }

  return deferred.promise;
};

// Make the object available to other scripts
exports.Crypto = Crypto;
