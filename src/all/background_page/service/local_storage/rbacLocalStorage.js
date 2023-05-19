/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         4.1.0
 */
import browser from "../../sdk/polyfill/browserPolyfill";
import Log from "../../model/log";
import Lock from "../../utils/lock";
import HashString from "../../utils/format/hashString";
import RbacEntity from "passbolt-styleguide/src/shared/models/entity/rbac/rbacEntity";
import RbacsCollection from "passbolt-styleguide/src/shared/models/entity/rbac/rbacsCollection";
const lock = new Lock();

const RBACS_LOCAL_STORAGE_KEY = 'rbac';

class RbacsLocalStorage {
  /**
   * Constructor
   * @param account the user account
   */
  constructor(account) {
    this.key = this.getKey(account);
  }
  /**
   * Flush the rbacs local storage
   * @throws {Error} if operation failed
   * @return {Promise<void>}
   */
  async flush() {
    Log.write({level: 'debug', message: 'RbacLocalStorage flushed'});
    return await browser.storage.local.remove(this.key);
  }

  /**
   * Set the rbacs local storage.
   * @throws {Error} if operation failed
   * @return {Promise} results object, containing every object in keys that was found in the storage area.
   * If storage is not set, undefined will be returned.
   */
  async get() {
    const rbacs = await browser.storage.local.get([this.key]);
    return rbacs[this.key];
  }

  /**
   * Set the rbacs in local storage.
   * @param {RbacsCollection} rbacsCollection The rbacs collection to insert in the local storage.
   * @return {void}
   */
  async set(rbacsCollection) {
    await lock.acquire();
    const rbacs = [];
    if (rbacsCollection) {
      if (!(rbacsCollection instanceof RbacsCollection)) {
        throw new TypeError('RbacsLocalStorage::set expects a RbacsCollection');
      }
      for (const rbacEntity of rbacsCollection) {
        RbacsLocalStorage.assertEntityBeforeSave(rbacEntity);
        rbacs.push(rbacEntity.toDto(RbacEntity.ALL_CONTAIN_OPTIONS));
      }
    }
    await browser.storage.local.set({[this.key]: rbacs});
    lock.release();
  }

  /*
   * =================================================
   * Static methods
   * =================================================
   */
  /**
   * Make sure the entity meet some minimal requirements before being stored
   *
   * @param {RbacEntity} rbacEntity
   * @throw {TypeError} if requirements are not met
   * @private
   */
  static assertEntityBeforeSave(rbacEntity) {
    if (!rbacEntity) {
      throw new TypeError('RolesLocalStorage expects a RbacEntity to be set');
    }
    if (!(rbacEntity instanceof RbacEntity)) {
      throw new TypeError('RolesLocalStorage expects an object of type RbacEntity');
    }
    if (!rbacEntity.id) {
      throw new TypeError('RolesLocalStorage expects RbacEntity id to be set');
    }
  }

  /**
   * Get the key
   * @param account The user account
   * @return {string}
   */
  getKey(account) {
    return RBACS_LOCAL_STORAGE_KEY + HashString.exec(account.domain) + account.userId;
  }
}

export default RbacsLocalStorage;
