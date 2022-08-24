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
 * @since         3.7.3
 */

const DB_VERSION = 1;
const DB_NAME = "ssoData_db";
const SSO_KEYS_OBECT_STORE = 'key_os';

class SsoDataStorage {
  /**
   * Register locally the SSO client user's data.
   *
   * @param {SsoClientUserDataDto} ssoClientData
   * @returns {Promise<void>}
   * @public
   */
  static async save(ssoClientData) {
    this.assertSsoClientData(ssoClientData);
    const dbHandler = await this.getDbHandler();
    await this.replaceSsoData(dbHandler, ssoClientData);
    dbHandler.close();
  }

  /**
   * Assert the given data is a proper SsoClientDataDto
   *
   * @param {SsoClientUserDataDto} ssoClientData
   * @returns {Promise<void>}
   * @private
   */
  static assertSsoClientData(ssoClientData) {
    return ssoClientData.nek instanceof CryptoKey
      && ssoClientData.nek.extractable === false
      && ssoClientData.nek.algorigtm.name === "AES-GCM"
      && ssoClientData.nek.algorigtm.length === 256
      && ssoClientData.nek.usages.includes("encrypt")
      && ssoClientData.nek.usages.includes("decrypt")

      && ssoClientData.iv1 instanceof Uint8Array
      && ssoClientData.iv1.length === 12

      && ssoClientData.iv2 instanceof Uint8Array
      && ssoClientData.iv2.length === 12;
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

      openRequest.addEventListener("upgradeneeded", e => {
        const db = e.target.result;
        console.log(`Upgrading SSO IndexedDB to version ${db.version}.`);

        const objectStore = db.createObjectStore(SSO_KEYS_OBECT_STORE, {
          keyPath: 'id',
        });

        objectStore.createIndex("nek", "nek", {unique: true});
        objectStore.createIndex("iv1", "iv1");
        objectStore.createIndex("iv2", "iv2");

        console.log("SSO IndexedDB upgrade completed.");
      });

      openRequest.addEventListener("success", () => {
        resolve(openRequest.result);
      });

      openRequest.addEventListener("error", event => {
        console.error("Database failed to open");
        console.error(event);
        reject();
      });
    });
  }

  /**
   * Replace the current existing SSO client data or store new one.
   *
   * @param {IDBDatabase} dbHandler an opened IndexDB handler
   * @param {SsoClientUserDataDto} ssoClientData
   * @returns {Promise<void>}
   * @private
   */
  static async replaceSsoData(dbHandler, ssoClientData) {
    await this.clearKeys(dbHandler);
    await this.storeData(ssoClientData);
  }

  /**
   * Clear the current existing SSO client data.
   *
   * @param {IDBDatabase} dbHandler an opened IndexDB handler
   * @returns {Promise<void>}
   * @private
   */
  static async clearKeys(dbHandler) {
    return new Promise((resolve, reject) => {
      const transaction = dbHandler.transaction([SSO_KEYS_OBECT_STORE], 'readwrite');
      const objectStore = transaction.objectStore(SSO_KEYS_OBECT_STORE);
      const objectStoreRequest = objectStore.clear();

      objectStoreRequest.addEventListener("complete", () => {
        console.log("IndexDB SSO client data cleared");
        resolve();
      });

      objectStoreRequest.addEventListener("error", event => {
        console.error(`The IndexedDB transaction couldn't be opened to clear the data`);
        console.error(event);
        reject();
      });
    });
  }

  /**
   * Store the given SSO client data.
   *
   * @param {IDBDatabase} dbHandler an opened IndexDB handler
   * @param {SsoClientUserDataDto} ssoClientData
   * @returns {Promise<void>}
   * @private
   */
  static async storeData(dbHandler, ssoClientData) {
    return new Promise((resolve, reject) => {
      const transaction = dbHandler.transaction([SSO_KEYS_OBECT_STORE], 'readwrite');
      const objectStore = transaction.objectStore(SSO_KEYS_OBECT_STORE);

      const dataToStore = {
        id: 1,
        ...ssoClientData
      };
      const addRequest = objectStore.add(dataToStore);

      addRequest.addEventListener('success', () => {
        console.log("New SSO client data stored successfully");
      });

      transaction.addEventListener('complete', () => {
        //Apparently, according to an MDN documentation, the modification is not 100% guaranteed to be flushed on disk for Firefox
        resolve();
      });

      transaction.addEventListener('error', event => {
        console.error(`The IndexedDB transaction couldn't be opened to add new data`);
        console.error(event);
        reject();
      });
    });
  }
}

export default SsoDataStorage;
