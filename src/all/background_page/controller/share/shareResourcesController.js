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
 * @since         2.8.0
 */
import GetPassphraseService from "../../service/passphrase/getPassphraseService";
import ProgressService from "../../service/progress/progressService";
import {assertArray, assertArrayUUID, assertNonEmptyArray} from "../../utils/assertions";
import ShareResourceService from "../../service/share/shareResourceService";
import i18n from "../../sdk/i18n";
import PermissionChangesCollection from "../../model/entity/permission/change/permissionChangesCollection";

class ShareResourcesController {
  /**
   * ShareResourcesController constructor
   *
   * @param {Worker} worker
   * @param {string} requestId
   * @param {ApiClientOptions} apiClientOptions the api client options
   * @param {AccountEntity} account The account associated to the worker.
   */
  constructor(worker, requestId, apiClientOptions, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.progressService = new ProgressService(this.worker);
    this.shareResourceService = new ShareResourceService(apiClientOptions, account, this.progressService);
    this.getPassphraseService = new GetPassphraseService(account);
  }

  /**
   * Wrapper of exec function to run it with worker.
   *
   * @return {Promise<void>}
   */
  async _exec(resources, changes) {
    try {
      await this.exec(resources, changes);
      this.worker.port.emit(this.requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Share multiple resources.
   *
   * @param {array} resourcesIds The resources ids to share
   * @param {array} permissionChangesDto The permissions changes
   * @return {Promise}
   */
  async exec(resourcesIds, permissionChangesDto) {
    assertArray(resourcesIds, 'The parameter "resourcesIds" should be an array');
    assertNonEmptyArray(resourcesIds, 'The parameter "resourcesIds" should be a non empty array');
    assertArrayUUID(resourcesIds, 'The parameter "resourcesIds" should contain only uuid');
    assertArray(permissionChangesDto, 'The parameter "permissionChangesDto" should be an array');
    assertNonEmptyArray(permissionChangesDto, 'The parameter "permissionChangesDto" should be a non empty array');

    const permissionChanges = new PermissionChangesCollection(permissionChangesDto);
    const passphrase = await this.getPassphraseService.getPassphrase(this.worker);

    /*
     * 7 steps are required to share resources:
     * - Updating the resources metadata
     * - Calculating the secrets requirements
     * - Retrieving the secrets
     * - Decrypting the secrets
     * - Encrypting the secrets
     * - Synchronizing keyring
     * - Sharing resources
     * - Updating resources local storage
     */
    const goals = 8;
    this.progressService.title = i18n.t("Share {{count}} resource", {count: resourcesIds.length});
    this.progressService.start(goals, i18n.t('Initialize'));

    try {
      await this.shareResourceService.shareAll(resourcesIds, permissionChanges, passphrase);
      this.progressService.finishStep(i18n.t('Done!'), true);
    } finally {
      this.progressService.close();
    }
  }
}

export default ShareResourcesController;
