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
import FindActionLogService from "../model/actionLog/findActionLogService";

class FindAllForActionLogController {
  /**
   * @constructor
   * @param {Worker} worker The worker
   * @param {string} requestId uuid
   * @param {ApiClientOptions} apiClientOptions The api client options
   * @param {AccountEntity} account the user account
   */
  constructor(worker, requestId, apiClientOptions, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.findAllForActionLogService = new FindActionLogService(apiClientOptions, account);
  }

  /**
   * Controller executor.
   * @param {string} foreignModel The foreign model
   * @param {string} foreignId The foreign ID
   * @param {object} options Options
   * @param {number} options.page The page number
   * @param {number} options.limit The limit of activities per page
   * @returns {Promise<void>}
   */
  async _exec(foreignModel, foreignId, {page, limit}) {
    try {
      const result = await this.exec(foreignModel, foreignId, {page, limit});
      this.worker.port.emit(this.requestId, 'SUCCESS', result);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Find all action logs
   * @returns {Promise<*>}
   */
  async exec(foreignModel, foreignId, {page, limit}) {
    return this.findAllForActionLogService.findAllFor(foreignModel, foreignId, page, limit);
  }
}

export default FindAllForActionLogController;
