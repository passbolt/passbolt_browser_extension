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
import DeleteResourceService from "../../service/resource/delete/deleteResourceService";
import ProgressService from "../../service/progress/progressService";
import i18n from "../../sdk/i18n";

class ResourceDeleteController {
  /**
   * ResourceDeleteController constructor
   * @param {Worker} worker
   * @param {string} requestId
   * @param {ApiClientOptions} apiClientOptions the api client options
   * @param {AccountEntity} account The account associated to the worker.clientOptions
   */
  constructor(worker, requestId, apiClientOptions, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.progressService = new ProgressService(this.worker, i18n.t("Delete Resources"));
    this.resourceDeleteService = new DeleteResourceService(account, apiClientOptions, this.progressService);
  }

  /**
   * Controller executor.
   * @param {Array<string>} resourceIds The resourceIds to delete
   * @returns {Promise<void>}
   */
  async _exec(resourceIds) {
    try {
      await this.exec(resourceIds);
      this.worker.port.emit(this.requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Delete resources.
   * @param {Array<string>} resourceIds The resourceIds
   * @returns {Promise<void>}
   */
  async exec(resourceIds) {
    const steps = 2;
    this.progressService.start(steps, i18n.t('Deleting Resource(s)'));
    this.progressService.title = i18n.t("Delete {{count}} resource(s)", {count: resourceIds.length});

    try {
      await this.resourceDeleteService.deleteResources(resourceIds);
      this.progressService.finishStep(i18n.t('Done!'), true);
    } finally {
      this.progressService.close();
    }
  }
}

export default ResourceDeleteController;
