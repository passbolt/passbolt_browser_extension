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
 * @since         4.10.0
 */
import FindMetadataKeysService from "./findMetadataKeysService";
import MetadataKeysSessionStorage from "../session_storage/metadataKeysSessionStorage";
import MetadataKeysCollection from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysCollection";

const FIND_AND_UPDATE_METADATA_KEYS_SS_LOCK_PREFIX = "FIND_AND_UPDATE_METADATA_KEYS_SS_LOCK-";

/**
 * The service aims to find metadata keys from the API and store them in the session storage.
 */
export default class FindAndUpdateMetadataKeysSessionStorageService {
  /**
   * @constructor
   * @param {AccountEntity} account The user account
   * @param {ApiClientOptions} apiClientOptions The api client options
   */
  constructor(account, apiClientOptions) {
    this.account = account;
    this.findMetadataKeysService = new FindMetadataKeysService(apiClientOptions, account);
    this.metadataKeysSessionStorage = new MetadataKeysSessionStorage(account);
  }

  /**
   * Retrieve the metadata keys from the API and store them in the session storage.
   * @param {string|null} [passphrase = null] The passphrase to use to decrypt the metadata. Marked as optional as it
   * might be available in the passphrase session storage.
   * @returns {Promise<MetadataKeysCollection>}
   */
  async findAndUpdateAll(passphrase = null) {
    const lockKey = `${FIND_AND_UPDATE_METADATA_KEYS_SS_LOCK_PREFIX}${this.account.id}`;

    // If no update is in progress, refresh the session storage.
    return await navigator.locks.request(lockKey, {ifAvailable: true}, async lock => {
      // Lock not granted, an update is already in progress. Wait for its completion and return the value of the session storage.
      if (!lock) {
        return await navigator.locks.request(lockKey, {mode: "shared"}, async() =>
          new MetadataKeysCollection(await this.metadataKeysSessionStorage.get())
        );
      }

      // Lock is granted, retrieve the metadata keys and update the session storage.
      const metadataKeys = await this.findMetadataKeysService.findAllForSessionStorage(passphrase);
      await this.metadataKeysSessionStorage.set(metadataKeys);
      return metadataKeys;
    });
  }
}
