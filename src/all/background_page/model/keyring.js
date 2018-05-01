/**
 * Keyring model.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var __ = require('../sdk/l10n').get;
var UserSettings = require('./userSettings').UserSettings;
var Key = require('./key').Key;
var keyring = new openpgp.Keyring();

/**
 * The class that deals with Passbolt Keyring.
 */
var Keyring = function () {
};

/**
 * Constants
 * @type {string}
 */
Keyring.PUBLIC_HEADER = '-----BEGIN PGP PUBLIC KEY BLOCK-----';
Keyring.PUBLIC_FOOTER = '-----END PGP PUBLIC KEY BLOCK-----';
Keyring.PRIVATE_HEADER = '-----BEGIN PGP PRIVATE KEY BLOCK-----';
Keyring.PRIVATE_FOOTER = '-----END PGP PRIVATE KEY BLOCK-----';
Keyring.PUBLIC = 'PUBLIC';
Keyring.PRIVATE = 'PRIVATE';
Keyring.MY_KEY_ID = 'MY_KEY_ID'; // @TODO use user.id instead
Keyring.STORAGE_KEY_PUBLIC = 'passbolt-public-gpgkeys';
Keyring.STORAGE_KEY_PRIVATE = 'passbolt-private-gpgkeys';

/**
 * Get private keys.
 *
 * @returns {*}
 */
Keyring.getPrivateKeys = function() {
  // Get the private keys from the local storage.
  var pvtSerialized = storage.getItem(Keyring.STORAGE_KEY_PRIVATE);
  if (pvtSerialized === null) {
    return {};
  } else {
    return JSON.parse(pvtSerialized);
  }
};

/**
 * Get stored public keys.
 *
 * @returns {array}
 */
Keyring.getPublicKeys = function () {
  // Get the public keys from the local storage.
  var pubSerialized = storage.getItem(Keyring.STORAGE_KEY_PUBLIC);
  if (pubSerialized) {
    return JSON.parse(pubSerialized);
  }
  return {};
};

/**
 * Store keys in the local storage.
 *
 * @param type {string} The keys type : Keyring.PRIVATE or Keyring.PUBLIC
 * @param keys {array} The list of keys to store
 */
Keyring.prototype.store = function (type, keys) {
  if (type != Keyring.PUBLIC && type != Keyring.PRIVATE) {
    throw new Error(__('Key type is incorrect'));
  }

  if (type == Keyring.PRIVATE) {
    storage_key = Keyring.STORAGE_KEY_PRIVATE;
  } else {
    storage_key = Keyring.STORAGE_KEY_PUBLIC;
  }

  storage.setItem(storage_key, JSON.stringify(keys));
};

/**
 * Flush the Keyring and mark the keyring as not in sync.
 *
 * @param type {string} The type of keys to flush : Keyring.PRIVATE or Keyring.PUBLIC.
 *  Default Keyring.PUBLIC.
 */
Keyring.prototype.flush = function (type) {
  if (typeof type == 'undefined') {
    type = Keyring.PUBLIC;
  }

  if (type == Keyring.PUBLIC) {
    this.store(Keyring.PUBLIC, {});
  }
  else if (type == Keyring.PRIVATE) {
    this.store(Keyring.PRIVATE, {});
  }

  // Removed latestSync variable.
  // We consider that the keyring has never been synced.
  storage.removeItem('latestSync');
};

/**
 * Parse an armored key and extract Public or Private sub string.
 *
 * @param armoredKey {string} The key to parse.
 * @param type {string} The type of keys to parse : Keyring.PRIVATE or Keyring.PUBLIC.
 *  Default Keyring.PRIVATE.
 * @returns {string}
 */
var parseArmoredKey = function (armoredKey, type) {
  // The type of key to parse. By default the PRIVATE.
  var type = type || Keyring.PRIVATE,
    // The parsed key. If no header found the output will be the input.
    key = armoredKey || '';

  if (type == Keyring.PUBLIC) {
    // Check if we find the public header & footer.
    var pubHeaderPos = armoredKey.indexOf(Keyring.PUBLIC_HEADER);
    if (pubHeaderPos != -1) {
      var pubFooterPos = armoredKey.indexOf(Keyring.PUBLIC_FOOTER);
      if (pubFooterPos != -1) {
        key = armoredKey.substr(pubHeaderPos, pubFooterPos + Keyring.PUBLIC_FOOTER.length);
      }
    }
  } else if (type == Keyring.PRIVATE) {
    // Check if we find the private header & footer.
    var privHeaderPos = armoredKey.indexOf(Keyring.PRIVATE_HEADER);
    if (privHeaderPos != -1) {
      var privFooterPos = armoredKey.indexOf(Keyring.PRIVATE_FOOTER);
      if (privFooterPos != -1) {
        key = armoredKey.substr(privHeaderPos, privFooterPos + Keyring.PRIVATE_HEADER.length);
      }
    }
  }

  return key;
};

