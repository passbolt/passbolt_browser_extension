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
 * @since         5.7.0
 */

import SecretRevisionsSettingsApiService from "../api/secretRevision/secretRevisionsSettingsApiService";
import SecretRevisionsSettingsEntity from "passbolt-styleguide/src/shared/models/entity/secretRevision/secretRevisionsSettingsEntity";
import {assertType} from "../../utils/assertions";

export default class SaveSecretRevisionsSettingsService {
  /**
   * @constructor
   * @param {ApiClientOptions} apiClientOptions The api client options
   */
  constructor(apiClientOptions) {
    this.secretRevisionsSettingsApiService = new SecretRevisionsSettingsApiService(apiClientOptions);
  }

  /**
   * Save secret revision settings.
   * @param {SecretRevisionsSettingsEntity} secretRevisionSettingsEntity
   * @returns {Promise<SecretRevisionsSettingsEntity>}
   */
  async saveSettings(secretRevisionSettingsEntity) {
    assertType(secretRevisionSettingsEntity, SecretRevisionsSettingsEntity);
    const httpResponse = await this.secretRevisionsSettingsApiService.save(secretRevisionSettingsEntity);
    return new SecretRevisionsSettingsEntity(httpResponse.body);
  }
}
