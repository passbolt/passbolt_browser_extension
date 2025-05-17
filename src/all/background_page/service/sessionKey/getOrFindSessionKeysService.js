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
import {assertArrayUUID, assertNonEmptyString} from "../../utils/assertions";
import SessionKeysCollection from "passbolt-styleguide/src/shared/models/entity/sessionKey/sessionKeysCollection";

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
   * Get the session keys bundles from the session storage, or retrieve them from the API and update the session storage.
   * @param {string|null} [passphrase = null] The passphrase to use to decrypt the session key bundle. Marked as optional
   * as it might be available in the passphrase session storage.
   * @returns {Promise<SessionKeysBundlesCollection>}
   */
  async getOrFindAllBundles(passphrase = null) {
    const hasRuntimeCache = this.sessionKeysBundlesSessionStorageService.hasCachedData();
    const sessionKeysBundles = await this.sessionKeysBundlesSessionStorageService.get();
    if (sessionKeysBundles) {
      return new SessionKeysBundlesCollection(sessionKeysBundles, {validate: !hasRuntimeCache});
    }

    return this.findAndUpdateSessionKeysService.findAndUpdateAllBundles(passphrase);
  }

  /**
   * Get the session keys from the session storage, or retrieve them from the API.
   * @param {string|null} [passphrase = null] The passphrase to use to decrypt the session key bundle.  Marked as optional
   * as it might be available in the passphrase session storage.
   * @returns {Promise<SessionKeysCollection>}
   */
  async getOrFindAll(passphrase = null) {
    const sessionKeysBundlesCollection = await this.getOrFindAllBundles(passphrase);
    if (!sessionKeysBundlesCollection.length) {
      return new SessionKeysCollection([]);
    }
    // Sort to have the recent one in first position
    sessionKeysBundlesCollection.sortByModified();
    const recentSessionKeysCollection = sessionKeysBundlesCollection.items[0].data.sessionKeys;
    // Concatenate all session keys from the most recent one and validate integrity and ignore invalid
    for (let i = 1; i < sessionKeysBundlesCollection.length; i++) {
      recentSessionKeysCollection.pushMany(sessionKeysBundlesCollection.items[i].data.sessionKeys.items, {validate: false, ignoreInvalidEntity: true});
    }
    return recentSessionKeysCollection;
  }

  /**
   * Get the session keys from the session storage, or retrieve them from the API by foreign model and foreign ids.
   * @param {string} foreignModel The foreign model (ex: Resource, Folder, Tag,...)
   * @param {Array<string>} foreignIds The foreign ids (ex: 640ebc06-5ec1-5322-a1ae-6120ed2f3a74)
   * @param {string|null} [passphrase = null] The passphrase to use to decrypt the session key bundle.  Marked as optional
   * as it might be available in the passphrase session storage.
   * @returns {Promise<SessionKeysCollection>}
   */
  async getOrFindAllByForeignModelAndForeignIds(foreignModel, foreignIds, passphrase) {
    assertNonEmptyString(foreignModel, 'The parameter "foreignModel" should not be an empty string');
    assertArrayUUID(foreignIds, 'The parameter "foreignIds" should contain only uuid');
    const sessionKeysCollection = await this.getOrFindAll(passphrase);
    sessionKeysCollection.filterOutSessionKeysNotMatchingForeignModelAndForeignIds(foreignModel, foreignIds);
    return sessionKeysCollection;
  }
}
