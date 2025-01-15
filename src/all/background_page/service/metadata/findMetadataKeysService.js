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
 * @since         v4.10.0
 */

import MetadataKeysCollection from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysCollection";
import DecryptMetadataPrivateKeysService from "../metadata/decryptMetadataPrivateKeysService";
import MetadataKeysApiService from "../api/metadata/metadataKeysApiService";

class FindMetadataKeysService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @param {AccountEntity} account the user account
   * @public
   */
  constructor(apiClientOptions, account) {
    this.metadataKeysApiService = new MetadataKeysApiService(apiClientOptions);
    this.decryptMetadataPrivateKeysService = new DecryptMetadataPrivateKeysService(account);
  }

  /**
   * Retrieve the metadata keys from the API.
   * @returns {Promise<MetadataKeysCollection>}
   * @public
   */
  async findAll(contains = {}) {
    const supportedOptions = MetadataKeysApiService.getSupportedContainOptions();
    if (contains && !Object.keys(contains).every(option => supportedOptions.includes(option))) {
      throw new Error("Unsupported contains parameter used, please check supported contains");
    }

    const metadataKeysDto = await this.metadataKeysApiService.findAll(contains);

    const collection = new MetadataKeysCollection(metadataKeysDto);
    if (collection.hasDecryptedKeys()) {
      throw new Error("The metadata private keys should not be decrypted.");
    }

    await this.decryptMetadataPrivateKeysService.decryptAllFromMetadataKeysCollection(collection);

    return collection;
  }

  /**
   * Retrieve the metadata keys from the API with the contained data necessary for the local storage.
   * @returns {Promise<MetadataKeysCollection>}
   * @public
   */
  findAllForSessionStorage() {
    return this.findAll({metadata_private_keys: true});
  }
}

export default FindMetadataKeysService;
