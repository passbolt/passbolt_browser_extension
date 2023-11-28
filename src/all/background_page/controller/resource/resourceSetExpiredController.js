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
 * @since         4.5.0
 */
import i18n from "../../sdk/i18n";
import ProgressService from "../../service/progress/progressService";
import PasswordExpiryResourceModel from "../../model/passwordExpiry/passwordExpiryResourceModel";
import PasswordExpiryResourcesCollection from "../../model/entity/passwordExpiry/passwordExpiryResourcesCollection";

class ResourceSetExpiredController {
  /**
   * ImportResourcesFileController constructor
   * @param {Worker} worker
   * @param {string} requestId
   * @param {ApiClientOptions} apiClientOptions the api client options
   */
  constructor(worker, requestId, apiClientOptions) {
    this.worker = worker;
    this.requestId = requestId;

    // Models
    this.passwordExpiryResourceModel = new PasswordExpiryResourceModel(apiClientOptions);

    // Progress
    this.progressService = new ProgressService(this.worker, i18n.t("Mark as expired ..."));
  }

  /**
   * Controller executor.
   * @returns {Promise<void>}
   */
  async _exec(passwordExpiryResourcesCollectionDto) {
    try {
      const passwordExpiryResourcesCollection = await this.exec(passwordExpiryResourcesCollectionDto);
      this.worker.port.emit(this.requestId, 'SUCCESS', passwordExpiryResourcesCollection);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Main exec function
   * @param {Array<Object>} passwordExpiryResourcesCollectionDto The password expiry resources collection
   * @returns {Promise<PasswordExpiryResourcesCollection>}
   */
  async exec(passwordExpiryResourcesCollectionDto) {
    this.progressService.start(0, i18n.t('Initialize'));
    const passwordExpiryResourcesCollection = new PasswordExpiryResourcesCollection(passwordExpiryResourcesCollectionDto);
    try {
      return await this.setResourcesExpired(passwordExpiryResourcesCollection);
    } finally {
      await this.progressService.close();
    }
  }

  /**
   * Set the resources expired.
   * @param {PasswordExpiryResourcesCollection} passwordExpiryResourcesCollection The password expiry resources collection
   * @returns {Promise<PasswordExpiryResourcesCollection>}
   */
  async setResourcesExpired(passwordExpiryResourcesCollection) {
    return await this.passwordExpiryResourceModel.update(passwordExpiryResourcesCollection);
  }
}

export default ResourceSetExpiredController;
