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
import GetOrFindActiveSessionService from "../activeSession/getOrFindActiveSessionService";

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
    this.getOrFindActiveSessionService = new GetOrFindActiveSessionService(account, apiClientOptions);
  }

  /**
   * Find current user rbcas.
   * @param {Object} contains The list of contains.
   * @returns {Promise<RbacsCollection>}
   */
  async getOrFindMe() {
    const activeSession = await this.getOrFindActiveSessionService.getOrFind();
    // Only an online session with a server reachable refreshes stale data; an offline session cannot reach the API.
    const isStale =
      activeSession.isSessionOnline &&
      activeSession.isServerReachable &&
      (await this.rbacsLocalStorage.isStaleSinceLastLoggedIn(activeSession.lastLoggedIn));
    if (!isStale) {
      const collectionDto = await this.rbacsLocalStorage.getData();
      if (typeof collectionDto !== "undefined") {
        return new RbacsCollection(collectionDto);
      } else if (activeSession.isSessionOffline) {
        return new RbacsCollection([]);
      }
    }
    return this.findAndUpdateRbacLocalStorageService.findAndUpdateAll();
  }
}
