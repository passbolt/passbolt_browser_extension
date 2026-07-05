/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         5.14.0
 */
import PasskeyKitClientPartEntity from "../../model/entity/passkey/passkeyKitClientPartEntity";

const DB_VERSION = 1;
const DB_NAME = "passkey_kit_db";
const PASSKEY_KEYS_OBJECT_STORE = "passkey_kit";

/**
 * Local storage for the CLIENT half of the passkey passphrase kits.
 *
 * Unlike the SSO kit (a single kit per account), a user may enrol several security keys, so the
 * client halves are keyed by their base64url credential id: on login the ceremony reports which
 * credential was used and we recover the matching client half to decrypt the passphrase. The client
 * half (non-extractable key + ivs + ciphertext) never leaves the device — only the server half is
 * fetched from the API, and only after a valid assertion.
 */
class PasskeyDataStorage {
  /**
   * Get the client part kit for a given credential id.
   *
   * @param {string} credentialId base64url credential id
   * @returns {Promise<PasskeyKitClientPartEntity|null>}
   * @public
   */
  static async get(credentialId) {
    const dbHandler = await this.getDbHandler();
    const kit = await this.getData(dbHandler, credentialId);
    dbHandler.close();
    return kit;
  }

  /**
   * Whether at least one passkey kit is stored locally (used to decide whether to offer the
   * passkey login option).
   *
   * @returns {Promise<boolean>}
   * @public
   */
  static async hasAny() {
    const dbHandler = await this.getDbHandler();
    const count = await this.countData(dbHandler);
    dbHandler.close();
    return count > 0;
  }

  /**
   * Store (or replace) the client part kit for its credential id.
   *
   * @param {PasskeyKitClientPartEntity} passkeyKitClientPartEntity
   * @returns {Promise<void>}
   * @public
   */
  static async save(passkeyKitClientPartEntity) {
    const dbHandler = await this.getDbHandler();
    await this.storeData(dbHandler, passkeyKitClientPartEntity);
    dbHandler.close();
  }

  /**
   * Remove the client part kit for a given credential id.
   *
   * @param {string} credentialId base64url credential id
   * @returns {Promise<void>}
   * @public
   */
  static async delete(credentialId) {
    const dbHandler = await this.getDbHandler();
    await this.deleteData(dbHandler, credentialId);
    dbHandler.close();
  }

  /**
   * Remove all existing data.
   *
   * @returns {Promise<void>}
   * @public
   */
  static async flush() {
    const dbHandler = await this.getDbHandler();
    await this.clearData(dbHandler);
    dbHandler.close();
  }

  /**
   * Opens the IndexedDB and returns a handler if the operation is successful.
   *
   * @returns {Promise<IDBDatabase>}
   * @private
   */
  static async getDbHandler() {
    return new Promise((resolve, reject) => {
      const openRequest = indexedDB.open(DB_NAME, DB_VERSION);

      openRequest.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (e.oldVersion < 1) {
          db.createObjectStore(PASSKEY_KEYS_OBJECT_STORE, { keyPath: "credential_id" });
        }
      };

      openRequest.onsuccess = () => resolve(openRequest.result);
      openRequest.onerror = (event) => {
        console.error("Passkey IndexedDB failed to open", event);
        reject();
      };
    });
  }

  /**
   * Find one client part kit by credential id.
   *
   * @param {IDBDatabase} dbHandler
   * @param {string} credentialId
   * @returns {Promise<PasskeyKitClientPartEntity|null>}
   * @private
   */
  static async getData(dbHandler, credentialId) {
    return new Promise((resolve, reject) => {
      const transaction = dbHandler.transaction([PASSKEY_KEYS_OBJECT_STORE], "readonly");
      const objectStore = transaction.objectStore(PASSKEY_KEYS_OBJECT_STORE);
      const request = objectStore.get(credentialId);

      request.onsuccess = (e) => {
        const record = e.target.result;
        if (!record) {
          resolve(null);
          return;
        }
        try {
          resolve(new PasskeyKitClientPartEntity(record.kit));
        } catch (error) {
          console.error(error);
          reject();
        }
      };
      request.onerror = (e) => {
        console.error("An error occurred reading the passkey kit", e);
        reject();
      };
    });
  }

  /**
   * Count the stored kits.
   *
   * @param {IDBDatabase} dbHandler
   * @returns {Promise<number>}
   * @private
   */
  static async countData(dbHandler) {
    return new Promise((resolve, reject) => {
      const transaction = dbHandler.transaction([PASSKEY_KEYS_OBJECT_STORE], "readonly");
      const objectStore = transaction.objectStore(PASSKEY_KEYS_OBJECT_STORE);
      const request = objectStore.count();
      request.onsuccess = (e) => resolve(e.target.result);
      request.onerror = (e) => reject(e);
    });
  }

  /**
   * Store (add or overwrite) a client part kit.
   *
   * @param {IDBDatabase} dbHandler
   * @param {PasskeyKitClientPartEntity} passkeyKitClientPartEntity
   * @returns {Promise<void>}
   * @private
   */
  static async storeData(dbHandler, passkeyKitClientPartEntity) {
    return new Promise((resolve, reject) => {
      const transaction = dbHandler.transaction([PASSKEY_KEYS_OBJECT_STORE], "readwrite");
      const objectStore = transaction.objectStore(PASSKEY_KEYS_OBJECT_STORE);

      const kit = passkeyKitClientPartEntity.toDbSerializableObject();
      objectStore.put({ credential_id: passkeyKitClientPartEntity.credentialId, kit });

      transaction.oncomplete = () => resolve();
      transaction.onerror = (event) => {
        console.error("The passkey kit could not be stored", event);
        reject();
      };
    });
  }

  /**
   * Delete one client part kit by credential id.
   *
   * @param {IDBDatabase} dbHandler
   * @param {string} credentialId
   * @returns {Promise<void>}
   * @private
   */
  static async deleteData(dbHandler, credentialId) {
    return new Promise((resolve, reject) => {
      const transaction = dbHandler.transaction([PASSKEY_KEYS_OBJECT_STORE], "readwrite");
      const objectStore = transaction.objectStore(PASSKEY_KEYS_OBJECT_STORE);
      objectStore.delete(credentialId);
      transaction.oncomplete = () => resolve();
      transaction.onerror = (event) => reject(event);
    });
  }

  /**
   * Clear all data.
   *
   * @param {IDBDatabase} dbHandler
   * @returns {Promise<void>}
   * @private
   */
  static async clearData(dbHandler) {
    return new Promise((resolve, reject) => {
      const transaction = dbHandler.transaction([PASSKEY_KEYS_OBJECT_STORE], "readwrite");
      const objectStore = transaction.objectStore(PASSKEY_KEYS_OBJECT_STORE);
      objectStore.clear();
      transaction.oncomplete = () => resolve();
      transaction.onerror = (event) => reject(event);
    });
  }
}

export default PasskeyDataStorage;
