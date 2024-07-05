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
 * @since         4.9.0
 */
import Keyring from "../keyring";
import {assertUuid} from "../../utils/assertions";
import ExternalGpgKeyCollection from "../entity/gpgkey/external/externalGpgKeyCollection";

class GpgkeyModel {
  /**
   * Constructor
   */
  constructor() {
    this.keyring = new Keyring();
  }

  /**
   * Get or find GPG keys given some user ids.
   * @params {uuid} userId
   * @params {boolean} [refreshCache = false] should the cache be refreshed or not.
   * @returns {Promise<GpgkeyEntity|null>}
   */
  async getOrFindUserGpgKey(userId, refreshCache = false) {
    assertUuid(userId, "The given user id is not a valid UUID");

    if (refreshCache) {
      await this.keyring.sync([userId]);
      return this.keyring.findPublic(userId) || null;
    }

    const cachedPublicKey = this.keyring.findPublic(userId);
    if (!cachedPublicKey) {
      //the cache isn't refreshed and the key is nout found, so let's re-run with a cache refresh
      return this.getOrFindUserGpgKey(userId, true);
    }

    return cachedPublicKey;
  }

  /**
   * Find GPG keys given some user ids.
   * The keys that matches no user are ignored.
   * @param {Array<uuid>} userIds
   * @returns {Promise<ExternalGpgkeyCollection>}
   */
  async findGpgKeys(userIds) {
    if (!userIds) {
      return new ExternalGpgKeyCollection([]);
    }

    await this.keyring.sync(userIds);

    const result = [];
    for (let i = 0; i < userIds.length; i++) {
      const publicKey = this.keyring.findPublic(userIds[i]);
      if (publicKey) {
        result.push(publicKey);
      }
    }

    return new ExternalGpgKeyCollection(result);
  }

  /**
   * Find a GPG info given a user id
   * @param {uuid} userId
   * @returns {Promise<ExternalGpgKeyEntity>}
   */
  async findUserGpgKeyInfo(userId) {
    await this.keyring.sync([userId]);
    return this.keyring.findPublic(userId);
  }
}

export default GpgkeyModel;
