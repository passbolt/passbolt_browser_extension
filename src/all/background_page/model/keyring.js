/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SARL (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         2.0.0
 */
const __ = require('../sdk/l10n').get;
const Uuid = require('../utils/uuid');

const {InvalidMasterPasswordError} = require('../error/invalidMasterPasswordError');
const {UserSettings} = require('./userSettings/userSettings');
const {Key} = require('./key');

const {goog} = require('../utils/format/emailaddress');

/**
 * Constants
 * @type {string}
 */
const PUBLIC_HEADER = '-----BEGIN PGP PUBLIC KEY BLOCK-----';
const PUBLIC_FOOTER = '-----END PGP PUBLIC KEY BLOCK-----';
const PRIVATE_HEADER = '-----BEGIN PGP PRIVATE KEY BLOCK-----';
const PRIVATE_FOOTER = '-----END PGP PRIVATE KEY BLOCK-----';
const PUBLIC = 'PUBLIC';
const PRIVATE = 'PRIVATE';
const MY_KEY_ID = 'MY_KEY_ID';
const STORAGE_KEY_PUBLIC = 'passbolt-public-gpgkeys';
const STORAGE_KEY_PRIVATE = 'passbolt-private-gpgkeys';

/**
 * The class that deals with Passbolt Keyring.
 */
class Keyring {
  // ==================================================
  // FINDERS
  // ==================================================
  /**
   * Get a public key by its fingerprint.
   *
   * @param {string} userId uuid
   * @returns {Key|undefined}
   */
  findPublic(userId) {
    let i, publicKeys = this.getPublicKeysFromStorage();
    for (i in publicKeys) {
      if (publicKeys.hasOwnProperty(i) && publicKeys[i].user_id === userId) {
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
  findPrivate() {
    const userId = Keyring.MY_KEY_ID;
    const privateKeys = this.getPrivateKeysFromStorage();
    return privateKeys[userId];
  };

  // ==================================================
  // IMPORT
  // ==================================================
  /**
   * Import a public armored key.
   *
   * @param {string} armoredPublicKey The key to import
   * @param {string} userId The owner of the key
   * @returns {bool}
   * @throw Error
   *  if the key cannot be read by openpgp
   *  if the key is not public
   *  if the user id is not valid
   */
  async importPublic(armoredPublicKey, userId) {
    // Check user id
    if (typeof userId === 'undefined') {
      throw new Error(__('The user id is undefined'));
    }
    if (!Validator.isUUID(userId)) {
      throw new Error(__('The user id is not valid'));
    }

    // Parse the keys. If standard format given with a text containing
    // public/private. It will extract only the public.
    armoredPublicKey = this.findArmoredKeyInText(armoredPublicKey, Keyring.PUBLIC);

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
    let publicKeys = this.getPublicKeysFromStorage();
    publicKeys[userId] = keyInfo;
    publicKeys[userId].user_id = userId;
    this.store(Keyring.PUBLIC, publicKeys);

    return true;
  }

  /**
   * Import a private armored key.
   *
   * @param {string} armoredKey The key to import
   * @returns {bool}
   * @throw Error
   *  if the key cannot be read by openpgp
   *  if the key is not private
   */
  async importPrivate(armoredKey) {
    // Flush any existing private key.
    this.flush(Keyring.PRIVATE);

    // Parse the keys. If standard format given with a text containing
    // public/private. It will extract only the private.
    armoredKey = this.findArmoredKeyInText(armoredKey, Keyring.PRIVATE);

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
    let privateKeys = this.getPrivateKeysFromStorage();
    privateKeys[Keyring.MY_KEY_ID] = keyInfo;
    privateKeys[Keyring.MY_KEY_ID].user_id = Keyring.MY_KEY_ID;
    this.store(Keyring.PRIVATE, privateKeys);

    return true;
  };

  /**
   * Import the server public armored key.
   *
   * @param {string} armoredKey The key to import
   * @param {string} domain The server domain url
   * @returns {bool}
   * @throw Error if the key cannot be imported
   */
  async importServerPublicKey(armoredKey, domain) {
    const serverKeyId = Uuid.get(domain);
    await this.importPublic(armoredKey, serverKeyId);
    return true;
  }

  // ==================================================
  // PARSING AND KEY INFO
  // ==================================================
  /**
   * Parse a text block with one or more keys and extract the Public or Private armoredkey.
   *
   * @param armoredKey {string} The key to parse.
   * @param type {string} The type of keys to parse : Keyring.PRIVATE or Keyring.PUBLIC.
   *  Default Keyring.PRIVATE.
   * @returns {string}
   */
  findArmoredKeyInText(armoredKey, type) {
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
   * Get the key info.
   *
   * @param {string} armoredKey The key to examine
   * @return {array}
   * @throw Error if the key cannot be read by openpgp
   */
  async keyInfo (armoredKey) {
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

    for (let i in userIds) {
      if (userIds.hasOwnProperty(i)) {
        const result = goog.format.EmailAddress.parse(userIds[i]);
        userIdsSplited.push({
          name: result.name_,
          email: result.address_
        });
      }
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
      key: key.armor(),
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
  }

  /**
   * Extract a public armored key from a private armored key.
   *
   * @param {string} privateArmoredKey The private key armored
   * @returns {string}
   */
  async extractPublicKey(privateArmoredKey) {
    const key = await openpgp.key.readArmored(privateArmoredKey);
    return key.keys[0].toPublic().armor();
  };

  /**
   * Check if a key is expired.
   * @param {string} armoredKey The key to check
   * @returns {Promise<boolean>}
   */
  async keyIsExpired(armoredKey) {
    let key = await openpgp.key.readArmored(armoredKey);
    if (key.err) {
      throw new Error(key.err[0].message);
    }

    key = key.keys[0];
    let expirationTime;
    try {
      expirationTime = await key.getExpirationTime();
    } catch(error) {
      return false;
    }

    if (expirationTime === Infinity) {
      return false;
    }

    const expirationDate = new Date(expirationTime.toString());
    const now = Date.now();

    return expirationDate < now;
  }

  /**
   * Check if the passphrase is valid for the user private key.
   *
   * @param {string} passphrase The key passphrase
   * @returns {Promise}
   * @todo move to Crypto
   */
  async checkPassphrase (passphrase) {
    const privateKey = this.findPrivate();
    const privKeyObj = (await openpgp.key.readArmored(privateKey.key)).keys[0];
    if (!privKeyObj.isDecrypted()) {
      try {
        await privKeyObj.decrypt(passphrase);
      } catch (error) {
        throw new InvalidMasterPasswordError();
      }
    }
  }

  // ==================================================
  // SERVER SYNC
  // @TODO move to a dedicated service
  // ==================================================
  /**
   * Sync the local keyring with the passbolt API.
   * Retrieve the latest updated Public Keys.
   *
   * @returns {Promise<int>} number of updated keys
   */
  async sync () {
    let latestSync = storage.getItem('latestSync');

    // Get the latest keys changes from the backend.
    let userSettings = new UserSettings();
    let url = userSettings.getDomain() + '/gpgkeys.json' + '?api-version=v2';

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
      if (json.body.hasOwnProperty(i)) {
        meta = json.body[i];
        imports.push(this.importPublic(meta.armored_key, meta.user_id));
      }
    }
    await Promise.all(imports);

    storage.setItem('latestSync', json.header.servertime);

    return (json.body.length);
  }

  // ==================================================
  // STORAGE
  // @TODO move to a dedicated service
  // ==================================================
  /**
   * Store keys in the local storage.
   *
   * @param {string} type The keys type : Keyring.PRIVATE or Keyring.PUBLIC
   * @param {array} keys The list of keys to store
   * @return void
   */
  store(type, keys) {
    if (type !== Keyring.PUBLIC && type !== Keyring.PRIVATE) {
      throw new Error(__('Key type is incorrect'));
    }
    let key = (type === Keyring.PRIVATE) ? Keyring.STORAGE_KEY_PRIVATE : Keyring.STORAGE_KEY_PUBLIC;
    storage.setItem(key, JSON.stringify(keys));
  }

  /**
   * Get private keys.
   *
   * @returns {object}
   */
  getPrivateKeysFromStorage() {
    // Get the private keys from the local storage.
    const pvtSerialized = storage.getItem(Keyring.STORAGE_KEY_PRIVATE);
    if (pvtSerialized) {
      return JSON.parse(pvtSerialized);
    }
    return {};
  }

  /**
   * Get stored public keys.
   *
   * @returns {Object} a collection of key as in {userUuid: Key, ...}
   */
  getPublicKeysFromStorage () {
    // Get the public keys from the local storage.
    const pubSerialized = storage.getItem(Keyring.STORAGE_KEY_PUBLIC);
    if (pubSerialized) {
      return JSON.parse(pubSerialized);
    }
    return {};
  }

  /**
   * Flush the Keyring and mark the keyring as not in sync.
   *
   * @param type {string} The type of keys to flush : Keyring.PRIVATE or Keyring.PUBLIC.
   *  Default Keyring.PUBLIC.
   */
  flush (type) {
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
  }

  // ==================================================
  // CONSTANT GETTERS
  // ==================================================
  /**
   * Keyring.MY_KEY_ID
   * @returns {string}
   */
  static get MY_KEY_ID() {
    // @TODO use user.id instead
    return MY_KEY_ID;
  }

  /**
   * Keyring.PUBLIC_HEADER
   * @returns {string}
   */
  static get PUBLIC_HEADER() {
    return PUBLIC_HEADER;
  }

  /**
   * Keyring.PUBLIC_FOOTER
   * @returns {string}
   */
  static get PUBLIC_FOOTER() {
    return PUBLIC_FOOTER;
  }

  /**
   * Keyring.PRIVATE_HEADER
   * @returns {string}
   */
  static get PRIVATE_HEADER() {
    return PRIVATE_HEADER;
  }

  /**
   * Keyring.PRIVATE_FOOTER
   * @returns {string}
   */
  static get PRIVATE_FOOTER() {
    return PRIVATE_FOOTER;
  }

  /**
   * Keyring.PUBLIC
   * @returns {string}
   */
  static get PUBLIC() {
    return PUBLIC;
  }

  /**
   * Keyring.PRIVATE
   * @returns {string}
   */
  static get PRIVATE() {
    return PRIVATE;
  }

  /**
   * Keyring.STORAGE_KEY_PUBLIC
   * @returns {string}
   */
  static get STORAGE_KEY_PUBLIC() {
    return STORAGE_KEY_PUBLIC;
  }

  /**
   * Keyring.STORAGE_KEY_PRIVATE
   * @returns {string}
   * @constructor
   */
  static get STORAGE_KEY_PRIVATE() {
    return STORAGE_KEY_PRIVATE;
  }
}

exports.Keyring = Keyring;
