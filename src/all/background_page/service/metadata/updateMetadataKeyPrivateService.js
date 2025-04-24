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
import MetadataPrivateKeyApiService from "../api/metadata/metadataPrivateKeyApiService";
import {assertType} from "../../utils/assertions";

/**
 * The service aims to update a metadata private key.
 */
export default class UpdateMetadataKeyPrivateService {
  /**
   * @constructor
   * @param {ApiClientOptions} apiClientOptions The api client options
   */
  constructor(apiClientOptions) {
    this.metadataPrivateKeyApiService = new MetadataPrivateKeyApiService(apiClientOptions);
  }

  /**
   * Update and verify the metadata private key on the Passbolt API
   *
   * @param {MetadataPrivateKeyEntity} metadataPrivateKey The settings to save.
   * @returns {Promise<MetadataPrivateKeyEntity>} The updated metadata key
   * @throws {Error} if the `metadataPrivateKey` key is decrypted
   * @throws {TypeError} if the `metadataPrivateKey` argument is not of type MetadataPrivateKeyEntity
   */
  async update(metadataPrivateKey) {
    assertType(metadataPrivateKey, MetadataPrivateKeyEntity);

    if (metadataPrivateKey.isDecrypted) {
      throw new Error("Metadata private key should be encrypted ");
    }
    const privateKey = await this.metadataPrivateKeyApiService.update(metadataPrivateKey);

    metadataPrivateKey.data = privateKey;

    return metadataPrivateKey;
  }
}
