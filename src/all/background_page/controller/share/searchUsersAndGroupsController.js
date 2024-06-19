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
 * @since         4.9.0
 */

import ShareModel from "../../model/share/shareModel";
import {assertString} from "../../utils/assertions";

class SearchUsersAndGroupsController {
  /**
   * DeleteLocalSsoKitController constructor
   * @param {Worker} worker
   * @param {string} requestId uuid
   * @param {ApiClientOptions} apiClientOptions
   */
  constructor(worker, requestId, apiClientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.shareModel = new ShareModel(apiClientOptions);
  }

  /**
   * Wrapper of exec function to run it with worker.
   * @param {string} keyword
   * @return {Promise<void>}
   */
  async _exec(keyword) {
    try {
      const result = await this.exec(keyword);
      this.worker.port.emit(this.requestId, "SUCCESS", result);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, "ERROR", error);
    }
  }

  /**
   * Search users and groups matching the given keyword.
   * @param {string} keyword
   * @return {Promise<UserAndGroupSearchResultsCollection>}
   * @throw {Error} if the keyword parameter is not a valid string
   */
  async exec(keyword) {
    assertString(keyword, "keyword is not a valid string");
    return await this.shareModel.search(keyword);
  }
}

export default SearchUsersAndGroupsController;
