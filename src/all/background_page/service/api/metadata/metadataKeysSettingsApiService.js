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

import AbstractService from "../abstract/abstractService";

const METADATA_KEYS_SETTINGS_API_SERVICE_RESOURCE_NAME = "metadata/keys/settings";

class MetadataKeysSettingsApiService extends AbstractService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, METADATA_KEYS_SETTINGS_API_SERVICE_RESOURCE_NAME);
  }

  /**
   * Retrieve the metadata types settings from the API.
   * @returns {Promise<Object>} Response body
   * @public
   */
  async findSettings() {
    const apiResult = await this.apiClient.findAll();
    return apiResult.body;
  }
}

export default MetadataKeysSettingsApiService;
