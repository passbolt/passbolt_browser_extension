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
 * @since         4.10.1
 */

import FindAndUpdateSessionKeysSessionStorageService from "./findAndUpdateSessionKeysSessionStorageService";
import SessionKeysBundlesSessionStorageService from "../sessionStorage/sessionKeysBundlesSessionStorageService";
import SessionKeysBundlesCollection from "passbolt-styleguide/src/shared/models/entity/sessionKey/sessionKeysBundlesCollection";

/**
 * The service aims to get session keys from the local storage, or to retrieve them from the API and store them in the session storage.
 */
export default class GetOrFindSessionKeysService {
  /**
   * @constructor
   * @param {AccountEntity} account The user account
   * @param {ApiClientOptions} apiClientOptions The api client options
   */
  constructor(account, apiClientOptions) {
    this.findAndUpdateSessionKeysService = new FindAndUpdateSessionKeysSessionStorageService(account, apiClientOptions);
    this.sessionKeysBundlesSessionStorageService = new SessionKeysBundlesSessionStorageService(account);
  }

  /**
   * Get the session keys from the session storage, or retrieve them from the API and update the session storage.
   * @returns {Promise<SessionKeysBundlesCollection>}
   */
  async getOrFindAllBundles() {
    const hasRuntimeCache = this.sessionKeysBundlesSessionStorageService.hasCachedData();
    const sessionKeysBundles = await this.sessionKeysBundlesSessionStorageService.get();
    if (sessionKeysBundles) {
      return new SessionKeysBundlesCollection(sessionKeysBundles, {validate: !hasRuntimeCache});
    }

    return this.findAndUpdateSessionKeysService.findAndUpdateAllBundles();
  }
}
