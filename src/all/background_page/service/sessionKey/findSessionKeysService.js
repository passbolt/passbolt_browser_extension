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
 * @since         v4.10.1
 */

import SessionKeysBundlesApiService from "../api/sessionKey/sessionKeysBundlesApiService";
import SessionKeysBundlesCollection
  from "passbolt-styleguide/src/shared/models/entity/sessionKey/sessionKeysBundlesCollection";
import DecryptSessionKeysBundlesService from "./decryptSessionKeysBundlesService";

class FindSessionKeysService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @param {AbstractAccountEntity} account the account associated to the worker
   * @public
   */
  constructor(apiClientOptions, account) {
    this.sesionKeysBundlesApiService = new SessionKeysBundlesApiService(apiClientOptions);
    this.decryptSessionKeysBundlesService = new DecryptSessionKeysBundlesService(account);
  }

  /**
   * Retrieve the session keys bundles from the API.
   * @returns {Promise<SessionKeysBundlesCollection>}
   * @throws {Error} if some session keys bundles are decrypted
   * @public
   */
  async findAllBundles() {
    const sessionKeysBundleDto = await this.sesionKeysBundlesApiService.findAll();

    const collection = new SessionKeysBundlesCollection(sessionKeysBundleDto);
    if (collection.hasSomeDecryptedSessionKeysBundles()) {
      throw new Error("The session keys bundles should not be decrypted.");
    }

    await this.decryptSessionKeysBundlesService.decryptAll(collection);

    return collection;
  }
}

export default FindSessionKeysService;
