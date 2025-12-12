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
 * @since         5.8.0
 */
import RbacsCollection from "passbolt-styleguide/src/shared/models/entity/rbac/rbacsCollection";
import RbacsLocalStorage from "../../service/local_storage/rbacLocalStorage";
import FindAndUpdateRbacLocalStorageService from "./findAndUpdateRbacsLocalStorageService";

/**
 * Model related to the role based access control
 */
export default class GetOrFindRbacService {
  /**
   * @constructor
   * @param {ApiClientOptions} apiClientOptions
   * @param {AccountEntity} account the account associated to the worker
   */
  constructor(apiClientOptions, account) {
    this.rbacsLocalStorage = new RbacsLocalStorage(account);
    this.findAndUpdateRbacLocalStorageService = new FindAndUpdateRbacLocalStorageService(account, apiClientOptions);
  }

  /**
   * Find current user rbcas.
   * @param {Object} contains The list of contains.
   * @returns {Promise<RbacsCollection>}
   */
  async getOrFindMe() {
    const collectionDto = await this.rbacsLocalStorage.get();
    if (typeof collectionDto !== 'undefined') {
      return new RbacsCollection(collectionDto, true);
    }
    return this.findAndUpdateRbacLocalStorageService.findAndUpdateAll();
  }
}
