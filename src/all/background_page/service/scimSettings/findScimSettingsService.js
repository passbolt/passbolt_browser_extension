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

import ScimSettingsEntity from "passbolt-styleguide/src/shared/models/entity/scimSettings/scimSettingsEntity";
import ScimSettingsApiService from "../api/scimSettings/scimSettingsApiService";

class FindScimSettingsService {
  /**
   * @constructor
   * @param {ApiClientOptions} apiClientOptions The api client options
   */
  constructor(apiClientOptions) {
    this.scimSettingsApiService = new ScimSettingsApiService(apiClientOptions);
  }

  /**
   * Get SCIM settings
   * @returns {Promise<ScimSettingsEntity|null>} The SCIM settings entity or null if not found
   */
  async get() {
    const result = await this.scimSettingsApiService.get();
    if (Object.keys(result.body).length > 0) {
      return ScimSettingsEntity.createFromScimSettingsFind(result.body);
    }
    return null;
  }
}

export default FindScimSettingsService;

