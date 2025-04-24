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

import MetadataTrustedKeyEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTrustedKeyEntity";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import DecryptPrivateKeyService from "../crypto/decryptPrivateKeyService";
import TrustedMetadataKeyLocalStorage from "../local_storage/trustedMetadataKeyLocalStorage";
import EncryptMetadataPrivateKeysService from "./encryptMetadataPrivateKeysService";
import UpdateMetadataKeyPrivateService from "./updateMetadataKeyPrivateService";
import MetadataKeysSessionStorage from "../session_storage/metadataKeysSessionStorage";
import {assertString, assertType} from "../../utils/assertions";
import MetadataKeyEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeyEntity";
import MetadataPrivateKeysCollection from "passbolt-styleguide/src/shared/models/entity/metadata/metadataPrivateKeysCollection";

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
   * Trust a new metadata private key, send it to the API and insert into the localstorage
   * their encrypted result.
   *
   * @param {MetadataKeyEntity} metadataKey The metadata key entity to update.
   * @param {String} passphrase The user passphrase.
   * @returns {Promise<void>}
   * @throws {TypeError} If `metadataKey` is not of type MetadataKeyEntity.
   * @throws {Error} If `userPrivateKey` is not a decrypted OpenPGP private key.
   */
  async trust(metadataKey, passphrase) {
    assertType(metadataKey, MetadataKeyEntity);
    assertString(passphrase, 'The parameter "passphrase" should be a string.');

    const signedDate = new Date();
    const encryptedUserPrivateKey =  await OpenpgpAssertion.readKeyOrFail(this.account.userPrivateArmoredKey);
    const decryptedUserPrivateKey = await DecryptPrivateKeyService.decrypt(encryptedUserPrivateKey, passphrase);

    if (metadataKey.metadataPrivateKeys.hasDecryptedPrivateKeys()) {
      // Clone to keep decrypted private key to update only the property isDataSignedByCurrentUser
      const metadataPrivateKeysDecrypted = new MetadataPrivateKeysCollection(metadataKey.metadataPrivateKeys.toDto());
      await this.encryptMetadataPrivateKeysService.encryptAllFromMetadataKeyEntity(metadataKey, decryptedUserPrivateKey, {signatureDate: signedDate});

      for (let i = 0; i < metadataKey.metadataPrivateKeys.items.length; i++) {
        const metadataPrivateKey = metadataKey.metadataPrivateKeys.items[i];
        const metadataPrivateKeyDecrypted = metadataPrivateKeysDecrypted.items[i];
        if (!metadataPrivateKey.isDecrypted) {
          await this.updateMetadataKeyPrivateService.update(metadataPrivateKey);
          metadataPrivateKeyDecrypted.isDataSignedByCurrentUser = signedDate.toISOString();
          metadataPrivateKeyDecrypted.modified = signedDate.toISOString();
          metadataPrivateKeyDecrypted.modifiedBy = this.account.userId;
          metadataKey.metadataPrivateKeys.items[i] = metadataPrivateKeyDecrypted;
        }
      }
      await this.metadataKeysSessionStorage.update(metadataKey);

      const newTrustedKey = new MetadataTrustedKeyEntity({
        fingerprint: metadataKey.fingerprint,
        signed: signedDate.toISOString()
      });
      await this.trustedMetadataKeyLocalStorage.set(newTrustedKey);
    }
  }
}

export default TrustMetadataKeyService;
