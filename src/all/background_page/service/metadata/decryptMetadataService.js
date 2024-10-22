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
import ResourcesCollection from "../../model/entity/resource/resourcesCollection";
import FoldersCollection from "../../model/entity/resource/resourcesCollection";
import ResourceEntity from "../../model/entity/resource/resourceEntity";
import PassphraseStorageService from "../session_storage/passphraseStorageService";
import UserPassphraseRequiredError from "passbolt-styleguide/src/shared/error/userPassphraseRequiredError";
import DecryptPrivateKeyService from "../crypto/decryptPrivateKeyService";
import GetOrFindMetadataKeysService from "./getOrFindMetadataKeysService";

class DecryptMetadataService {
  /**
   * @constructor
   * @param {AbstractAccountEntity} account the account associated to the worker
   */
  constructor(apiClientOptions, account) {
    this.account = account;
    this.getOrFindMetadataKeysService = new GetOrFindMetadataKeysService(account, apiClientOptions);
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

    await this.decryptAllFromForeignModelsWithSharedKey(collection, options);
    await this.decryptAllFromForeignModelsWithUserKey(collection, passphrase, options);
    collection.items.forEach(entity => {
      if (!entity.isMetadataDecrypted()) {
        const error = new Error("Entitie's metadata should either be encrypted with a shared metadata key or with the current user's private key.");
        this.handleError(entity, options, error);
      }
    });
  }

  /**
   * Decrypts the metadata of all entities in the collection that were encrypted with the shared metadata key, and
   * mutates the entities with the decrypted metadata.
   *
   * @param {ResourcesCollection|FoldersCollection} collection the collection to run metadata decryption on.
   * @param {object} [options]
   * @param {boolean} [options.ignoreDecryptionError = false] if set to true any decryption errors will be ignored
   * @returns {Promise<void>}
   */
  async decryptAllFromForeignModelsWithSharedKey(collection, options = {ignoreDecryptionError: false}) {
    const filteredCollection = collection.items.filter(entity => entity.metadataKeyType === ResourceEntity.METADATA_KEY_TYPE_METADATA_KEY);
    if (!filteredCollection.length) {
      return;
    }

    const metadataKeys = await this.getOrFindMetadataKeysService.getOrFindAll();
    const metadataOpenPgpPrivateKeys = {}; // Cache already read private keys.

    for (const entity of filteredCollection) {
      try {
        const metadataDecryptedPrivateKey = metadataOpenPgpPrivateKeys[entity.metadataKeyId]
          || (metadataOpenPgpPrivateKeys[entity.metadataKeyId] = await this.getAndReadMetadataPrivateKey(entity, metadataKeys, options));

        await this.decryptMetadata(entity, metadataDecryptedPrivateKey);
      } catch (error) {
        this.handleError(entity, options, error);
      }
    }
  }

  /**
   * Get and read metadata private key in a collection of metadata keys based on an entity metadata key id property.
   *
   * @param {ResourceEntity|FolderEntity} entity the entity to retrieve the key for
   * @param {MetadataKeysCollection} metadataKeysCollection The collection of metadata keys. They must contain their
   * private keys, and they should be decrypted.
   * @returns {Promise<openpgp.PrivateKey>}
   * @throws {Error} If no metadata key was found for entity metadata key id reference
   * @throws {Error} If no metadata private key was found attached to the metadata key
   * @throws {Error} If the metadata private key found was encrypted
   */
  async getAndReadMetadataPrivateKey(entity, metadataKeysCollection) {
    const metadataKey = metadataKeysCollection.getFirst("id", entity.metadataKeyId);
    if (!metadataKey) {
      throw new Error(`No metadata key found with the id (${entity.metadataKeyId}).`);
    }
    const metadataPrivateKey = metadataKey.metadataPrivateKeys?.items[0];
    if (!metadataPrivateKey) {
      throw new Error(`No metadata private key found for the metadata key id (${entity.metadataKeyId}).`);
    }
    if (!metadataPrivateKey.isDecrypted) {
      throw new Error(`The metadata private key for the metadata key id (${entity.metadataKeyId}) should be decrypted.`);
    }

    return OpenpgpAssertion.readKeyOrFail(metadataPrivateKey.data.armoredKey);
  }

  /**
   * Decrypts the metadata of all entities in the collection that were encrypted with the user's private key, and
   * mutates the entities with the decrypted metadata.
   * @param {ResourcesCollection|FoldersCollection} collection the collection to run metadata decryption on.
   * @param {string} passphrase The user passphrase
   * @param {object} [options]
   * @param {boolean} [options.ignoreDecryptionError = false] if set to true any decryption errors will be ignored
   * @returns {Promise<void>}
   * @returns {Promise<void>}
   */
  async decryptAllFromForeignModelsWithUserKey(collection, passphrase, options = {ignoreDecryptionError: false}) {
    const filteredCollection = collection.items.filter(entity => entity.metadataKeyType === ResourceEntity.METADATA_KEY_TYPE_USER_KEY);
    if (!filteredCollection.length) {
      return;
    }

    passphrase = passphrase || await PassphraseStorageService.get();
    if (!passphrase) {
      throw new UserPassphraseRequiredError();
    }
    const userDecryptedPrivateKey = await DecryptPrivateKeyService.decryptArmoredKey(this.account.userPrivateArmoredKey, passphrase);

    for (const entity of filteredCollection) {
      try {
        await this.decryptMetadata(entity, userDecryptedPrivateKey);
      } catch (e) {
        this.handleError(entity, options, e);
      }
    }
  }

  /**
   * Decrypts the metadata of the given entity and mutates it with the decrypted result.
   *
   * @param {Entity} entity the entity to run metadata decryption on.
   * @param {string} [passphrase = null] The passphrase to use to decrypt the metadata private key.
   * @throws {UserPassphraseRequiredError} if the `passphrase` is not set and cannot be retrieved.
   * @private
   */
  async decryptOneWithUserKey(entity, passphrase = null) {
    passphrase = passphrase || await PassphraseStorageService.get();
    if (!passphrase) {
      throw new UserPassphraseRequiredError();
    }
    const userDecryptedPrivateKey = await DecryptPrivateKeyService.decryptArmoredKey(this.account.userPrivateArmoredKey, passphrase);
    await this.decryptMetadata(entity, userDecryptedPrivateKey);
  }

  /**
   * Decrypts the metadata of the given entity and mutates it with the decrypted result.
   *
   * @param {Entity} entity the entity to run metadata decryption on.
   * @returns {Promise<void>}
   * @private
   */
  async decryptOneWithSharedKey(entity) {
    const metadataKeys = await this.getOrFindMetadataKeysService.getOrFindAll();
    const metadataDecryptedPrivateKey = await this.getAndReadMetadataPrivateKey(entity, metadataKeys);
    await this.decryptMetadata(entity, metadataDecryptedPrivateKey);
  }

  /**
   * Decrypts the metadata of the given entity and mutates it with the decrypted result.
   *
   * @param {Entity} entity the entity to run metadata decryption on.
   * @param {OpenPgp.PrivateKey} decryptionKey the GPG private key to use for decryption.
   * @param {boolean} [options.ignoreDecryptionError = false] if set to true any decryption errors will be ignored
   * @returns {Promise<void>}
   * @private
   */
  async decryptMetadata(entity, decryptionKey) {
    const gpgMessage = await OpenpgpAssertion.readMessageOrFail(entity.metadata);
    const decryptedData = await DecryptMessageService.decrypt(gpgMessage, decryptionKey);

    entity.metadata = JSON.parse(decryptedData);
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
