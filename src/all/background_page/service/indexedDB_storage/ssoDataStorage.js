/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.9.0
 */
import SsoKitClientPartEntity from "../../model/entity/sso/ssoKitClientPartEntity";
import {assertSsoProvider, assertUuid} from "../../utils/assertions";

const DB_VERSION = 1;
const DB_NAME = "sso_kit_db";
const SSO_KEYS_OBECT_STORE = 'sso_kit';

class SsoDataStorage {
  /**
   * Returns the local SSO client user's data.
   *
   * @returns {Promise<SsoKitClientPartEntity|null>}
   * @public
   */
  static async get() {
    const dbHandler = await this.getDbHandler();
    const ssoClientData = await this.getSsoData(dbHandler);
    dbHandler.close();
    return ssoClientData;
  }
  /**
   * Register locally the SSO client user's data.
   *
   * @param {SsoKitClientPartEntity} ssoClientData
   * @returns {Promise<void>}
   * @public
   */
  static async save(ssoKitClientPartEntity) {
    const dbHandler = await this.getDbHandler();
    await this.replaceSsoData(dbHandler, ssoKitClientPartEntity);
    dbHandler.close();
  }

  /**
   * Updates the local SSO kit with the given id.
   * @param {uuid} ssoKitId
   * @returns {Promise<void>}
   */
  static async updateLocalKitIdWith(ssoKitId) {
    assertUuid(ssoKitId, "A valid SSO kit id is required");

    const dbHandler = await this.getDbHandler();
    await this.updateSsoDataWithId(dbHandler, ssoKitId);
    dbHandler.close();
  }

  /**
   * Updates the local SSO kit with the given id.
   * @param {string} provider
   * @returns {Promise<void>}
   */
  static async updateLocalKitProviderWith(provider) {
    assertSsoProvider(provider, "A valid SSO provider id is required");

    const dbHandler = await this.getDbHandler();
    await this.updateSsoDataWithProvider(dbHandler, provider);
    dbHandler.close();
  }

  /**
   * Remove all existing data
   * @return {Promise<void>}
   */
  static async flush() {
    const dbHandler = await this.getDbHandler();
    await this.clearData(dbHandler);
  }

  /**
   * Opens the IndexedDB and returns an handler if the operation is successful.
   *
   * @returns {Promise<IDBDatabase>}
   * @private
   */
  static async getDbHandler() {
    return new Promise((resolve, reject) => {
      const openRequest = indexedDB.open(DB_NAME, DB_VERSION);

      openRequest.onupgradeneeded = e => {
        const db = e.target.result;
        console.log(`Upgrading SSO IndexedDB from version ${e.oldVersion} to version ${e.newVersion}.`);

        if (e.oldVersion < 1) {
          const objectStore = db.createObjectStore(SSO_KEYS_OBECT_STORE, {
            keyPath: 'pk_id',
          });
          objectStore.createIndex("sso_kit", "sso_kit", {unique: true});
        }

        console.log("SSO IndexedDB upgrade completed.");
      };

      openRequest.onsuccess = () => {
        resolve(openRequest.result);
      };

      openRequest.onerror = event => {
        console.error("Database failed to open");
        console.error(event);
        reject();
      };
    });
  }

  /**
   * Replace the current existing SSO client data or store new one.
   *
   * @param {IDBDatabase} dbHandler an opened IndexDB handler
   * @param {ssoKitClientPartEntity} ssoKitClientPartEntity
   * @returns {Promise<void>}
   * @private
   */
  static async replaceSsoData(dbHandler, ssoKitClientPartEntity) {
    await this.clearData(dbHandler);
    await this.storeData(dbHandler, ssoKitClientPartEntity);
  }

  /**
   * Finds the SSO client data from the IndexedDB
   * @param {IDBDatabase} dbHandler
   * @returns {Promise<SsoKitClientPartEntity|null>}
   * @private
   */
  static async getSsoData(dbHandler) {
    return new Promise((resolve, reject) => {
      const transaction = dbHandler.transaction([SSO_KEYS_OBECT_STORE], 'readonly');
      const objectStore = transaction.objectStore(SSO_KEYS_OBECT_STORE);
      const cursor = objectStore.openCursor();
      cursor.onsuccess = e => {
        const cursor = e.target.result;

        if (!cursor) {
          resolve(null);
          return;
        }

        const ssoClientData = new SsoKitClientPartEntity(cursor.value.sso_kit);
        resolve(ssoClientData);
      };

      cursor.onerror = e => {
        console.error("An error occured when trying to open the IndexDb cursor:", e);
        reject();
      };
    });
  }

