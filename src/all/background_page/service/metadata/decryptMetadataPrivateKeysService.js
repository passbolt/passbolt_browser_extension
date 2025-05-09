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
 * @since         4.10.0
 */
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import PassphraseStorageService from '../session_storage/passphraseStorageService';
import MetadataPrivateKeyEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataPrivateKeyEntity";
import MetadataPrivateKeyDataEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataPrivateKeyDataEntity";
import MetadataPrivateKeysCollection from "passbolt-styleguide/src/shared/models/entity/metadata/metadataPrivateKeysCollection";
import MetadataKeysCollection from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysCollection";
import UserPassphraseRequiredError from "passbolt-styleguide/src/shared/error/userPassphraseRequiredError";
import {assertType} from '../../utils/assertions';
import DecryptPrivateKeyService from '../crypto/decryptPrivateKeyService';
import DecryptMessageService from '../crypto/decryptMessageService';
import FindSignatureService from "../crypto/findSignatureService";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";

class DecryptMetadataPrivateKeysService {
  /**
   * @constructor
   * @param {AbstractAccountEntity} account the account associated to the worker
   */
  constructor(account) {
    this.account = account;
  }

  /**
   * Decrypts a metadata private key and mutate the metadata private key entity with the decrypted result.
   * If the private key was already decrypted, nothing happens.
   *
   * @param {MetadataPrivateKeyEntity} metadataPrivateKeyEntity the metadata private key entity to decrypt.
   * @param {string|null} [passphrase = null] The passphrase to use to decrypt the metadata private key. Marked as
   * optional as it might be available in the passphrase session storage.
   * @returns {Promise<void>}
   * @throws {TypeError} if the `metadataPrivateKeyEntity` is not of type MetadataPrivateKeyEntity
   * @throws {Error} if metadata private key entity data is not a valid openPGP message.
   * @throws {UserPassphraseRequiredError} if the `passphrase` is not set and cannot be retrieved.
   */
  async decryptOne(metadataPrivateKeyEntity, passphrase = null) {
    assertType(metadataPrivateKeyEntity, MetadataPrivateKeyEntity, "The given entity is not a MetadataPrivateKeyEntity");
    if (metadataPrivateKeyEntity.isDecrypted) {
      return;
    }

    const message = await OpenpgpAssertion.readMessageOrFail(metadataPrivateKeyEntity.data);

    passphrase = passphrase || await this.getPassphraseFromSessionStorageOrFail();

    const userDecryptedPrivateArmoredKey = await DecryptPrivateKeyService.decryptArmoredKey(this.account.userPrivateArmoredKey, passphrase);
    const userPublicKey = await OpenpgpAssertion.readKeyOrFail(this.account.userPublicArmoredKey);
    const decryptedMessage = await DecryptMessageService.decrypt(message, userDecryptedPrivateArmoredKey, [userPublicKey], {
      returnOnlyData: false,
      throwOnInvalidSignaturesVerification: false
    });
    const decryptedMetadataPrivateKeyDto = JSON.parse(decryptedMessage.data);
    const metadataPrivateKeyDataEntity = new MetadataPrivateKeyDataEntity(decryptedMetadataPrivateKeyDto);
    metadataPrivateKeyEntity.data = metadataPrivateKeyDataEntity;

    await this.assertFingerprintPublicAndPrivateKeysMatch(metadataPrivateKeyEntity);

    const externalGpgSignature = await FindSignatureService.findSignatureForGpgKey(decryptedMessage.signatures, userPublicKey);

    if (externalGpgSignature && externalGpgSignature.isVerified) {
      metadataPrivateKeyEntity.dataSignedByCurrentUser = externalGpgSignature.created;
    }
  }

