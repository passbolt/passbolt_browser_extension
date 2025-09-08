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
import UpdateScimSettingsService from "../../service/scimSettings/updateScimSettingsService";
import {assertUuid} from "../../utils/assertions";

class UpdateScimSettingsController {
  /**
   * @constructor
   * @param {Worker} worker
   * @param {string} requestId
   * @param {ApiClientOptions} apiClientOptions the api client options
   */
  constructor(worker, requestId, apiClientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.updateScimSettingsService = new UpdateScimSettingsService(apiClientOptions);
  }

  /**
   * Controller executor.
   * @returns {Promise<void>}
   */
  async _exec(id, data) {
    try {
      const result = await this.exec(id, data);
      this.worker.port.emit(this.requestId, 'SUCCESS', result);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Update SCIM settings.
   * @param {string} id
   * @param {Object} data
   * @returns {Promise<*>} SCIM settings
   */
  async exec(id, data) {
    assertUuid(id);

    const scimSettingForUpdating = ScimSettingsEntity.createFromScimSettingsUpdate(data);
    return await this.updateScimSettingsService.update(id, scimSettingForUpdating);
  }
}

export default UpdateScimSettingsController;
