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
 * @since         4.9.4
 */

import FindAndUpdateResourcesLocalStorage from "../../service/resource/findAndUpdateResourcesLocalStorageService";
import {assertUuid} from "../../utils/assertions";

class FindAllIdsByIsSharedWithGroupController {
  /**
   * Constructor.
   * @param {Worker} worker The associated worker.
   * @param {string} requestId The associated request id.
   * @param {ApiClientOptions} apiClientOptions The api client options.
   * @param {AccountEntity} account The account associated to the worker.
   */
  constructor(worker, requestId, apiClientOptions, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.account = account;
    this.findAndUpdateResourcesLocalStorage = new FindAndUpdateResourcesLocalStorage(account, apiClientOptions);
  }

  /**
   * Controller executor.
   * @param {uuid} groupId
   * @returns {Promise<void>}
   */
  async _exec(groupId) {
    try {
      const result = await this.exec(groupId);
      this.worker.port.emit(this.requestId, 'SUCCESS', result);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Abort current request and initiate a new one.
   * @param {uuid} groupId
   * @returns {Promise<Array<uuid>>}
   */
  async exec(groupId) {
    assertUuid(groupId);
    return (await this.findAndUpdateResourcesLocalStorage.findAndUpdateByIsSharedWithGroup(groupId)).extract("id");
  }
}

export default FindAllIdsByIsSharedWithGroupController;
