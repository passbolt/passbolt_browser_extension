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
 * @since         5.3.0
 */
import {assertUuid} from "../../utils/assertions";
import FindAndUpdateResourcesLocalStorage from "../../service/resource/findAndUpdateResourcesLocalStorageService";
import UserPassphraseRequiredError from "passbolt-styleguide/src/shared/error/userPassphraseRequiredError";
import GetPassphraseService from "../../service/passphrase/getPassphraseService";

class UpdateResourcesByParentFolderController {
  /**
   * Constructor.
   * @param {Worker} worker The associated worker.
   * @param {string} requestId The associated request id.
   * @param {ApiClientOptions} apiClientOptions The api client options.
   * @param {AccountEntity} account The user account
   */
  constructor(worker, requestId, apiClientOptions, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.findAndUpdateResourcesLocalStorage = new FindAndUpdateResourcesLocalStorage(account, apiClientOptions);
    this.getPassphraseService = new GetPassphraseService(account);
  }

  /**
   * Controller executor.
   * @param {string} parentFolderId the resources parent folder id
   * @returns {Promise<void>}
   */
  async _exec(parentFolderId) {
    try {
      const result = await this.exec(parentFolderId);
      this.worker.port.emit(this.requestId, 'SUCCESS', result);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Find the resource to display when filtering by folder.
   * @param {string} parentFolderId the resources parent folder id
   * @returns {Promise<ResourcesCollection>}
   */
  async exec(parentFolderId) {
    assertUuid(parentFolderId);
    try {
      await this.findAndUpdateResourcesLocalStorage.findAndUpdateByParentFolderId(parentFolderId);
      return;
    } catch (error) {
      if (!(error instanceof UserPassphraseRequiredError)) {
        throw error;
      }
    }

    const passphrase = await this.getPassphraseService.getPassphrase(this.worker, 60);
    await this.findAndUpdateResourcesLocalStorage.findAndUpdateByParentFolderId(parentFolderId, passphrase);
  }
}

export default UpdateResourcesByParentFolderController;
