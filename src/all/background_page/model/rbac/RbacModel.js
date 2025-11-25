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
import UserModel from "../user/userModel";
import RbacsCollection from "passbolt-styleguide/src/shared/models/entity/rbac/rbacsCollection";
import RbacApiService from "passbolt-styleguide/src/shared/services/api/rbac/rbacApiService";
import RbacsLocalStorage from "../../service/local_storage/rbacLocalStorage";

/**
 * Model related to the role based access control
 */
class RbacModel {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @param {AccountEntity} account the account associated to the worker
   * @public
   */
  constructor(apiClientOptions, account) {
    this.userModel = new UserModel(apiClientOptions, account);
    this.rbacApiService = new RbacApiService(apiClientOptions);
    this.rbacsLocalStorage = new RbacsLocalStorage(account);
  }

  /**
   * Find all the rbacs.
   * @param {Object} contains The list of contains.
   * @returns {Promise<RbacsCollection>}
   */
  async findAll(contains = {}) {
    const collectionDto = await this.rbacApiService.findAll(contains);
    return new RbacsCollection(collectionDto, true);
  }

  /**
   * Get a collection of all rbac from the local storage.
   * If the local storage is unset, initialize it.
   * @param contains
   * @return {Promise<RbacsCollection>}
   */
  async updateLocalStorage(contains = {}) {
    const response = await this.rbacApiService.findMe(contains);
    const rbacsCollection = new RbacsCollection(response.body, true);
    this.rbacsLocalStorage.set(rbacsCollection);
    return rbacsCollection;
  }

  /**
   * Find current user rbcas.
   * @param {Object} contains The list of contains.
   * @returns {Promise<RbacsCollection>}
   */
  async getOrFindMe(contains = {}) {
    const collectionDto = await this.rbacsLocalStorage.get();
    if (typeof collectionDto !== 'undefined') {
      return new RbacsCollection(collectionDto, true);
    }
    return this.updateLocalStorage(contains);
  }
}

export default RbacModel;
