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
 * @since         5.5.0
 */

import {assertUuid} from "../../utils/assertions";
import MetadataKeysApiService from "../api/metadata/metadataKeysApiService";
import RevokeGpgKeyService from "../crypto/revokeGpgKeyService";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import GetOrFindMetadataKeysService from "./getOrFindMetadataKeysService";
import MetadataKeyEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeyEntity";

/**
 * The service aims to update a metadata key.
 */
export default class ExpireMetadataKeyService {
  /**
   * @constructor
   * @param {AccountEntity} account the account associated to the worker
   * @param {ApiClientOptions} apiClientOptions The api client options
   */
  constructor(account, apiClientOptions) {
    this.metadataKeysApiService = new MetadataKeysApiService(apiClientOptions);
    this.getOrFindMetadataKeysService = new GetOrFindMetadataKeysService(account, apiClientOptions);
  }

  /**
   * Update the metadata key on the Passbolt API
   *
   * @param {string} metadataKeyId The metadata key id to expire
   * @param {string} passphrase The passphrase
   * @returns {Promise<void>}
   * @throws {TypeError} if the `metadataKeyId` argument is not a uuid
   */
  async expire(metadataKeyId, passphrase) {
    assertUuid(metadataKeyId);
    // Get the metadata keys collection
    const metadataKeysCollection = await this.getOrFindMetadataKeysService.getOrFindAll(passphrase);
    const metadataKey = metadataKeysCollection.getFirst("id", metadataKeyId);
    // Get the metadata private key
    const metadataPrivateKey = metadataKey.metadataPrivateKeys.items[0];
    const privateKeyToRevoke = await OpenpgpAssertion.readKeyOrFail(metadataPrivateKey.data.armoredKey);
    // Get the public key revoked
    const publicKeyRevoked = await RevokeGpgKeyService.revoke(privateKeyToRevoke);
    // Update the metadata key
    const metadataKeyUpdate = new MetadataKeyEntity({
      fingerprint: metadataKey.fingerprint,
      armored_key: publicKeyRevoked.armor(),
      expired: new Date().toISOString()
    });
    await this.metadataKeysApiService.update(metadataKeyId, metadataKeyUpdate);
  }
}
