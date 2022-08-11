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
 */
import ActionLogsCollection from "../entity/actionLog/actionLogsCollection";
import ActionLogService from "../../service/api/actionLog/actionLogService";

class ActionLogModel {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    this.actionLogService = new ActionLogService(apiClientOptions);
  }

  /*
   * ==============================================================
   *  Finders / remote calls
   * ==============================================================
   */

  /**
   * Find all action logs for a foreign model
   *
   * @param {string} foreignModel The target foreign model example: resource
   * @param {string} foreignId The target foreign instance
   * @param {int} page The page to retrieve
   * @param {int} limit The limit of elements by page
   * @returns {Promise<*>} response body
   * @throws {Error} if options are invalid or API error
   * @public
   */
  async findAllFor(foreignModel, foreignId, page, limit) {
    const actionLogsDto = await this.actionLogService.findAllFor(foreignModel, foreignId, page, limit);
    return new ActionLogsCollection(actionLogsDto);
  }
}

export default ActionLogModel;
