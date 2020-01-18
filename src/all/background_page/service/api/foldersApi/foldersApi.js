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
 * @since         2.13.0
 */
import {ApiClient} from "../apiClient/apiClient";

class FoldersApi {

  /**
   * Constructor
   *
   * @param {string} baseUrl example 'https://cloud.passbolt.com/workspace'
   * @public
   */
  constructor(user) {

    this.client = new ApiClient(baseUrl, 'folders' , );
  }

  /**
   * Find all the folders
   *
   * @throws {PassboltServiceUnavailableError} if service is not reachable
   * @throws {PassboltBadResponseError} if passbolt API responded with non parsable JSON
   * @throws {PassboltApiFetchError} if passbolt API response is not OK (non 2xx status)
   * @returns {Promise<*>}
   * @public
   */
  async findAll() {
    return await this.client.findAll();
  }
}

exports.FoldersApi = FoldersApi;
