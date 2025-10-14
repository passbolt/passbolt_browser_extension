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

import FavoriteResourceService from "../../service/favorite/favoriteResourceService";
import {assertUuid} from "../../utils/assertions";

class FavoriteResourceController {
  /**
   * @constructor
   * @param {Worker} worker
   * @param {string} requestId
   * @param {AccountEntity} account the user account
   * @param {ApiClientOptions} apiClientOptions The api client options
   */
  constructor(worker, requestId, apiClientOptions, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.apiClientOptions = apiClientOptions;
    this.account = account;
    this.favoriteResourceService =  new FavoriteResourceService(this.apiClientOptions, this.account);
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
   * Mark a resource as favorite.
   * @param resourceId {uuid} The resource id
   * @returns {Promise<FavoriteEntity>}
   */
  async exec(resourceId) {
    assertUuid(resourceId);
    return await this.favoriteResourceService.addResourceToFavorite(resourceId);
  }
}

export default FavoriteResourceController;
