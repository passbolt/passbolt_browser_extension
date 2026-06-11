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
 * @since         6.0.0
 */
import AccountEntity from "../../model/entity/account/accountEntity";
import Log from "../../model/log";
import { assertType } from "../../utils/assertions";
import LocalStorageMetadataEntity from "../../model/entity/localStorage/localStorageMetadataEntity";

class AbstractLocalStorage {
  /**
   * Runtime cached data.
   * @type {Object} Key: account_id, value: cached data as dto.
   * @private
   */
  static _runtimeCachedData = {};

  /**
   * Runtime cached metadata.
   * @type {Object} Key: account_id, value: cached metadata as dto.
   * @private
   */
  static _runtimeCachedMetadata = {};

  /**
   * Constructor
   * @param account the user account
   */
  constructor(account) {
    if (!account || !(account instanceof AccountEntity)) {
      throw new TypeError("Parameter `account` should be of type AccountEntity.");
    }
    this.account = account;
    this.storageMetadataKey = this.getMetadataStorageKey(account);
    this.storageDataKey = this.getDataStorageKey(account);
  }

  /**
   * Get the metadata data storage key.
   * @param {AbstractAccountEntity} account The account to get the key for.
   * @returns {string}
   * @throws {Error} If it cannot retrieve account id.
   */
  getMetadataStorageKey(account) {
    return `${this.key}-metadata-${account.id}`;
  }

  /**
   * Get the data storage key.
   * @param {AbstractAccountEntity} account The account to get the key for.
   * @returns {string}
   * @throws {Error} If it cannot retrieve account id.
   */
  getDataStorageKey(account) {
    return `${this.key}-${account.id}`;
  }

  /**
   * Flush the active session from local storage and runtime cached data.
   * @return {Promise<void>}
   */
  async flush() {
    await browser.storage.local.remove(this.storageMetadataKey);
    await browser.storage.local.remove(this.storageDataKey);
    delete AbstractLocalStorage._runtimeCachedData[this.storageDataKey];
    delete AbstractLocalStorage._runtimeCachedMetadata[this.storageMetadataKey];
    Log.write({ level: "debug", message: `${this.key} metadata flushed for (${this.account.id})` });
    Log.write({ level: "debug", message: `${this.key} flushed for (${this.account.id})` });
  }

  /**
   * Get the metadata from the local storage.
   * @return {Promise<object|undefined>}
   */
  async getMetadata() {
    if (!AbstractLocalStorage._runtimeCachedMetadata[this.storageMetadataKey]) {
      const data = await browser.storage.local.get([this.storageMetadataKey]);
      if (!data[this.storageMetadataKey]) {
        return;
      }
      AbstractLocalStorage._runtimeCachedMetadata[this.storageMetadataKey] = data[this.storageMetadataKey];
    }

    return AbstractLocalStorage._runtimeCachedMetadata[this.storageMetadataKey];
  }

  /**
   * Get the data from the local storage.
   * @return {Promise<object|undefined>}
   */
  async getData() {
    if (!AbstractLocalStorage._runtimeCachedData[this.storageDataKey]) {
      const data = await browser.storage.local.get([this.storageDataKey]);
      if (!data[this.storageDataKey]) {
        return;
      }
      AbstractLocalStorage._runtimeCachedData[this.storageDataKey] = data[this.storageDataKey];
    }

    return AbstractLocalStorage._runtimeCachedData[this.storageDataKey];
  }

  /**
   * Set the data in the local storage and update the metadata.
   * @param {EntityV2|EntityV2Collection} data The data to insert in the local storage.
   * @return {Promise<void>}
   * @throws {TypeError} If parameter settings is not of type entityClass.
   */
  async setData(data) {
    assertType(data, this.entityClass, `Parameter "data" should be of type ${this.entityClass.constructor.name}`);
    await navigator.locks.request(this.storageDataKey, async () => {
      const dataDto = data.toDto(this.constructor.CONTAIN_OPTIONS);
      await this._setBrowserStorage({ [this.storageDataKey]: dataDto });
      AbstractLocalStorage._runtimeCachedData[this.storageDataKey] = dataDto;
    });
    const date = new Date().toISOString();
    const metadata = new LocalStorageMetadataEntity({ last_updated: date });
    await this.setMetadata(metadata);
  }

  /**
   * Set the data in the local storage and update the metadata.
   * @param {LocalStorageMetadataEntity} metadata The data to insert in the local storage.
   * @return {Promise<void>}
   * @throws {TypeError} If parameter settings is not of type entityClass.
   */
  async setMetadata(metadata) {
    assertType(
      metadata,
      LocalStorageMetadataEntity,
      "Parameter 'metadata' should be of type LocalStorageMetadataEntity",
    );
    await navigator.locks.request(this.storageMetadataKey, async () => {
      const metadataDto = metadata.toDto();
      await this._setBrowserStorage({ [this.storageMetadataKey]: metadataDto });
      AbstractLocalStorage._runtimeCachedMetadata[this.storageMetadataKey] = metadataDto;
    });
  }

  /**
   * Set the browser storage.
   * @param {object} data The data to store in the local storage.
   * @returns {Promise<void>}
   * @private
   */
  async _setBrowserStorage(data) {
    await browser.storage.local.set(data);
  }

  /**
   * Get the key name
   * @returns {string}
   */
  get key() {
    Log.write({
      level: "debug",
      message: "The local storage should implement key. Default throw an error.",
    });
    throw new Error("The local storage should implement key.");
  }

  /**
   * Get the entity class
   * @returns {Class}
   */
  get entityClass() {
    Log.write({
      level: "debug",
      message: "The local storage should implement entityClass. Default throw an error.",
    });
    throw new Error("The local storage should implement entityClass.");
  }

  /**
   * Get the contain options
   * @return {{}}
   * @constructor
   */
  static get CONTAIN_OPTIONS() {
    return {};
  }
}

export default AbstractLocalStorage;