/**
 * Import a public armored key.
 *
 * @param armoredPublicKey {string} The key to import
 * @param userId {string} The owner of the key
 * @returns {bool}
 * @throw Error
 *  if the key cannot be read by openpgp
 *  if the key is not public
 *  if the user id is not valid
 */
Keyring.prototype.importPublic = async function (armoredPublicKey, userId) {
  // Check user id
  if (typeof userId === 'undefined') {
    throw new Error(__('The user id is undefined'));
  }
  if (!Validator.isUUID(userId)) {
    throw new Error(__('The user id is not valid'));
  }

  // Parse the keys. If standard format given with a text containing
  // public/private. It will extract only the public.
  var armoredPublicKey = parseArmoredKey(armoredPublicKey, Keyring.PUBLIC);

  // Is the given key a valid pgp key ?
  var openpgpRes = openpgp.key.readArmored(armoredPublicKey);

  // Return the error in any case
  if (openpgpRes.err) {
    throw new Error(openpgpRes.err[0].message);
  }

  // If the key is not public, return an error.
  var key = openpgpRes.keys[0];
  if (!key.isPublic()) {
    throw new Error(__('Expected a public key but got a private key instead'));
  }

  // Get the keyInfo.
  var keyInfo = await this.keyInfo(armoredPublicKey);

  // Add the key in the keyring.
  var publicKeys = Keyring.getPublicKeys();
  publicKeys[userId] = keyInfo;
  publicKeys[userId].user_id = userId;
  this.store(Keyring.PUBLIC, publicKeys);

  return true;
};

/**
 * Import a private armored key.
 *
 * @param armoredKey {string} The key to import
 * @returns {bool}
 * @throw Error
 *  if the key cannot be read by openpgp
 *  if the key is not private
 */
Keyring.prototype.importPrivate = async function (armoredKey) {
  // Flush any existing private key.
  this.flush(Keyring.PRIVATE);

  // Parse the keys. If standard format given with a text containing
  // public/private. It will extract only the private.
  var armoredKey = parseArmoredKey(armoredKey, Keyring.PRIVATE);

  // Is the given key a valid pgp key ?
  var openpgpRes = openpgp.key.readArmored(armoredKey);

  // Return the error in any case
  if (openpgpRes.err) {
    throw new Error(openpgpRes.err[0].message);
  }

  // If the key is not private, return an error.
  var key = openpgpRes.keys[0];
  if (!key.isPrivate()) {
    throw new Error(__('Expected a private key but got a public key instead'));
  }

  // Get the keyInfo.
  var keyInfo = await this.keyInfo(armoredKey);

  // Add the key in the keyring
  var privateKeys = Keyring.getPrivateKeys();
  privateKeys[Keyring.MY_KEY_ID] = keyInfo;
  privateKeys[Keyring.MY_KEY_ID].user_id = Keyring.MY_KEY_ID;
  this.store(Keyring.PRIVATE, privateKeys);

  return true;
};

/**
 * Import the server public armored key.
 *
 * @param armoredPublicKey {string} The key to import
 * @param domain {string} The server domain url
 * @returns {bool}
 * @throw Error if the key cannot be imported
 */
Keyring.prototype.importServerPublicKey = async function (armoredKey, domain) {
  var Crypto = require('../model/crypto').Crypto;
  var serverKeyId = Crypto.uuid(domain);
  await this.importPublic(armoredKey, serverKeyId);
  return true;
};

/**
 * Get the key info.
 *
 * @param armoredKey {string} The key to examine
 * @return {array}
 * @throw Error if the key cannot be read by openpgp
 */
Keyring.prototype.keyInfo = async function(armoredKey) {
  // Attempt to read armored key.
  var openpgpRes = openpgp.key.readArmored(armoredKey);

  // In case of error, throw exception.
  if (openpgpRes.err) {
    throw new Error(openpgpRes.err[0].message);
  }

  var key = openpgpRes.keys[0],
    userIds = key.getUserIds(),
    userIdsSplited = [];

  if(userIds.length === 0) {
    throw new Error('No key user ID found');
  }

  // Extract name & email from key userIds.
  var myRegexp = XRegExp(/(.*) <(\S+@\S+)>$/g);
  var match;
  for (var i in userIds) {
    match = XRegExp.exec(userIds[i], myRegexp);
    if(match === null) {
      throw new Error('Error when parsing key user id');
    }
    userIdsSplited.push({
      name: match[1],
      email: match[2]
    });
  }

  // seems like opengpg keys id can be longer than 8 bytes (16 default?)
  var keyid = key.primaryKey.getKeyId().toHex();
  if (keyid.length > 8) {
    var shortid = keyid.substr(keyid.length - 8);
    keyid = shortid;
  }

  // Format expiration time
  try {
    var expirationTime = await key.getExpirationTime();
    expirationTime = expirationTime.toString();
    if (expirationTime === 'Infinity') {
      expirationTime = __('Never');
    }
    var created = key.primaryKey.created.toString();
  } catch(error) {
    expirationTime = null;
  }

  var info = {
    key: armoredKey,
    keyId: keyid,
    userIds: userIdsSplited,
    fingerprint: key.primaryKey.getFingerprint(),
    created: created,
    expires: expirationTime,
    algorithm: key.primaryKey.getAlgorithmInfo().algorithm,
    length: key.primaryKey.getAlgorithmInfo().bits,
    curve: key.primaryKey.getAlgorithmInfo().curve,
    private: key.isPrivate()
  };

  return info;
};

