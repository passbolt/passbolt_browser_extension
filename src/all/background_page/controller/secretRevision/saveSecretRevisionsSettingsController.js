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

import SecretRevisionsSettingsEntity from "passbolt-styleguide/src/shared/models/entity/secretRevision/secretRevisionsSettingsEntity";
import SaveSecretRevisionsSettingsService from "../../service/secretRevisions/saveSecretRevisionsSettingsService";

export default class SaveSecretRevisionsSettingsController {
  /**
   * @constructor
   * @param {Worker} worker
   * @param {string} requestId
   * @param {ApiClientOptions} apiClientOptions the api client options
   */
  constructor(worker, requestId, apiClientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.saveSecretRevisionsSettingsService = new SaveSecretRevisionsSettingsService(apiClientOptions);
  }

  /**
   * Controller executor.
   * @returns {Promise<void>}
   */
  async _exec() {
    try {
      const result = await this.exec.apply(this, arguments);
      this.worker.port.emit(this.requestId, 'SUCCESS', result);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Save the given secret revisions settings dto onto the API.
   * @param {object} secretRevisionsSettingsDto
   * @returns {Promise<SecretRevisionsSettingsEntity>}
   */
  async exec(secretRevisionsSettingsDto) {
    const secretRevisionsSettingsEntity = new SecretRevisionsSettingsEntity(secretRevisionsSettingsDto);
    return this.saveSecretRevisionsSettingsService.saveSettings(secretRevisionsSettingsEntity);
  }
}
