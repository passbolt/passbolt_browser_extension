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
 * @since         5.1.0
 */

import MetadataPrivateKeyEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataPrivateKeyEntity";
import AbstractService from "../abstract/abstractService";
import {assertType} from "../../../utils/assertions";
import ShareMetadataPrivateKeysCollection from "passbolt-styleguide/src/shared/models/entity/metadata/shareMetadataPrivateKeysCollection";

const METADATA_PRIVATE_KEY_API_SERVICE_RESOURCE_NAME = "metadata/keys/private";

class MetadataPrivateKeyApiService extends AbstractService  {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, METADATA_PRIVATE_KEY_API_SERVICE_RESOURCE_NAME);
  }

  /**
   * Update a metadata private key on the Passbolt API
   *
   * @param {MetadataPrivateKeyEntity} metadataPrivateKey The metadata private key to update
   * @returns {Promise<object>} The updated metadata private key
   * @throws {Error} if the `metadataKey` argument is not encrypted
   * @throws {TypeError} if the `metadataKey` argument is not of type MetadataPrivateKeyEntity
   * @public
   */
  async update(metadataPrivateKey) {
    assertType(metadataPrivateKey, MetadataPrivateKeyEntity);

    if (metadataPrivateKey.isDecrypted) {
      throw new Error("The metadata private key should not be decrypted.");
    }

    const response = await this.apiClient.update(metadataPrivateKey.id, metadataPrivateKey.toDataDto());
    return response.body;
  }

  /**
   * Create new metadata private keys for an expected user on the Passbolt API
   *
   * @param {ShareMetadataPrivateKeysCollection} shareMetadataPrivateKeysCollection The metadata private key to share with user
   * @returns {Promise<void>}
   * @throws {TypeError} if the `shareMetadataPrivateKeysCollection` argument is not of type ShareMetadataPrivateKeysCollection
   * @throws {Error} if the `shareMetadataPrivateKeysCollection` argument contain decrypted private keys
   * @public
   */
  async create(shareMetadataPrivateKeysCollection) {
    assertType(shareMetadataPrivateKeysCollection, ShareMetadataPrivateKeysCollection);

    if (shareMetadataPrivateKeysCollection.hasDecryptedPrivateKeys()) {
      throw new Error("The metadata private keys collection should not contain decrypted private keys.");
    }

    await this.apiClient.create(shareMetadataPrivateKeysCollection.toDto());
  }
}

export default MetadataPrivateKeyApiService;
