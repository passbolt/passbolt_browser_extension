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
import {assertType} from '../../utils/assertions';
import DecryptMessageService from '../crypto/decryptMessageService';
import ResourcesCollection from "../../model/entity/resource/resourcesCollection";
import ResourceEntity from "../../model/entity/resource/resourceEntity";
import PassphraseStorageService from "../session_storage/passphraseStorageService";
import UserPassphraseRequiredError from "passbolt-styleguide/src/shared/error/userPassphraseRequiredError";
import DecryptPrivateKeyService from "../crypto/decryptPrivateKeyService";
import GetOrFindMetadataKeysService from "./getOrFindMetadataKeysService";
import GetOrFindSessionKeysService from "../sessionKey/getOrFindSessionKeysService";

class DecryptMetadataService {
  /**
   * @constructor
   * @param {ApiClientOptions} apiClientOptions The api client options
   * @param {AbstractAccountEntity} account the account associated to the worker
   */
  constructor(apiClientOptions, account) {
    this.account = account;
    this.getOrFindSessionKeysService = new GetOrFindSessionKeysService(account, apiClientOptions);
    this.getOrFindMetadataKeysService = new GetOrFindMetadataKeysService(account, apiClientOptions);
  }

  /**
   * Decrypts the metadata of all entities from the given collection and mutates the entities with the decrypted results.
   *
   * @param {ResourcesCollection} collection the collection to decrypt the metadata for.
   * @param {string} [passphrase = null] The passphrase to use to decrypt the metadata private key.
   * @param {object} [options]
   * @param {boolean} [options.ignoreDecryptionError = false] if set to true any decryption errors will be ignored
   * @returns {Promise<void>}
   * @throws {UserPassphraseRequiredError} if the `passphrase` is not set and cannot be retrieved.
   */
  async decryptAllFromForeignModels(collection, passphrase = null, options = {}) {
    assertType(collection, ResourcesCollection, "The parameter \"collection\" should be a ResourcesCollection.");
    const ignoreDecryptionError = options?.ignoreDecryptionError || false;

    await this.decryptAllFromForeignModelsWithSessionKeys(collection);
    await this.decryptAllFromForeignModelsWithSharedKey(collection, {ignoreDecryptionError});
    await this.decryptAllFromForeignModelsWithUserKey(collection, passphrase, {ignoreDecryptionError});
    await this.assertMetadataDecrypted(collection, options);
  }

  /**
   * Decrypts the metadata of all entities in the collection for which a session key is known and mutates the entities
   * with the decrypted metadata.
   *
   * Ignore any errors. Metadata that is not decrypted will be processed using user or metadata shared keys.
   *
   * @param {ResourcesCollection} collection the collection to run metadata decryption on.
   * @returns {Promise<void>}
   * @private
   */
  async decryptAllFromForeignModelsWithSessionKeys(collection) {
    try {
      const sessionKeys = await this.getOrFindSessionKeysService.getOrFindAllByForeignModelAndForeignIds("Resource", collection.ids);
      for (const sessionKey of sessionKeys) {
        try {
          const entity = collection.getFirst("id", sessionKey.foreignId);
          await this.decryptMetadataWithSessionKey(entity, sessionKey.sessionKey);
        } catch (error) {
          console.debug(`Metadata of the entity "${sessionKey?.foreignModel}:${sessionKey?.foreignId}" cannot be decrypted with session key.`, {cause: error});
        }
      }
    } catch (error) {
      console.warn("An unexpected error occurred when decrypting the metadata with the session keys.", {cause: error});
    }
  }

  /**
   * Decrypts the metadata of the given entity with a session key and mutates the entity with the decrypted result.
   *
   * @param {ResourceEntity} entity the entity to run metadata decryption on.
   * @param {string} sessionKeyString the session key to use for decryption.
   * @returns {Promise<void>}
   * @private
   */
  async decryptMetadataWithSessionKey(entity, sessionKeyString) {
    const sessionKey = OpenpgpAssertion.readSessionKeyOrFail(sessionKeyString);
    const gpgMessage = await OpenpgpAssertion.readMessageOrFail(entity.metadata);
    const decryptedData = await DecryptMessageService.decryptWithSessionKey(gpgMessage, sessionKey);
    entity.metadata = JSON.parse(decryptedData);
  }