  /**
   * Clear the current existing SSO client data.
   *
   * @param {IDBDatabase} dbHandler an opened IndexDB handler
   * @returns {Promise<void>}
   * @private
   */
  static async clearData(dbHandler) {
    return new Promise((resolve, reject) => {
      const transaction = dbHandler.transaction([SSO_KEYS_OBECT_STORE], 'readwrite');
      const objectStore = transaction.objectStore(SSO_KEYS_OBECT_STORE);
      const objectStoreRequest = objectStore.clear();

      objectStoreRequest.onsuccess = () => {
        console.log("IndexDB SSO client data cleared");
        resolve();
      };

      objectStoreRequest.onerror = event => {
        console.error(`The IndexedDB transaction couldn't be opened to clear the data`);
        console.error(event);
        reject();
      };
    });
  }

  /**
   * Store the given SSO client data.
   *
   * @param {IDBDatabase} dbHandler an opened IndexDB handler
   * @param {SsoKitClientPartEntity} ssoKitClientPartEntity
   * @returns {Promise<void>}
   * @private
   */
  static async storeData(dbHandler, ssoKitClientPartEntity) {
    return new Promise((resolve, reject) => {
      const transaction = dbHandler.transaction([SSO_KEYS_OBECT_STORE], 'readwrite');
      const objectStore = transaction.objectStore(SSO_KEYS_OBECT_STORE);

      const ssoKit = ssoKitClientPartEntity.toDbSerializableObject();
      const addRequest = objectStore.add({pk_id: 1, sso_kit: ssoKit});

      addRequest.onsuccess = () => {
        console.log("New SSO client data stored successfully");
      };

      transaction.oncomplete = () => {
        //Apparently, according to an MDN documentation, the modification is not 100% guaranteed to be flushed on disk for Firefox
        resolve();
      };

      transaction.onerror = event => {
        console.error(`The IndexedDB transaction couldn't be opened to add new data`);
        console.error(event);
        reject();
      };
    });
  }

  /**
   * Updates the id of the SSO kit.
   *
   * @param {IDBDatabase} dbHandler an opened IndexDB handler
   * @param {uuid} ssoKitClientPartEntity
   * @returns {Promise<void>}
   * @private
   */
  static async updateSsoDataWithId(dbHandler, ssoKitId) {
    const ssoData = await this.getSsoData(dbHandler);
    return new Promise((resolve, reject) => {
      const transaction = dbHandler.transaction([SSO_KEYS_OBECT_STORE], 'readwrite');
      const objectStore = transaction.objectStore(SSO_KEYS_OBECT_STORE);

      const newSsoKit = Object.assign({}, ssoData.toDbSerializableObject(), {id: ssoKitId});
      const putRequest = objectStore.put({pk_id: 1, sso_kit: newSsoKit});

      putRequest.onsuccess = () => {
        console.log("The SSO Kit identifier has been updated successfully");
      };

      transaction.oncomplete = () => {
        //Apparently, according to an MDN documentation, the modification is not 100% guaranteed to be flushed on disk for Firefox
        resolve();
      };

      transaction.onerror = event => {
        console.error(`The IndexedDB transaction couldn't be opened to updated the SSO Kit`);
        console.error(event);
        reject();
      };
    });
  }

  /**
   * Updates the id of the SSO kit.
   *
   * @param {IDBDatabase} dbHandler an opened IndexDB handler
   * @param {string} provider the provider to set
   * @returns {Promise<void>}
   * @private
   */
  static async updateSsoDataWithProvider(dbHandler, provider) {
    const ssoData = await this.getSsoData(dbHandler);
    return new Promise((resolve, reject) => {
      const transaction = dbHandler.transaction([SSO_KEYS_OBECT_STORE], 'readwrite');
      const objectStore = transaction.objectStore(SSO_KEYS_OBECT_STORE);

      const newSsoKit = Object.assign({}, ssoData.toDbSerializableObject(), {provider});
      const putRequest = objectStore.put({pk_id: 1, sso_kit: newSsoKit});

      putRequest.onsuccess = () => {
        console.log("The SSO provider has been updated successfully");
      };

      transaction.oncomplete = () => {
        //Apparently, according to an MDN documentation, the modification is not 100% guaranteed to be flushed on disk for Firefox
        resolve();
      };

      transaction.onerror = event => {
        console.error(`The IndexedDB transaction couldn't be opened to updated the SSO Kit`);
        console.error(event);
        reject();
      };
    });
  }
}

export default SsoDataStorage;
