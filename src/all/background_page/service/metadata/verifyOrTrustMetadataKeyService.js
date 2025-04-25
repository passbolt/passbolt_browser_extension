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
 * @since         5.1.0
 */

import MetadataKeysSessionStorage from "../session_storage/metadataKeysSessionStorage";
import {assertString} from "../../utils/assertions";
import MetadataKeysCollection from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysCollection";
import GetMetadataTrustedKeyService from "./getMetadataTrustedKeyService";
import ConfirmMetadataKeyContentCodeService from "./ConfirmMetadataKeyContentCodeService";
import TrustMetadataKeyService from "./trustMetadataKeyService";
import UntrustedMetadataKeyError from "../../error/UntrustedMetadataKeyError";

class VerifyOrTrustMetadataKeyService {
  /**
   * @param {WorkerEntity} worker The worker
   * @param {AccountEntity} account The user account
   * @param {ApiClientOptions} apiClientOptions the api client options
   */
  constructor(worker, account, apiClientOptions) {
    this.metadataKeysSessionStorage = new MetadataKeysSessionStorage(account);
    this.getTrustedMetadataKeyLocalStorage = new GetMetadataTrustedKeyService(account);
    this.confirmMetadataKeyContentCodeService = new ConfirmMetadataKeyContentCodeService(worker);
    this.trustMetadataKeyService = new TrustMetadataKeyService(account, apiClientOptions);
  }

  /**
   * verify if a metadata key is trusted, or ask confirmation to the user to trust the new one
   *
   * @param {String} passphrase The user passphrase.
   * @returns {Promise<void>}
   * @throws {UntrustedMetadataKeyError} If user has not confirmed the new metadata key.
   */
  async verifyTrustedOrTrustNewMetadataKey(passphrase) {
    assertString(passphrase, 'The parameter "passphrase" should be a string.');

    const metadataKeys = await this.metadataKeysSessionStorage.get();
    const metadataKeysCollection = new MetadataKeysCollection(metadataKeys, {validate: false});
    const metadataKey = metadataKeysCollection.getFirstByLatestCreated();
    const metadataTrustedKey = await this.getTrustedMetadataKeyLocalStorage.get();

    if (metadataTrustedKey === null && metadataKey !== null) {
      await this.trustMetadataKeyService.trust(metadataKey, passphrase);
    } else if (metadataTrustedKey.isMetadataKeyTrusted(metadataKey?.metadataPrivateKeys.items[0])) {
      return;
    } else {
      const userConfirmation = await this.confirmMetadataKeyContentCodeService.requestConfirm(metadataTrustedKey, metadataKey);
      if (userConfirmation) {
        await this.trustMetadataKeyService.trust(metadataKey, passphrase);
      } else {
        throw new UntrustedMetadataKeyError("The user has not confirmed the new metadata key");
      }
    }
  }
}

export default VerifyOrTrustMetadataKeyService;
