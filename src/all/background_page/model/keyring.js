"use strict";
/**
 * Keyring model.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const __ = require('../sdk/l10n').get;
const UserSettings = require('./userSettings').UserSettings;
const Key = require('./key').Key;
const Uuid = require('../utils/uuid');

/**
 * The class that deals with Passbolt Keyring.
 */
const Keyring = function () {
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
 * @returns {object}
 */
Keyring.getPrivateKeys = function() {
  // Get the private keys from the local storage.
  const pvtSerialized = storage.getItem(Keyring.STORAGE_KEY_PRIVATE);
  if (pvtSerialized) {
    return JSON.parse(pvtSerialized);
  }
  return {};
};

/**
 * Get stored public keys.
 *
 * @returns {Object} a collection of key as in {userUuid: Key, ...}
 */
Keyring.getPublicKeys = function () {
  // Get the public keys from the local storage.
  const pubSerialized = storage.getItem(Keyring.STORAGE_KEY_PUBLIC);
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
  if (type !== Keyring.PUBLIC && type !== Keyring.PRIVATE) {
    throw new Error(__('Key type is incorrect'));
  }
  let key = (type === Keyring.PRIVATE) ? Keyring.STORAGE_KEY_PRIVATE : Keyring.STORAGE_KEY_PUBLIC;
  storage.setItem(key, JSON.stringify(keys));
};

/**
 * Flush the Keyring and mark the keyring as not in sync.
 *
 * @param type {string} The type of keys to flush : Keyring.PRIVATE or Keyring.PUBLIC.
 *  Default Keyring.PUBLIC.
 */
Keyring.prototype.flush = function (type) {
  if (typeof type === 'undefined') {
    type = Keyring.PUBLIC;
  }

  if (type === Keyring.PUBLIC) {
    this.store(Keyring.PUBLIC, {});
  } else if (type === Keyring.PRIVATE) {
    this.store(Keyring.PRIVATE, {});
  }

  // Removed latestSync variable.
  // We consider that the keyring has never been synced.
  storage.removeItem('latestSync');
};

/**
 * Parse a text block with one or more keys and extract the Public or Private armoredkey.
 *
 * @param armoredKey {string} The key to parse.
 * @param type {string} The type of keys to parse : Keyring.PRIVATE or Keyring.PUBLIC.
 *  Default Keyring.PRIVATE.
 * @returns {string}
 */
Keyring.findArmoredKeyInText = function (armoredKey, type) {
  let headerPos, footerPos;

  if (type === Keyring.PUBLIC) {
    // Check if we find the public header & footer.
    headerPos = armoredKey.indexOf(Keyring.PUBLIC_HEADER);
    if (headerPos !== -1) {
      footerPos = armoredKey.indexOf(Keyring.PUBLIC_FOOTER);
      if (footerPos !== -1) {
        return armoredKey.substr(headerPos, footerPos + Keyring.PUBLIC_FOOTER.length);
      }
    }
  } else if (type === Keyring.PRIVATE) {
    // Check if we find the private header & footer.
    headerPos = armoredKey.indexOf(Keyring.PRIVATE_HEADER);
    if (headerPos !== -1) {
      footerPos = armoredKey.indexOf(Keyring.PRIVATE_FOOTER);
      if (footerPos !== -1) {
        armoredKey = armoredKey.substr(headerPos, footerPos + Keyring.PRIVATE_HEADER.length);
      }
    }
  }

  return armoredKey;
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
  armoredPublicKey = Keyring.findArmoredKeyInText(armoredPublicKey, Keyring.PUBLIC);

  // Is the given key a valid pgp key ?
  const publicKey = await openpgp.key.readArmored(armoredPublicKey);
  if (publicKey.err) {
    throw new Error(publicKey.err[0].message);
  }

  // If the key is not public, return an error.
  const primaryPublicKey = publicKey.keys[0];
  if (!primaryPublicKey.isPublic()) {
    throw new Error(__('Expected a public key but got a private key instead'));
  }

  // Get the keyInfo.
  let keyInfo = await this.keyInfo(armoredPublicKey);

  // Add the key in the keyring.
  let publicKeys = Keyring.getPublicKeys();
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
  armoredKey = Keyring.findArmoredKeyInText(armoredKey, Keyring.PRIVATE);

  // Is the given key a valid pgp key ?
  let privateKey = await openpgp.key.readArmored(armoredKey);
  if (privateKey.err) {
    throw new Error(privateKey.err[0].message);
  }

  // If the key is not private, return an error.
  privateKey = privateKey.keys[0];
  if (!privateKey.isPrivate()) {
    throw new Error(__('Expected a private key but got a public key instead'));
  }

  // Get the keyInfo.
  let keyInfo = await this.keyInfo(armoredKey);

  // Add the key in the keyring
  let privateKeys = Keyring.getPrivateKeys();
  privateKeys[Keyring.MY_KEY_ID] = keyInfo;
  privateKeys[Keyring.MY_KEY_ID].user_id = Keyring.MY_KEY_ID;
  this.store(Keyring.PRIVATE, privateKeys);

  return true;
};

/**
 * Import the server public armored key.
 *
 * @param armoredKey {string} The key to import
 * @param domain {string} The server domain url
 * @returns {bool}
 * @throw Error if the key cannot be imported
 */
Keyring.prototype.importServerPublicKey = async function (armoredKey, domain) {
  const serverKeyId = Uuid.get(domain);
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
  let key = await openpgp.key.readArmored(armoredKey);
  if (key.err) {
    throw new Error(key.err[0].message);
  }
  key = key.keys[0];

  // Check the userIds
  let userIds = key.getUserIds(),
    userIdsSplited = [];
  if(userIds.length === 0) {
    throw new Error('No key user ID found');
  }

  // Extract name & email from key userIds.
  let i, match, myRegexp = XRegExp(/(.*) <(\S+@\S+)>$/g);
  for (i in userIds) {
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
  let keyid = key.primaryKey.getKeyId().toHex();
  if (keyid.length > 8) {
    keyid = keyid.substr(keyid.length - 8);
  }

  // Format expiration time
  let expirationTime, created;
  try {
    expirationTime = await key.getExpirationTime();
    expirationTime = expirationTime.toString();
    if (expirationTime === 'Infinity') {
      expirationTime = __('Never');
    }
    created = key.primaryKey.created.toString();
  } catch(error) {
    expirationTime = null;
  }

  return {
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
};

/**
 * Extract a public armored key from a private armored key.
 *
 * @param privateArmoredKey {string} The private key armored
 * @returns {string}
 */
Keyring.prototype.extractPublicKey = async function (privateArmoredKey) {
  const key = await openpgp.key.readArmored(privateArmoredKey);
  return key.keys[0].toPublic().armor();
};

/**
 * Get a public key by its fingerprint.
 *
 * @param userId {string} uuid
 * @returns {Key}
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
 * @returns {Key}
 */
Keyring.prototype.findPrivate = function () {
  const userId = Keyring.MY_KEY_ID;
  const privateKeys = Keyring.getPrivateKeys();
  return privateKeys[userId];
};

/**
 * Generate a key pair based on given key settings.
 *
 * @param keyInfo {array} The key settings
 * @param passphrase {string} The key passphrase
 * @returns {Promise.<Object>}
 */
Keyring.prototype.generateKeyPair = function (keyInfo, passphrase) {
  // Get user id from key info.
  const key = new Key();
  key.set(keyInfo);

  // Launch key pair generation from openpgp worker.
  return openpgp.generateKey({
    numBits: keyInfo.length,
    userIds: key.getUserId(),
    passphrase: passphrase
  });
};

/**
 * Check if the passphrase is valid for the user private key.
 *
 * @param passphrase {string} The key passphrase
 * @returns {Promise}
 */
Keyring.prototype.checkPassphrase = async function (passphrase) {
  const privateKey = this.findPrivate();
  const privKeyObj = (await openpgp.key.readArmored(privateKey.key)).keys[0];
  if (!privKeyObj.isDecrypted()) {
    await privKeyObj.decrypt(passphrase);
  }
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
