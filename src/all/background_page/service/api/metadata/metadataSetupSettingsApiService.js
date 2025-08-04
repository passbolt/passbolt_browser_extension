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
 * @since         5.4.0
 */

import AbstractService from "../abstract/abstractService";
import PassboltResponseEntity from "passbolt-styleguide/src/shared/models/entity/apiService/PassboltResponseEntity";

const METADATA_SETUP_RESOURCE_NAME = "metadata/setup/";

export default class MetadataSetupSettingsApiService extends AbstractService  {
  /**
   * @constructor
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, METADATA_SETUP_RESOURCE_NAME);
  }

  /**
   * Find the metadata setup settings on the Passbolt API
   *
   * @returns {Promise<PassboltResponseEntity>} the api response
   * @public
   */
  async find() {
    const response = await this.apiClient.get("settings");
    return new PassboltResponseEntity(response);
  }
}
