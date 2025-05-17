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

import TrustedMetadataKeyLocalStorage from "../local_storage/trustedMetadataKeyLocalStorage";
import EncryptMetadataPrivateKeysService from "./encryptMetadataPrivateKeysService";
import UpdateMetadataKeyPrivateService from "./updateMetadataKeyPrivateService";
import MetadataKeysSessionStorage from "../session_storage/metadataKeysSessionStorage";
import {assertString, assertType} from "../../utils/assertions";
import MetadataTrustedKeyEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTrustedKeyEntity";
import MetadataPrivateKeyEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataPrivateKeyEntity";
import DecryptPrivateKeyService from "../crypto/decryptPrivateKeyService";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";

class TrustMetadataKeyService {
  /**
   * @param {AccountEntity} account The user account
   * @param {ApiClientOptions} apiClientOptions the api client options
   */
  constructor(account, apiClientOptions) {
    this.account = account;
    this.encryptMetadataPrivateKeysService = new EncryptMetadataPrivateKeysService(account);
    this.updateMetadataKeyPrivateService = new UpdateMetadataKeyPrivateService(apiClientOptions);
    this.trustedMetadataKeyLocalStorage = new TrustedMetadataKeyLocalStorage(account);
    this.metadataKeysSessionStorage = new MetadataKeysSessionStorage(account);
  }

  /**
   * Trust a new metadata private key:
   * - Sign the metadata private key data if not yet signed by the current user and update the metadata key
   *   session storage with the updated information.
   * - Update the trusted metadata local storage with the information of the metadata key.
   *
   * @param {MetadataPrivateKeyEntity} metadataPrivateKey The metadata private key entity to update.
   *   Note that the function mutates the original metadata private key entity.
   * @param {String} passphrase The user passphrase.
   * @returns {Promise<void>}
   * @throws {TypeError} If `metadataPrivateKey` is not of type MetadataPrivateKeyEntity.
   * @throws {Error} If the `metadataPrivateKey` data is encrypted.
   * @throws {Error} If the `passphrase` is not a string.
   */
  async trust(metadataPrivateKey, passphrase) {
    assertType(metadataPrivateKey, MetadataPrivateKeyEntity, "The parameter `metadataPrivateKey` should be of type MetadataPrivateKeyEntity.");
    assertString(passphrase, "The `passphrase` parameter should be a string.");
    if (!metadataPrivateKey.isDecrypted) {
      throw new Error("The metadata private key should be decrypted.");
    }

    let signedDate = metadataPrivateKey.dataSignedByCurrentUser;

    // If not already signed, sign the metadata private key data and update the API with it.
    if (!signedDate) {
      signedDate = new Date();
      const encryptedUserPrivateKey =  await OpenpgpAssertion.readKeyOrFail(this.account.userPrivateArmoredKey);
      const decryptedUserPrivateKey = await DecryptPrivateKeyService.decrypt(encryptedUserPrivateKey, passphrase);
      // Clone the metadata private key to not mutate the original metadata private key data with the encrypted one.
      const metadataPrivateKeyToTrust = new MetadataPrivateKeyEntity(metadataPrivateKey.toDto());
      await this.encryptMetadataPrivateKeysService.encryptOne(metadataPrivateKeyToTrust, decryptedUserPrivateKey, {date: signedDate});
      const updatedMetadataPrivateKey = await this.updateMetadataKeyPrivateService.update(metadataPrivateKeyToTrust);
      updatedMetadataPrivateKey.dataSignedByCurrentUser = signedDate.toISOString();
      updatedMetadataPrivateKey.data = metadataPrivateKey.data;
      await this.metadataKeysSessionStorage.updatePrivateKey(updatedMetadataPrivateKey);
    }

    const trustedMetadataKey = new MetadataTrustedKeyEntity({
      fingerprint: metadataPrivateKey.data.fingerprint,
      signed: signedDate
    });
    await this.trustedMetadataKeyLocalStorage.set(trustedMetadataKey);
  }
}

export default TrustMetadataKeyService;
