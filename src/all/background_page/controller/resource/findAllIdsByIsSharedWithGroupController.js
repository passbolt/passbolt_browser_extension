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
import GetPassphraseService from "../../service/passphrase/getPassphraseService";
import UserPassphraseRequiredError from "passbolt-styleguide/src/shared/error/userPassphraseRequiredError";

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
    this.getPassphraseService = new GetPassphraseService(account);
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
   * @param {string} groupId The group id to filter the resources with
   * @returns {Promise<Array<string>>} Return the id of filtered resources.
   * @throw {TypeError} If the groupId is not valid UUID
   */
  async exec(groupId) {
    assertUuid(groupId);

    try {
      /**
       * Try to fetch the resources.
       * If the user passphrase is required but not in sessionStorage, prompt the user. The passphrase is needed when:
       * 1. the metadata could be decrypted with a metadata session key, but the session keys are themselves encrypted;
       * 2. the metadata is encrypted with the shared‑metadata key, but this one is not yet decrypted in the session storage;
       * 3. the metadata is encrypted with the user’s private key.
       */
      return (await this.findAndUpdateResourcesLocalStorage.findAndUpdateByIsSharedWithGroup(groupId))
        .extract("id");
    } catch (error) {
      if (!(error instanceof UserPassphraseRequiredError)) {
        throw error;
      }
      const passphrase =  await this.getPassphraseService.getPassphrase(this.worker, 60);
      return (await this.findAndUpdateResourcesLocalStorage.findAndUpdateByIsSharedWithGroup(groupId, passphrase))
        .extract("id");
    }
  }
}

export default FindAllIdsByIsSharedWithGroupController;
