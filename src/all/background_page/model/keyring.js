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
import {OpenpgpAssertion} from "../utils/openpgp/openpgpAssertions";
import {Uuid} from "../utils/uuid";
import UserSettings from "./userSettings/userSettings";
import ExternalGpgKeyEntity from "./entity/gpgkey/external/externalGpgKeyEntity";
import GetGpgKeyInfoService from "../service/crypto/getGpgKeyInfoService";
import storage from "../sdk/storage";
import Validator from "validator";

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
  /*
   * ==================================================
   * FINDERS
   * ==================================================
   */
  /**
   * Get a public key by its fingerprint.
   *
   * @param {string} userId uuid
   * @returns {ExternalGpgKeyEntity | undefined}
   */
  findPublic(userId) {
    let i;
    const publicKeys = this.getPublicKeysFromStorage();
    for (i in publicKeys) {
      if (Object.prototype.hasOwnProperty.call(publicKeys, i) && publicKeys[i].user_id === userId) {
        return new ExternalGpgKeyEntity(publicKeys[i]);
      }
    }
    return undefined;
  }

  /**
   * Get a private key by its fingerprint.
   * We currently only support one private key per person
   *
   * @returns {ExternalGpgKeyEntity | undefined}
   */
  findPrivate() {
    const userId = Keyring.MY_KEY_ID;
    const privateKeys = this.getPrivateKeysFromStorage();
    return privateKeys[userId] ? new ExternalGpgKeyEntity(privateKeys[userId]) : undefined;
  }

  /*
   * ==================================================
   * IMPORT
   * ==================================================
   */
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
      throw new Error('The user id is undefined');
    }
    if (!Validator.isUUID(userId)) {
      throw new Error('The user id is not valid');
    }

    /*
     * Parse the keys. If standard format given with a text containing
     * public/private. It will extract only the public.
     */
    armoredPublicKey = this.findArmoredKeyInText(armoredPublicKey, Keyring.PUBLIC);
    // Is the given key a valid pgp key ?
    const primaryPublicKey = await OpenpgpAssertion.readKeyOrFail(armoredPublicKey);
    OpenpgpAssertion.assertPublicKey(primaryPublicKey);

    // Get the keyInfo.
    const keyInfo = (await GetGpgKeyInfoService.getKeyInfo(primaryPublicKey)).toDto();

    // Add the key in the keyring.
    const publicKeys = this.getPublicKeysFromStorage();
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

    /*
     * Parse the keys. If standard format given with a text containing
     * public/private. It will extract only the private.
     */
    armoredKey = this.findArmoredKeyInText(armoredKey, Keyring.PRIVATE);

    const privateKey = await OpenpgpAssertion.readKeyOrFail(armoredKey);
    OpenpgpAssertion.assertPrivateKey(privateKey);
    // Get the keyInfo.
    const keyInfo = (await GetGpgKeyInfoService.getKeyInfo(privateKey)).toDto();

    // Add the key in the keyring
    const privateKeys = this.getPrivateKeysFromStorage();
    privateKeys[Keyring.MY_KEY_ID] = keyInfo;
    privateKeys[Keyring.MY_KEY_ID].user_id = Keyring.MY_KEY_ID;
    this.store(Keyring.PRIVATE, privateKeys);

    return true;
  }

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

  /*
   * ==================================================
   * PARSING AND KEY INFO
   * ==================================================
   */
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
  }

  /*
   * ==================================================
   * SERVER SYNC
   * @TODO move to a dedicated service
   * ==================================================
   */
  /**
   * Sync the local keyring with the passbolt API.
   * Retrieve the latest updated Public Keys.
   *
   * @returns {Promise<int>} number of updated keys
   */
  async sync() {
    const latestSync = storage.getItem('latestSync');

    // Get the latest keys changes from the backend.
    const userSettings = new UserSettings();
    let url = `${userSettings.getDomain()}/gpgkeys.json` + `?api-version=v2`;

    // If a sync has already been performed.
    if (latestSync !== null) {
      url += `&modified_after=${latestSync}`;
    }

    // Get the updated public keys from passbolt.
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    const json = await response.json();

    // Check response status
    if (!response.ok) {
      let msg = 'Could not synchronize the keyring. The server responded with an error.';
      if (json.header.msg) {
        msg += ` ${json.header.msg}`;
      }
      msg += `(${response.status})`;
      throw new Error(msg);
    }
    // Update the latest synced time.
    if (!json.header) {
      throw new Error('Could not synchronize the keyring. The server response header is missing.');
    }
    if (!json.body) {
      throw new Error('Could not synchronize the keyring. The server response body is missing.');
    }

    // Store all the new keys in the keyring.
    let meta, i;
    const imports = [];
    for (i in json.body) {
      if (Object.prototype.hasOwnProperty.call(json.body, i)) {
        meta = json.body[i];
        imports.push(this.importPublic(meta.armored_key, meta.user_id));
      }
    }
    await Promise.all(imports);

    storage.setItem('latestSync', json.header.servertime);

    return (json.body.length);
  }

  /*
   * ==================================================
   * STORAGE
   * @TODO move to a dedicated service
   * ==================================================
   */
  /**
   * Store keys in the local storage.
   *
   * @param {string} type The keys type : Keyring.PRIVATE or Keyring.PUBLIC
   * @param {array} keys The list of keys to store
   * @return void
   */
  store(type, keys) {
    if (type !== Keyring.PUBLIC && type !== Keyring.PRIVATE) {
      throw new Error('Key type is incorrect');
    }
    const key = (type === Keyring.PRIVATE) ? Keyring.STORAGE_KEY_PRIVATE : Keyring.STORAGE_KEY_PUBLIC;
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
  getPublicKeysFromStorage() {
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
  flush(type) {
    if (typeof type === 'undefined') {
      type = Keyring.PUBLIC;
    }

    if (type === Keyring.PUBLIC) {
      this.store(Keyring.PUBLIC, {});
    } else if (type === Keyring.PRIVATE) {
      this.store(Keyring.PRIVATE, {});
    }

    /*
     * Removed latestSync variable.
     * We consider that the keyring has never been synced.
     */
    storage.removeItem('latestSync');
  }

  /*
   * ==================================================
   * CONSTANT GETTERS
   * ==================================================
   */
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

export default Keyring;
