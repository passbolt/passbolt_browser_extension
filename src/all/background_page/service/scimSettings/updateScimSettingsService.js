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
import {assertType, assertUuid} from "../../utils/assertions";

class UpdateScimSettingsService {
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
  async update(id, scimSettings) {
    assertUuid(id);
    assertType(scimSettings, ScimSettingsEntity);
    const result = await this.scimSettingsApiService.update(id, scimSettings);
    const entity = new ScimSettingsEntity(result.body);
    entity.secretToken = ScimSettingsEntity.EMPTY_SECRET_VALUE;
    return entity;
  }
}

export default UpdateScimSettingsService;

