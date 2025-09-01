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
 * @since         5.2.0
 */

import ShareMetadataKeyPrivateService from "../../service/metadata/shareMetadataKeyPrivateService";
import VerifyOrTrustMetadataKeyService from "../../service/metadata/verifyOrTrustMetadataKeyService";
import GetPassphraseService from "../../service/passphrase/getPassphraseService";
import {assertUuid} from "../../utils/assertions";

class ShareMetadataKeyPrivateController {
  /**
   * @constructor
   * @param {Worker} worker
   * @param {string} requestId
   * @param {ApiClientOptions} apiClientOptions the api client options
   * @param {AccountEntity} account the user account
   */
  constructor(worker, requestId, apiClientOptions, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.verifyOrTrustMetadataKeyService = new VerifyOrTrustMetadataKeyService(worker, account, apiClientOptions);
    this.getPassphraseService = new GetPassphraseService(account);
    this.shareMetadataKeyPrivateService = new ShareMetadataKeyPrivateService(account, apiClientOptions);
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
   * Share missing metadata private keys with a user.
   * @param {string} userId The userId which is missing metadata private keys.
   * @returns {Promise<void>}
   */
  async exec(userId) {
    assertUuid(userId, "The user id should be a valid uuid.");

    const passphrase = await this.getPassphraseService.getPassphrase(this.worker);
    await this.verifyOrTrustMetadataKeyService.verifyTrustedOrTrustNewMetadataKey(passphrase);
    await this.shareMetadataKeyPrivateService.shareOneMissing(userId, passphrase);
  }
}

export default ShareMetadataKeyPrivateController;
