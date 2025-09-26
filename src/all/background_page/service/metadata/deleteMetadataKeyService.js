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
 * @since         5.6.0
 */
import MetadataKeysApiService from "../api/metadata/metadataKeysApiService";
import {assertUuid} from "../../utils/assertions";

/**
 * The service aims to delete an expired metadata key.
 */
export default class DeleteMetadataKeyService {
  /**
   * @constructor
   * @param {ApiClientOptions} apiClientOptions The api client options
   */
  constructor(apiClientOptions) {
    this.metadataKeysApiService = new MetadataKeysApiService(apiClientOptions);
  }

  /**
   * Delete an expired metadata key.
   * @param {string} metadataKeyId The metadata key id.
   * @returns {Promise<void>}
   * @throws {TypeError} if metadataKeyId argument is not a valid uuid
   */
  async delete(metadataKeyId) {
    assertUuid(metadataKeyId);
    await this.metadataKeysApiService.delete(metadataKeyId);
  }
}
