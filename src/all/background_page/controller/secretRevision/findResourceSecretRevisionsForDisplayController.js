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

import GetPassphraseService from "../../service/passphrase/getPassphraseService";
import FindAndDecryptSecretRevisionsService from "../../service/secretRevisions/findAndDecryptSecretRevisionsService";
import {assertUuid} from "../../utils/assertions";

export default class FindResourceSecretRevisionsForDisplayController {
  /**
   * @constructor
   * @param {Worker} worker
   * @param {string} requestId
   * @param {ApiClientOptions} apiClientOptions the api client options
   */
  constructor(worker, requestId, apiClientOptions, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.findAndDecryptSecretRevisionsService = new FindAndDecryptSecretRevisionsService(apiClientOptions);
    this.getPassphraseService = new GetPassphraseService(account);
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
   * Find the resource decrypted secret revisions.
   * @param {string resourceId}
   * @returns {Promise<SecretRevisionsSettingsEntity>}
   */
  async exec(resourceId) {
    assertUuid(resourceId);
    const passphrase = await this.getPassphraseService.getPassphrase(this.worker);
    return this.findAndDecryptSecretRevisionsService.findAllByResourceIdAndDecryptForDisplay(resourceId, passphrase);
  }
}
