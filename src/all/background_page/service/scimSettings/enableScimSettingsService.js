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
import {assertType} from "../../utils/assertions";

class EnableScimSettingsService {
  /**
   * @constructor
   * @param {ApiClientOptions} apiClientOptions The api client options
   */
  constructor(apiClientOptions) {
    this.scimSettingsApiService = new ScimSettingsApiService(apiClientOptions);
  }

  /**
   * Create SCIM settings
   * @param {ScimSettingsEntity} scimSettings
   * @returns {Promise<ScimSettingsEntity|null>} The SCIM settings entity or null if not found
   */
  async enable(scimSettings) {
    assertType(scimSettings, ScimSettingsEntity);
    const result = await this.scimSettingsApiService.create(scimSettings);
    const entity = new ScimSettingsEntity(result.body);
    entity.secretToken = ScimSettingsEntity.EMPTY_SECRET_VALUE;
    return entity;
  }
}

export default EnableScimSettingsService;
