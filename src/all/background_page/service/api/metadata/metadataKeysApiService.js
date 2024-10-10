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

import {assertType} from "../../../utils/assertions";
import AbstractService from "../abstract/abstractService";

const METADATA_KEYS_API_SERVICE_RESOURCE_NAME = "metadata/keys";

class MetadataKeysApiService extends AbstractService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, METADATA_KEYS_API_SERVICE_RESOURCE_NAME);
  }

  /**
   * Return the list of supported options for the contains option in API find operations
   *
   * @returns {Array<string>} list of supported option
   */
  static getSupportedContainOptions() {
    return [
      'metadata_private_keys',
    ];
  }

  /**
   * Retrieve the metadata keys from the API.
   * @returns {Promise<Array>}
   * @public
   */
  async findAll(contains = {}) {
    assertType(contains, Object, 'The given contains is not an Object');

    contains = contains ? this.formatContainOptions(contains, MetadataKeysApiService.getSupportedContainOptions()) : null;

    const options = {...contains};
    const response = await this.apiClient.findAll(options);
    if (!response.body || !response.body.length) {
      return [];
    }

    return response.body;
  }
}

export default MetadataKeysApiService;