/**
 * Extract a public armored key from a private armored key.
 * @param privateArmoredKey {string} The private key armored
 * @returns {string}
 */
Keyring.prototype.extractPublicKey = function (privateArmoredKey) {
  var key = openpgp.key.readArmored(privateArmoredKey);
  var publicKey = key.keys[0].toPublic();
  return publicKey.armor();
};

/**
 * Get a public key by its fingerprint.
 *
 * @param userId {string) The key owner ids
 * @returns {OpenPgpKey}
 */
Keyring.prototype.findPublic = function (userId) {
  let i, publicKeys = Keyring.getPublicKeys();
  for (i in publicKeys) {
    if (publicKeys[i].user_id === userId) {
      return publicKeys[i];
    }
  }
  return undefined;
};

/**
 * Get a private key by its fingerprint.
 * We currently only support one private key per person
 *
 * @param userId {string} The key owner
 * @returns {OpenPgpKey}
 */
Keyring.prototype.findPrivate = function (userId) {
  if (typeof userId === 'undefined') {
    userId = Keyring.MY_KEY_ID;
  }
  var privateKeys = Keyring.getPrivateKeys();
  return privateKeys[userId];
};

/**
 * Generate a key pair based on given key settings.
 *
 * @param keyInfo {array} The key settings
 * @param passphrase {string} The key passphrase
 * @returns {Promise}
 */
Keyring.prototype.generateKeyPair = function (keyInfo, passphrase) {
  // Get user id from key info.
  var key = new Key();
  key.set(keyInfo);
  keyInfo.userId = key.getUserId();

  var keySettings = {
    numBits: keyInfo.length,
    userIds: keyInfo.userId,
    passphrase: passphrase
  };

  // Launch key pair generation from openpgp worker.
  var def = openpgp
    .generateKey(keySettings);

  return def;
};

/**
 * Check if the passphrase is valid for the user private key.
 *
 * @param passphrase {string} The key passphrase
 * @returns {Promise}
 */
Keyring.prototype.checkPassphrase = function (passphrase) {
  var _this = this;

  return new Promise( function(resolve, reject) {
    var keyInfo = _this.findPrivate(),
      privateKey = openpgp.key.readArmored(keyInfo.key).keys[0];

    if (!privateKey.primaryKey.isDecrypted) {
      openpgp.decryptKey({privateKey: privateKey, passphrase: passphrase})
        .then(
          function (decrypted) {
            resolve(decrypted);
          },
          function (error) {
            reject(error);
          }
        );
    } else {
      resolve();
    }
  });
};

/**
 * Sync the local keyring with the passbolt API.
 * Retrieve the latest updated Public Keys.
 *
 * @returns {Promise<int>} number of updated keys
 */
Keyring.prototype.sync = async function () {
  let latestSync = storage.getItem('latestSync');

  // Get the latest keys changes from the backend.
  let userSettings = new UserSettings();
  let url = userSettings.getDomain() + '/gpgkeys.json' + '?api-version=v1';

  // If a sync has already been performed.
  if (latestSync !== null) {
    url += '&modified_after=' + latestSync;
  }

  // Get the updated public keys from passbolt.
  let response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
  let json = await response.json();

  // Check response status
  if (!response.ok) {
    let msg = __('Could not synchronize the keyring. The server responded with an error.');
    if (json.header.msg) {
      msg += ' ' + json.header.msg;
    }
    msg += '(' + response.status + ')';
    throw new Error(msg);
  }
  // Update the latest synced time.
  if (!json.header) {
    throw new Error(__('Could not synchronize the keyring. The server response header is missing.'));
  }
  if (!json.body) {
    throw new Error(__('Could not synchronize the keyring. The server response body is missing.'));
  }

  // Store all the new keys in the keyring.
  let meta, armoredKey, i, imports = [];
  for (i in json.body) {
    meta = json.body[i];
    armoredKey = meta.Gpgkey.key || meta.Gpgkey.armored_key;
    imports.push(this.importPublic(armoredKey, meta.Gpgkey.user_id));
  }
  await Promise.all(imports);

  storage.setItem('latestSync', json.header.servertime);
  return (json.body.length);

};

// Exports the Keyring object.
exports.Keyring = Keyring;
