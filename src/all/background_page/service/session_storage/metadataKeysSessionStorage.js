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
 * @since         4.10.0
 */
import AccountEntity from "../../model/entity/account/accountEntity";
import MetadataKeysCollection from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysCollection";
import MetadataPrivateKeyEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataPrivateKeyEntity";

export const METADATA_KEYS_SESSION_STORAGE_KEY = "metadata_keys";

class MetadataKeysSessionStorage {
  /**
   * Runtime cached data.
   * @type {Object} Key: account_id, value: cached data as dto.
   * @private
   */
  static _runtimeCachedData = {};

  /**
   * Constructor
   * @param account the user account
   */
  constructor(account) {
    if (!account || !(account instanceof AccountEntity)) {
      throw new TypeError("Parameter `account` should be of type AccountEntity.");
    }
    this.account = account;
    this.storageKey = this.getStorageKey(account);
  }

  /**
   * Get the storage key.
   * @param {AbstractAccountEntity} account The account to get the key for.
   * @returns {string}
   * @throws {Error} If it cannot retrieve account id.
   */
  getStorageKey(account) {
    return `${METADATA_KEYS_SESSION_STORAGE_KEY}-${account.id}`;
  }

  /**
   * Flush the metadata keys from session storage and runtime cached data.
   * @return {Promise<void>}
   */
  async flush() {
    await browser.storage.session.remove(this.storageKey);
    delete MetadataKeysSessionStorage._runtimeCachedData[this.account.id];
    console.debug(`MetadataKeysSessionStorage flushed for (${this.account.id})`);
  }

  /**
   * Get the metadata keys from the session storage.
   * @return {Promise<array|undefined>}
   */
  async get() {
    if (!MetadataKeysSessionStorage._runtimeCachedData[this.account.id]) {
      const data = await browser.storage.session.get(this.storageKey);
      if (!data[this.storageKey]) {
        return;
      }
      MetadataKeysSessionStorage._runtimeCachedData[this.account.id] = data[this.storageKey];
    }

    return MetadataKeysSessionStorage._runtimeCachedData[this.account.id];
  }

  /**
   * Set the metadata keys in the session storage.
   * @param {MetadataKeysCollection} collection The metadata keys to store.
   * @return {Promise<void>}
   * @throws {TypeError} If parameter collection is not of type MetadataKeysCollection.
   */
  async set(collection) {
    if (!collection || !(collection instanceof MetadataKeysCollection)) {
      throw new TypeError("The parameter `collection` should be of type MetadataKeysCollection.");
    }
    if (collection.hasEncryptedKeys()) {
      throw new TypeError("The parameter `collection` should contain only decrypted keys.");
    }
    await navigator.locks.request(this.storageKey, async() => {
      for (const metadataKey of collection) {
        MetadataKeysSessionStorage.assertEntityBeforeSave(metadataKey);
      }
      const dtos = collection.toDto(MetadataKeysSessionStorage.DEFAULT_CONTAIN);
      await this._setBrowserStorage({[this.storageKey]: dtos});
      MetadataKeysSessionStorage._runtimeCachedData[this.account.id] = dtos;
    });
  }

  /**
   * Update a metadata key in the session storage.
   * @param {MetadataPrivateKeyEntity} metadataPrivateKey The metadata private key to update
   * @throws {Error} if the metadata key does not exist in the session storage
   */
  async updatePrivateKey(metadataPrivateKey) {
    if (!metadataPrivateKey || !(metadataPrivateKey instanceof MetadataPrivateKeyEntity)) {
      throw new TypeError("The parameter `metadataPrivateKey` should be of type MetadataPrivateKeyEntity.");
    }
    if (!metadataPrivateKey.isDecrypted) {
      throw new Error("The metadata private key should be decrypted.");
    }

    await navigator.locks.request(this.storageKey, async() => {
      const metadataKeys = await this.get() || [];
      const metadataKeyIndex = metadataKeys.findIndex(item => item.id === metadataPrivateKey.metadataKeyId);
      if (metadataKeyIndex === -1) {
        throw new Error('The metadata key could not be found in the session storage');
      }
      metadataKeys[metadataKeyIndex].metadata_private_keys[0] = metadataPrivateKey.toDto();
      await this._setBrowserStorage({[this.storageKey]: metadataKeys});
      MetadataKeysSessionStorage._runtimeCachedData[this.account.id] = metadataKeys;
    });
  }

  /**
   * Make sure the entity meet some minimal requirements before being stored
   *
   * @param {MetadataKeyEntity} metadataKey
   * @throw {TypeError} if requirements are not met
   * @private
   */
  static assertEntityBeforeSave(metadataKey) {
    const requiredProperties = [
      "id", "created", "created_by", "modified", "modified_by"
    ];
    const requiredAssociations = [
      "_metadata_private_keys"
    ];

    requiredProperties.forEach(requiredProperty => {
      if (typeof metadataKey._props[requiredProperty] === "undefined") {
        throw new TypeError(`The parameter 'metadataKey' should have the property '${requiredProperty}' set.`);
      }
    });

    requiredAssociations.forEach(requiredAssociation => {
      if (typeof metadataKey[requiredAssociation] === "undefined") {
        throw new TypeError(`The parameter 'metadataKey' should have the association '${requiredAssociation}' set.`);
      }
    });
  }

  /**
   * Set the browser storage.
   * @todo Tool to test the semaphore. A dedicated session storage service could be implemented later on top
   * of the browser provided one to ease the testing.
   * @param {object} data The data to store in the session storage.
   * @returns {Promise<void>}
   * @private
   */
  async _setBrowserStorage(data) {
    await browser.storage.session.set(data);
  }

  /**
   * To be used only to serialize the data to be stored in the session storage.
   *
   * @returns {Object}
   * @private
   */
  static get DEFAULT_CONTAIN() {
    return {metadata_private_keys: true, creator: true};
  }
}

export default MetadataKeysSessionStorage;
