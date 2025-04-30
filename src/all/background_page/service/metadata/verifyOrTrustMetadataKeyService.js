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

import GetOrFindMetadataKeysService from "./getOrFindMetadataKeysService";
import {assertString} from "../../utils/assertions";
import GetMetadataTrustedKeyService from "./getMetadataTrustedKeyService";
import ConfirmMetadataKeyContentCodeService from "./ConfirmMetadataKeyContentCodeService";
import TrustMetadataKeyService from "./trustMetadataKeyService";
import UntrustedMetadataKeyError from "../../error/UntrustedMetadataKeyError";
import MetadataKeysSessionStorage from "../session_storage/metadataKeysSessionStorage";
import i18n from "../../sdk/i18n";
import OrganizationSettingsModel from "../../model/organizationSettings/organizationSettingsModel";

class VerifyOrTrustMetadataKeyService {
  /**
   * @param {WorkerEntity} worker The worker
   * @param {AccountEntity} account The user account
   * @param {ApiClientOptions} apiClientOptions the api client options
   */
  constructor(worker, account, apiClientOptions) {
    this.organisationSettingsModel = new OrganizationSettingsModel(apiClientOptions);
    this.getOrFindMetadataKeysService = new GetOrFindMetadataKeysService(account, apiClientOptions);
    this.metadataKeysSessionStorage = new MetadataKeysSessionStorage(account);
    this.getMetadataTrustedKeyService = new GetMetadataTrustedKeyService(account);
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
    const organizationSettings = await this.organisationSettingsModel.getOrFind();
    const metadataIsEnabled = organizationSettings.isPluginEnabled("metadata");
    if (!metadataIsEnabled) {
      return;
    }

    assertString(passphrase, 'The parameter "passphrase" should be a string.');

    const metadataKeys = await this.getOrFindMetadataKeysService.getOrFindAll();
    const activeMetadataKey = metadataKeys.getFirstByLatestCreated();

    // Not active metadata key needs to be trusted.
    if (activeMetadataKey === null) {
      return;
    }

    const activeMetadataPrivateKey = activeMetadataKey.metadataPrivateKeys.items[0];
    const metadataTrustedKey = await this.getMetadataTrustedKeyService.get();

    // Trust on first use.
    if (metadataTrustedKey === null) {
      await this.trustMetadataKeyService.trust(activeMetadataPrivateKey, passphrase);
      return;
    }

    // Active metadata key is already trusted.
    if (metadataTrustedKey.isMetadataKeyTrusted(activeMetadataKey)) {
      return;
    }

    // Request the user to trust the key
    const userConfirmation = await this.confirmMetadataKeyContentCodeService.requestConfirm(metadataTrustedKey, activeMetadataKey);
    if (userConfirmation) {
      await this.trustMetadataKeyService.trust(activeMetadataPrivateKey, passphrase);
    } else {
      const errorMessage = `${i18n.t("The encryption key used to share metadata between users could not be verified and is considered untrusted.")}
        ${i18n.t("The operation has been aborted to maintain security integrity.")}`;
      throw new UntrustedMetadataKeyError(errorMessage);
    }
  }
}

export default VerifyOrTrustMetadataKeyService;
