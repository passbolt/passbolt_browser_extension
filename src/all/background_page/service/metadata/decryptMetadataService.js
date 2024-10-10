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
import {assertAnyTypeOf} from '../../utils/assertions';
import DecryptMessageService from '../crypto/decryptMessageService';
import FindMetadataKeysService from "./findMetadataKeysService";
import ResourceMetadataEntity from "../../model/entity/resource/metadata/resourceMetadataEntity";
import ResourcesCollection from "../../model/entity/resource/resourcesCollection";
import FoldersCollection from "../../model/entity/resource/resourcesCollection";
import ResourceEntity from "../../model/entity/resource/resourceEntity";
import PassphraseStorageService from "../session_storage/passphraseStorageService";
import UserPassphraseRequiredError from "passbolt-styleguide/src/shared/error/userPassphraseRequiredError";
import GetDecryptedUserPrivateKeyService from "../account/getDecryptedUserPrivateKeyService";

class DecryptMetadataService {
  /**
   * @constructor
   * @param {AbstractAccountEntity} account the account associated to the worker
   */
  constructor(apiClientOptions, account) {
    this.account = account;
    this.findMetadataKeysService = new FindMetadataKeysService(apiClientOptions, account);
  }

  /**
   * Decrypts the metadata of all entities from the given collection and mutates the entities with the decrypted results.
   *
   * @param {ResourcesCollection|FoldersCollection} collection the collection to run metadata decryption on.
   * @param {string} [passphrase = null] The passphrase to use to decrypt the metadata private key.
   * @param {object} [options]
   * @param {boolean} [options.ignoreDecryptionError = false] if set to true any decryption errors will be ignored
   * @returns {Promise<void>}
   * @throws {UserPassphraseRequiredError} if the `passphrase` is not set and cannot be retrieved.
   */
  async decryptAllFromForeignModels(collection, passphrase = null, options = {ignoreDecryptionError: false}) {
    assertAnyTypeOf(collection, [ResourcesCollection, FoldersCollection], "The given collection is neither a ResourcesCollection nor a FoldersCollection");

    for (let i = 0; i < collection.length; i++) {
      const entity = collection.items[i];

      if (entity.isMetadataDecrypted()) {
        continue;
      }

      if (this.isEncryptedWithSharedKey(entity)) {
        await this.decryptOneWithSharedKey(entity, options);
      } else if (this.isEncryptedWithUserKey(entity)) {
        await this.decryptOneWithUserKey(entity, passphrase, options);
      } else {
        const errorCause = new Error("Entitie's metadata should either be encrypted with a shared metadata key or with the current user's private key.");
        this.handleError(entity, options, errorCause);
      }
    }
  }

  /**
   * Decrypts the metadata of the given entity and mutates it with the decrypted result.
   *
   * @param {Entity} entity the entity to run metadata decryption on.
   * @param {string} [passphrase = null] The passphrase to use to decrypt the metadata private key.
   * @param {object} [options]
   * @param {boolean} [options.ignoreDecryptionError = false] if set to true any decryption errors will be ignored
   * @returns {Promise<void>}
   * @throws {UserPassphraseRequiredError} if the `passphrase` is not set and cannot be retrieved.
   * @private
   */
  async decryptOneWithUserKey(entity, passphrase = null, options = {ignoreDecryptionError: false}) {
    passphrase = passphrase || await PassphraseStorageService.get();
    if (!passphrase) {
      throw new UserPassphraseRequiredError();
    }

    try {
      const decryptionKey = await GetDecryptedUserPrivateKeyService.getKey(passphrase);
      await this.decryptMetadata(entity, decryptionKey);
    } catch (e) {
      this.handleError(entity, options, e);
    }
  }

  /**
   * Decrypts the metadata of the given entity and mutates it with the decrypted result.
   *
   * @param {Entity} entity the entity to run metadata decryption on.
   * @param {object} [options]
   * @param {boolean} [options.ignoreDecryptionError = false] if set to true any decryption errors will be ignored
   * @returns {Promise<void>}
   * @throws {UserPassphraseRequiredError} if the `passphrase` is not set and cannot be retrieved.
   * @private
   */
  async decryptOneWithSharedKey(entity, options = {ignoreDecryptionError: false}) {
    const metadataKeys = await this.findMetadataKeysService.findAllForSessionStorage();
    const metadataKey = metadataKeys.getFirst("id", entity.metadataKeyId);

    if (!metadataKey) {
      const errorCause = new Error(`No metadata key found with the id (${entity.metadataKeyId})`);
      this.handleError(entity, options, errorCause);
      return;
    }

    try {
      const decryptionMetadataKey = metadataKey.metadataPrivateKeys.items[0];
      const decryptionKey = await OpenpgpAssertion.readKeyOrFail(decryptionMetadataKey.armoredKey);

      await this.decryptMetadata(entity, decryptionKey);
    } catch (e) {
      this.handleError(entity, options, e);
    }
  }

  /**
   * Decrypts the metadata of the given entity and mutates it with the decrypted result.
   *
   * @param {Entity} entity the entity to run metadata decryption on.
   * @param {OpentPgp.PrivateKey} decryptionKey the GPG private key to use for decryption.
   * @param {boolean} [options.ignoreDecryptionError = false] if set to true any decryption errors will be ignored
   * @returns {Promise<void>}
   * @private
   */
  async decryptMetadata(entity, decryptionKey) {
    try {
      const gpgMessage = await OpenpgpAssertion.readMessageOrFail(entity.metadata);
      const decryptedData = await DecryptMessageService.decrypt(gpgMessage, decryptionKey);

      const metadataDto = JSON.parse(decryptedData);

      entity.metadata = new ResourceMetadataEntity(metadataDto);
    } catch (e) {
      const error = new Error("Could not decrypt metadata");
      error.cause = e;
      throw error;
    }
  }

  /**
   * Returns true of the entity metadata is encrypted with a metadata shared key.
   * @param {ResourceEntity|FolderEntity} entity
   * @returns {boolean}
   * @private
   */
  isEncryptedWithSharedKey(entity) {
    return Boolean(entity.metadataKeyId)
      && entity.metadataKeyType === ResourceEntity.METADATA_KEY_TYPE_METADATA_KEY;
  }

  /**
   * Returns true of the entity metadata is encrypted with the current user's key.
   * @param {ResourceEntity|FolderEntity} entity
   * @returns {boolean}
   * @private
   */
  isEncryptedWithUserKey(entity) {
    return !entity.metadataKeyId
      && entity.metadataKeyType === ResourceEntity.METADATA_KEY_TYPE_USER_KEY;
  }

  /**
   * Handles a decryption process error.
   * If the error should be ignored, a message in the console is sent
   * otherwise the error is thrown.
   * @param {ResourceEntity|FolderEntity} entity
   * @param {boolean} [options.ignoreDecryptionError = false] if set to true any decryption errors will be ignored
   * @param {Error} [errorCause = null] the error at the origin of the decryption failure if any.
   */
  handleError(entity, options = {ignoreDecryptionError: false}, errorCause = null) {
    const error = new Error(`Metadata of the resource (${entity.id}) cannot be decrypted.`);
    error.cause = errorCause;

    if (!options.ignoreDecryptionError) {
      throw error;
    }
    console.error(error);
  }
}

export default DecryptMetadataService;
