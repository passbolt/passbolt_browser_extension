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
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import CollectionValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/collectionValidationError";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";

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
   *
   * @param {Object} [contains] Return entities associated models, example: {metadata_private_keys: true}.
   * @param {Object} [filters] Return entities applied filters, example: {deleted: true}.
   * @returns {Promise<MetadataKeysCollection>}
   * @public
   */
  async findAll(contains = {}, filters = {}) {
    const supportedOptions = MetadataKeysApiService.getSupportedContainOptions();
    if (contains && !Object.keys(contains).every(option => supportedOptions.includes(option))) {
      throw new Error("Unsupported contains parameter used, please check supported contains");
    }
    const supportedFilters = MetadataKeysApiService.getSupportedFiltersOptions();
    if (filters && !Object.keys(filters).every(filter => supportedFilters.includes(filter))) {
      throw new Error("Unsupported filter parameter used, please check supported filters");
    }

    const metadataKeysDto = await this.metadataKeysApiService.findAll(contains, filters);
    const collection = new MetadataKeysCollection(metadataKeysDto);

    if (collection.hasDecryptedKeys()) {
      throw new Error("The metadata private keys should not be decrypted.");
    }

    await this.decryptMetadataPrivateKeysService.decryptAllFromMetadataKeysCollection(collection);
    await this.assertArmoredFingerprintPublicAndEntitysMatch(collection);

    return collection;
  }

  /**
   * Retrieve the metadata keys from the API with the contained data necessary for the local storage.
   * @returns {Promise<MetadataKeysCollection>}
   * @public
   */
  findAllForSessionStorage() {
    return this.findAll({metadata_private_keys: true, creator: true, "creator.profile": true}, {deleted: false});
  }

  /**
   * Retrieve the all non deleted metadata keys from the API.
   * @returns {Promise<MetadataKeysCollection>}
   * @public
   */
  findAllNonDeleted() {
    return this.findAll({}, {deleted: false});
  }

  /**
   * Verify the metadata public key entity fingerprint is equal to the  armored key fingerprint
   * @param {MetadataKeysCollection} collection
   * @private
   */
  async assertArmoredFingerprintPublicAndEntitysMatch(collection) {
    for (const [index, metadataKey] of collection.items.entries()) {
      try {
        const publicMetadataKey = await OpenpgpAssertion.readKeyOrFail(metadataKey.armoredKey);

        if (publicMetadataKey.getFingerprint().toLowerCase() !== metadataKey.fingerprint.toLowerCase()) {
          const error = new EntityValidationError();
          error.addError(`metadata_public_keys.${index}.fingerprint`, 'fingerprint_match', 'The fingerprint of the metadata armored public key does not match the entity fingerprint');
          throw error;
        }
      } catch (error) {
        const collectionValidationError = new CollectionValidationError();
        collectionValidationError.addItemValidationError(index, error);
        throw collectionValidationError;
      }
    }
  }
}

export default FindMetadataKeysService;