  /**
   * Decrypts the metadata of all entities in the collection that were encrypted with the shared metadata key, and
   * mutates the entities with the decrypted metadata.
   *
   * @param {ResourcesCollection|FoldersCollection} collection the collection to run metadata decryption on.
   * @param {object} [options]
   * @param {boolean} [options.ignoreDecryptionError = false] if set to true any decryption errors will be ignored
   * @returns {Promise<void>}
   * @private
   */
  async decryptAllFromForeignModelsWithSharedKey(collection, options = {ignoreDecryptionError: false}) {
    const filteredCollection = collection.items.filter(entity =>
      entity.metadataKeyType === ResourceEntity.METADATA_KEY_TYPE_METADATA_KEY
      && !entity.isMetadataDecrypted()
    );
    if (!filteredCollection.length) {
      return;
    }

    const metadataKeys = await this.getOrFindMetadataKeysService.getOrFindAll();
    const metadataOpenPgpPrivateKeys = {}; // Cache already read private keys.

    for (const entity of filteredCollection) {
      try {
        const metadataDecryptedPrivateKey = metadataOpenPgpPrivateKeys[entity.metadataKeyId]
          || (metadataOpenPgpPrivateKeys[entity.metadataKeyId] = await this.getAndReadMetadataPrivateKey(entity, metadataKeys, options));

        await this.decryptMetadataWithGpgKey(entity, metadataDecryptedPrivateKey);
      } catch (causeError) {
        const error = new Error(`Unable to decrypt the metadata of the resource (${entity?.id}) using the shared key (${entity?.metadataKeyId}).`, {cause: causeError});
        this.handleError(error, options);
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
   * @private
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
   * @private
   */
  async decryptAllFromForeignModelsWithUserKey(collection, passphrase, options = {ignoreDecryptionError: false}) {
    const filteredCollection = collection.items.filter(entity =>
      entity.metadataKeyType === ResourceEntity.METADATA_KEY_TYPE_USER_KEY
      && !entity.isMetadataDecrypted()
    );
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
        await this.decryptMetadataWithGpgKey(entity, userDecryptedPrivateKey);
      } catch (causeError) {
        const error = new Error(`Unable to decrypt the metadata of the resource (${entity?.id}) using the user key.`, {cause: causeError});
        this.handleError(error, options);
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
    await this.decryptMetadataWithGpgKey(entity, userDecryptedPrivateKey);
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
    await this.decryptMetadataWithGpgKey(entity, metadataDecryptedPrivateKey);
  }

  /**
   * Decrypts the metadata of the given entity with a gpg key and mutates it with the decrypted result.
   *
   * @param {Entity} entity the entity to run metadata decryption on.
   * @param {openpgp.PrivateKey} decryptionKey the GPG private key to use for decryption.
   * @returns {Promise<void>}
   * @private
   */
  async decryptMetadataWithGpgKey(entity, decryptionKey) {
    const gpgMessage = await OpenpgpAssertion.readMessageOrFail(entity.metadata);
    const decryptedData = await DecryptMessageService.decrypt(gpgMessage, decryptionKey);

    entity.metadata = JSON.parse(decryptedData);
  }

  /**
   * Assert that all entities have their metadata decrypted.
   *
   * Ignore any errors if requested in options.
   *
   * @param {ResourcesCollection} collection the collection to decrypt the metadata for.
   * @param {object} [options]
   * @param {boolean} [options.ignoreDecryptionError = false] if set to true any decryption errors will be ignored
   * @returns {Promise<void>}
   * @private
   */
  async assertMetadataDecrypted(collection, options) {
    collection.items.forEach(entity => {
      if (!entity.isMetadataDecrypted()) {
        const error = new Error(`Unable to decrypt the metadata of the entity (${entity?.id}).`);
        this.handleError(error, options);
      }
    });
  }

  /**
   * Handles an error.
   * If the error should be ignored, a message in the console is sent otherwise the error is thrown.
   *
   * @param {Error} error The error to handle
   * @param {object} [options]
   * @param {boolean} [options.ignoreDecryptionError = false] if set to true any decryption errors will be ignored
   * @private
   */
  handleError(error, options = {}) {
    if (!options.ignoreDecryptionError) {
      throw error;
    }
    console.error(error);
  }
}

export default DecryptMetadataService;
