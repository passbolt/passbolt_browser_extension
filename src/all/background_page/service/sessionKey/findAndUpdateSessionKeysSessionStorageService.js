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
import FindSessionKeysService from "./findSessionKeysService";
import SessionKeysBundlesCollection
  from "passbolt-styleguide/src/shared/models/entity/sessionKey/sessionKeysBundlesCollection";
import SessionKeysBundlesSessionStorageStorageService from "../sessionStorage/sessionKeysBundlesSessionStorageService";

const FIND_AND_UPDATE_SESSION_KEYS_SS_LOCK_PREFIX = "FIND_AND_UPDATE_SESSION_KEYS_SS_LOCK-";

/**
 * The service aims to find session keys bundles from the API and store them in the session storage.
 */
export default class FindAndUpdateSessionKeysSessionStorageService {
  /**
   * @constructor
   * @param {AccountEntity} account The user account
   * @param {ApiClientOptions} apiClientOptions The api client options
   */
  constructor(account, apiClientOptions) {
    this.account = account;
    this.findSessionKeysService = new FindSessionKeysService(apiClientOptions, account);
    this.sessionKeysBundlesSessionStorageService = new SessionKeysBundlesSessionStorageStorageService(account);
  }

  /**
   * Retrieve the session keys bundles from the API and store them in the session storage.
   * @returns {Promise<SessionKeysBundlesCollection>}
   */
  async findAndUpdateAllBundles() {
    const lockKey = `${FIND_AND_UPDATE_SESSION_KEYS_SS_LOCK_PREFIX}${this.account.id}`;

    // If no update is in progress, refresh the session storage.
    return await navigator.locks.request(lockKey, {ifAvailable: true}, async lock => {
      // Lock not granted, an update is already in progress. Wait for its completion and return the value of the session storage.
      if (!lock) {
        const hasRuntimeCache = this.sessionKeysBundlesSessionStorageService.hasCachedData();
        return await navigator.locks.request(lockKey, {mode: "shared"}, async() =>
          new SessionKeysBundlesCollection(await this.sessionKeysBundlesSessionStorageService.get(), {validate: !hasRuntimeCache})
        );
      }

      // Lock is granted, retrieve the metadata types settings and update the local storage.
      const sessionKeysBundlesCollection = await this.findSessionKeysService.findAllBundles();
      await this.sessionKeysBundlesSessionStorageService.set(sessionKeysBundlesCollection);
      return sessionKeysBundlesCollection;
    });
  }
}