  /**
   * Decrypts a collection of metadata private key entities and mutate all entities with their decrypted result.
   *
   * @param {MetadataPrivateKeysCollection} metadataPrivateKeysCollection the metadata private keys collection to decrypt.
   * @param {string|null} [passphrase = null] The passphrase to use to decrypt the metadata private key. Marked as
   * optional as it might be available in the passphrase session storage.
   * @returns {Promise<void>}
   * @throws {TypeError} if the `MetadataPrivateKeysCollection` is not of type MetadataPrivateKeysCollection
   * @throws {Error} if one of the metadata private key entity data is not a valid openPGP message.
   * @throws {UserPassphraseRequiredError} if the `passphrase` is not set and cannot be retrieved.
   */
  async decryptAll(metadataPrivateKeysCollection, passphrase = null) {
    assertType(metadataPrivateKeysCollection, MetadataPrivateKeysCollection, "The given collection is not of the type MetadataPrivateKeysCollection");

    passphrase = passphrase || await this.getPassphraseFromSessionStorageOrFail();

    const items = metadataPrivateKeysCollection.items;
    for (let i = 0; i < items.length; i++) {
      const metadataPrivateKeyEntity = items[i];
      await this.decryptOne(metadataPrivateKeyEntity, passphrase);
    }
  }

  /**
   * Decrypts the metadata private keys from a metadata keys collection
   * and mutate all metadata private key entities with their decrypted result.
   *
   * @param {MetadataKeysCollection} metadataKeysCollection the metadata keys collection to decrypt.
   * @param {string|null} [passphrase = null] The passphrase to use to decrypt the metadata private key. Marked as
   * optional as it might be available in the passphrase session storage.
   * @returns {Promise<void>}
   * @throws {TypeError} if the `MetadataPrivateKeysCollection` is not of type MetadataPrivateKeysCollection
   * @throws {Error} if one of the metadata private key entity data is not a valid openPGP message.
   * @throws {UserPassphraseRequiredError} if metadata private keys decryption is required and the `passphrase` is not
   *   given and cannot be retrieved from the session storage.
   */
  async decryptAllFromMetadataKeysCollection(metadataKeysCollection, passphrase = null) {
    assertType(metadataKeysCollection, MetadataKeysCollection, "The given collection is not of the type MetadataKeysCollection");

    const items = metadataKeysCollection.items;
    for (let i = 0; i < items.length; i++) {
      const metadataPrivateKeysCollection = items[i].metadataPrivateKeys;
      if (!metadataPrivateKeysCollection || !metadataPrivateKeysCollection.length || !metadataKeysCollection?.hasEncryptedKeys()) {
        continue;
      }
      passphrase = passphrase || await this.getPassphraseFromSessionStorageOrFail();
      await this.decryptAll(metadataPrivateKeysCollection, passphrase);
    }
  }

  /**
   * Retrieve the user passphrase from the session storage or fail.
   *
   * @returns {Promise<string>}
   * @throws {UserPassphraseRequiredError} if the `passphrase` cannot be retrieved.
   * @private
   */
  async getPassphraseFromSessionStorageOrFail() {
    const passphrase = await PassphraseStorageService.get();
    if (!passphrase) {
      throw new UserPassphraseRequiredError();
    }
    return passphrase;
  }

  /**
   * Verify the metadata private key entity fingerprint is equal to the  armored key fingerprint.
   * @param {MetadataPrivateKeyEntity} metadataPrivateKeyEntity the metadata private key entity to decrypt.
   * @returns {Promise<void>}
   * @throws {EntityValidationError} if the fingerprints are not matching.
   * @private
   */
  async assertFingerprintPublicAndPrivateKeysMatch(metadataPrivateKeyEntity) {
    const armoredMetadataPrivateKey = await OpenpgpAssertion.readKeyOrFail(metadataPrivateKeyEntity.data.armoredKey);

    if (metadataPrivateKeyEntity.data.fingerprint.toLowerCase() !== armoredMetadataPrivateKey.getFingerprint().toLowerCase()) {
      const error = new EntityValidationError();
      error.addError(`metadata_private_key`, 'fingerprint_match', 'The fingerprint of the metadata private key does not match the fingerprint of the entity');
      throw error;
    }
  }
}

export default DecryptMetadataPrivateKeysService;
