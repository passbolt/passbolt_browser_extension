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
import ResourceService from "../../api/resource/resourceService";
import ResourceLocalStorage from "../../local_storage/resourceLocalStorage";
import i18n from "../../../sdk/i18n";
import {assertArrayUUID} from "../../../utils/assertions";
import ExecuteConcurrentlyService from "../../execute/executeConcurrentlyService";
class DeleteResourceService {
  /**
   * Constructor
   * @param {AccountEntity} account The user account
   * @param {ApiClientOptions} apiClientOptions The api client options
   * @param {ProgressService} progressService
   */
  constructor(account, apiClientOptions, progressService) {
    this.account = account;
    this.resourceService = new ResourceService(apiClientOptions);
    this.progressService = progressService;
  }

  /**
   * Delete a bulk of resources
   * @param {Array<string>} resourceIds The resourceIds
   * @returns {Promise<void>}
   */
  async deleteResources(resourceIds) {
    assertArrayUUID(resourceIds);
    /**
     * 1. Delete the Resources
     * 2. Update the local storage
     */
    this.progressService.finishStep(i18n.t("Deleting Resource(s)"), true);
    let deleteCounter = 0;
    const deleteCallBacks = resourceId => {
      this.progressService.updateStepMessage(i18n.t("Deleting resource(s) {{counter}}/{{total}}", {counter: ++deleteCounter, total: resourceIds.length}));
      return this.resourceService.delete(resourceId);
    };

    const callbacks = resourceIds.map(resourceId => () => deleteCallBacks(resourceId));
    const executeConcurrentlyService = new ExecuteConcurrentlyService();
    await executeConcurrentlyService.execute(callbacks, 5);

    this.progressService.finishStep(i18n.t("Updating resources local storage"), true);
    await ResourceLocalStorage.deleteResources(resourceIds);
  }
}


export default DeleteResourceService;
