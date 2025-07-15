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
import {assertUuid, assertNonEmptyString, assertNumber} from "../../utils/assertions";
import AbstractActionLogEntity from "../entity/actionLog/abstractActionLogEntity";
import ActionLogApiService from "../../service/api/actionLog/actionLogApiService";

class FindActionLogService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    this.actionLogApiService = new ActionLogApiService(apiClientOptions);
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
    this.assertValidForeignModel(foreignModel);
    assertUuid(foreignId);
    assertNumber(page);
    assertNumber(limit);
    const actionLogsDto = await this.actionLogApiService.findAllFor(foreignModel, foreignId, page, limit);
    return new ActionLogsCollection(actionLogsDto);
  }

  /**
   * Assert a foreign model name is supported by the API
   *
   * @param {string} foreignModel for example 'Resource'
   * @throw {TypeError} if the name is not a valid string or is not supported
   * @public
   */
  assertValidForeignModel(foreignModel) {
    assertNonEmptyString(foreignModel, 'ActionLog foreign model should be a valid string.');
    if (!AbstractActionLogEntity.ALLOWED_FOREIGN_MODELS.includes(foreignModel)) {
      throw new TypeError(`ActionLog foreign model ${foreignModel} is not in the list of supported models.`);
    }
  }
}

export default FindActionLogService;
