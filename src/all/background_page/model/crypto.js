/**
 * Crypto model.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var Keyring = require('./keyring').Keyring;
var __ = require('../sdk/l10n').get;
var randomBytes = require('../sdk/random').randomBytes;

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
    publicKey = null;

  return new Promise (function(resolve, reject) {
    // if the key is a uuid we get the armored version from the keyring
    if (Validator.isUUID(key)) {
      var keyInfo = keyring.findPublic(key);
      if (!keyInfo) {
        reject(new Error(__('The public key could not be found for the user')));
        return;
      }
      key = keyInfo.key;
    }

    // parse the armored key
    try {
      publicKey = openpgp.key.readArmored(key);
    } catch (error) {
      reject(new Error(__('The public key is not in a valid or supported format.')));
      return;
    }

    // Encrypt message.
    openpgp.encrypt({
      publicKeys: publicKey.keys,
      data: message
    }).then(
      function (encrypted) {
        resolve(encrypted.data);
      },
      function (error) {
        reject(error);
      }
    );
  });
};

/**
 * Encrypt an array of messages.
 * @param armored The text to decrypt.
 * @param passphrase (optional) The passphrase used to decrypt the private key.
 * @param startCallback The callback to execute each time the function start to encrypt a message
 * @param completeCallback The callback to execute each time the function complete to encrypt a message.
 * @throw Error if something goes wrong in openpgp methods
 * @return promise
 */
Crypto.prototype.encryptAll = function (data, completeCallback, startCallback) {
  var keyring = new Keyring();

  return new Promise(function (resolve, reject) {
    // Encrypt the secrets sequentially.
    // Chain all the encryption promises.
    var encryptChainPromise = data.reduce(function (promise, toEncrypt, position) {
      return promise.then(function (result) {

        var keyInfo = keyring.findPublic(toEncrypt.userId);
        var publicKey = openpgp.key.readArmored(keyInfo.key);
        if (startCallback) {
          startCallback(position);
        }
        // Encrypt the message.
        return openpgp.encrypt({publicKeys: publicKey.keys, data: toEncrypt.message})
          .then(function (encrypted) {
            if (completeCallback) {
              completeCallback(encrypted.data, toEncrypt.userId, position);
            }
            return [...result, encrypted.data];
          });
      });
    }, Promise.resolve([])); // Start the promises chain.

    // Once the encryption is done.
    encryptChainPromise.then(function(result){
      resolve(result);
    });
  });
};

/**
 * Decrypt a key.
 * @param armored The key to decrypt.
 * @param passphrase (optional) The passphrase used to decrypt the private key.
 * @throw Error if something goes wrong in openpgp methods
 * @return promise
 */
Crypto.prototype.decryptPrivateKey = function (privateKey, passphrase) {
  return new Promise(function (resolve, reject) {
    if (!privateKey.isDecrypted) {
      return openpgp.decryptKey({privateKey: privateKey, passphrase: passphrase})
        .then(function(privateKey) {
          resolve(privateKey);
        }, function(error) {
          reject(error);
        });
    } else {
      resolve(privateKey);
    }
  });
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
    privateKey = openpgp.key.readArmored(keyInfo.key).keys[0];

  return new Promise(function (resolve, reject) {
    if (!privateKey.isDecrypted) {
      openpgp.decryptKey({privateKey: privateKey, passphrase: passphrase})
        .then(function (privateKey) {
          // Openpgp will throw an exception if the message is badly formatted
          var pgpMessage = openpgp.message.readArmored(armored);
          return openpgp.decrypt({privateKey: privateKey.key, message: pgpMessage});
        })
        .then(
          function (decrypted) {
            resolve(decrypted.data);
          },
          function (error) {
            reject(error);
          }
        );
    } else {
      openpgp.decrypt({privateKey: privateKey, message: pgpMessage})
        .then(
          function (decrypted) {
            resolve(decrypted.data);
          },
          function (error) {
            reject(error);
          }
        );
    }
  });
};

/**
 * Decrypt an array of armored text.
 * @param armored The text to decrypt.
 * @param passphrase (optional) The passphrase used to decrypt the private key.
 * @param startCallback The callback to execute each time the function start to decrypt a secret.
 * @param completeCallback The callback to execute each time the function complete to decrypt a secret.
 * @throw Error if something goes wrong in openpgp methods
 * @return promise
 */
Crypto.prototype.decryptAll = function (armoreds, passphrase, completeCallback, startCallback) {
  var keyring = new Keyring(),
    keyInfo = keyring.findPrivate(),
    privateKey = openpgp.key.readArmored(keyInfo.key).keys[0];
    _this = this;

  return new Promise(function(resolve, reject) {
    // Decrypt the private key.
    _this.decryptPrivateKey(privateKey, passphrase)
      // Decrypt the list of armored messages.
      .then(function(privateKey) {
        // Decrypt the secrets sequentially.
        var decryptChainPromise = armoreds.reduce(function(promise, armored, position) {
          return promise.then(function(result) {
            var pgpMessage = openpgp.message.readArmored(armored);
            if(startCallback) {
              startCallback(position);
            }
            // Decrypt the secret.
            return openpgp.decrypt({privateKey: privateKey.key, message: pgpMessage})
              .then(function(decrypted) {
                if(completeCallback) {
                  completeCallback(decrypted.data, position);
                }
                return [...result, decrypted.data];
              });
          });
        }, Promise.resolve([])); // Start the promises chain.

        // Once the decryption is done.
        decryptChainPromise.then(function(result){
          resolve(result);
        });
      });
  });
};

// Make the object available to other scripts
exports.Crypto = Crypto;
