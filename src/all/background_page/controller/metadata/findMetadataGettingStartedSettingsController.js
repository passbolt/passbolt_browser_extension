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
import FindMetadataGettingStartedSettingsService from "passbolt-styleguide/src/shared/services/metadata/findMetadataGettingStartedSettingsService";

export default class FindMetadataGettingStartedSettingsController {
  /**
   * @constructor
   * @param {Worker} worker
   * @param {string} requestId
   * @param {ApiClientOptions} apiClientOptions the api client options
   */
  constructor(worker, requestId, apiClientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.findMetadataGettingStartedSettingsService = new FindMetadataGettingStartedSettingsService(apiClientOptions);
  }

  /**
   * Controller executor.
   * @returns {Promise<void>}
   */
  async _exec() {
    try {
      const result = await this.exec();
      this.worker.port.emit(this.requestId, 'SUCCESS', result);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Find the metadata getting started settings.
   * @returns {Promise<MetadataGettingStartedSettingsEntity>}
   */
  async exec() {
    return await this.findMetadataGettingStartedSettingsService.findGettingStartedSettings();
  }
}
