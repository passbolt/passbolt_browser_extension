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
 * @since         5.13.0
 */
import ShareApiService from "../api/share/shareApiService";
import UserAndGroupSearchResultsCollection from "../../model/entity/userAndGroupSearchResultEntity/userAndGroupSearchResultCollection";
import { assertString } from "../../utils/assertions";

class SearchUsersAndGroupsService {
  /**
   * Constructor
   * @param {ApiClientOptions} apiClientOptions
   */
  constructor(apiClientOptions) {
    this.shareApiService = new ShareApiService(apiClientOptions);
  }

  /**
   * Search users and groups matching the given keyword.
   * @param {string} keyword
   * @returns {Promise<UserAndGroupSearchResultsCollection>}
   * @throws {Error} if keyword is not a valid string
   */
  async search(keyword) {
    assertString(keyword, "keyword is not a valid string");
    const contains = { profile: true, user_count: true };
    const result = await this.shareApiService.searchUsersAndGroups(keyword, contains);
    return new UserAndGroupSearchResultsCollection(result);
  }
}

export default SearchUsersAndGroupsService;
