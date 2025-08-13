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
import DecryptPrivateKeyService from "../crypto/decryptPrivateKeyService";
import GetOrFindMetadataKeysService from "./getOrFindMetadataKeysService";
import GetOrFindSessionKeysService from "../sessionKey/getOrFindSessionKeysService";
import GetSessionKeyService from "../crypto/getSessionKeyService";
import SaveSessionKeysService from "../sessionKey/saveSessionKeysService";
import SessionKeysCollection from "passbolt-styleguide/src/shared/models/entity/sessionKey/sessionKeysCollection";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import ResourceMetadataEntity from "passbolt-styleguide/src/shared/models/entity/resource/metadata/resourceMetadataEntity";

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
    this.saveSessionKeysService = new SaveSessionKeysService(account, apiClientOptions);
  }

  /**
   * Decrypts the metadata of all entities from the given collection and mutates the entities with the decrypted results.
   *
   * @param {ResourcesCollection} collection the collection to decrypt the metadata for.
   * @param {string|null} [passphrase = null] The passphrase to use to decrypt the metadata. Marked as optional
   * as it might be available in the passphrase session storage.
   * @param {object} [options]
   * @param {boolean} [options.ignoreDecryptionError = false] if set to true any decryption errors will be ignored
   * @param {boolean} [options.updateSessionKeys = false] if set to true, update the sessions keys if changes discovered.
   * @returns {Promise<void>}
   * @throws {UserPassphraseRequiredError} if the `passphrase` is not set and cannot be retrieved.
   */
  async decryptAllFromForeignModels(collection, passphrase = null, options = {}) {
    assertType(collection, ResourcesCollection, "The parameter \"collection\" should be a ResourcesCollection.");
    const ignoreDecryptionError = options?.ignoreDecryptionError || false;
    const updateSessionKeys = options?.updateSessionKeys || false;

    const sessionKeys = await this.decryptAllFromForeignModelsWithSessionKeys(collection, passphrase);
    const decryptWithSharedKeySessionKeysDto = await this.decryptAllFromForeignModelsWithSharedKey(collection, passphrase, {ignoreDecryptionError});
    const decryptWithUserKeySessionKeysDto = await this.decryptAllFromForeignModelsWithUserKey(collection, passphrase, {ignoreDecryptionError});
    await this.assertMetadataDecrypted(collection, options);
    if (updateSessionKeys) {
      await this.saveSessionKeys(sessionKeys, decryptWithSharedKeySessionKeysDto, decryptWithUserKeySessionKeysDto, passphrase);
    }
  }

  /**
   * Decrypts the metadata of all entities in the collection for which a session key is known and mutates the entities
   * with the decrypted metadata.
   *
   * Ignore any errors. Metadata that is not decrypted will be processed using user or metadata shared keys.
   *
   * @param {ResourcesCollection} collection the collection to run metadata decryption on.
   * @param {string|null} [passphrase = null] The passphrase to use to decrypt the session key. Marked as optional
   * as it might be available in the passphrase session storage.
   * @returns {Promise<SessionKeysCollection>}
   * @private
   */
  async decryptAllFromForeignModelsWithSessionKeys(collection, passphrase = null) {
    let sessionKeys = new SessionKeysCollection();
    const filteredCollection = collection.items.filter(entity => !entity.isMetadataDecrypted());

    if (!filteredCollection.length) {
      return sessionKeys;
    }

    try {
      sessionKeys = await this.getOrFindSessionKeysService.getOrFindAllByForeignModelAndForeignIds("Resource", collection.ids, passphrase);
      for (let i = sessionKeys.items.length - 1; i >= 0; i--) {
        const sessionKey = sessionKeys.items[i];
        try {
          const entity = collection.getFirst("id", sessionKey.foreignId);
          await this.decryptMetadataWithSessionKey(entity, sessionKey.sessionKey);
        } catch (error) {
          sessionKeys.items.splice(i, 1);
          console.debug(`Metadata of the entity "${sessionKey.foreignModel}:${sessionKey.foreignId}" cannot be decrypted with session key.`, {cause: error});
        }
      }
    } catch (error) {
      console.warn("An unexpected error occurred when decrypting the metadata with the session keys.", {cause: error});
    }

    return sessionKeys;
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
    this.assertValidMetadataObjectType(entity);
  }

  /**
   * Decrypts the metadata of all entities in the collection that were encrypted with the shared metadata key, and
   * mutates the entities with the decrypted metadata.
   *
   * @param {ResourcesCollection|FoldersCollection} collection the collection to run metadata decryption on.
   * @param {string|null} [passphrase = null] The passphrase to use to decrypt the metadata key. Marked as optional
   * as it might be available in the passphrase session storage.
   * @param {object} [options]
   * @param {boolean} [options.ignoreDecryptionError = false] if set to true any decryption errors will be ignored
   * @returns {Promise<array>} The session keys dto retrieved after decrypting the metadata
   * @private
   */
  async decryptAllFromForeignModelsWithSharedKey(collection, passphrase = null, options = {}) {
    const filteredCollection = collection.items.filter(entity =>
      entity.metadataKeyType === ResourceEntity.METADATA_KEY_TYPE_METADATA_KEY
      && !entity.isMetadataDecrypted()
    );
    if (!filteredCollection.length) {
      return [];
    }

    const metadataKeys = await this.getOrFindMetadataKeysService.getOrFindAll(passphrase);
    const metadataOpenPgpPrivateKeys = {}; // Cache already read private keys.
    const sessionKeysDtos = [];

    for (const entity of filteredCollection) {
      try {
        const metadataDecryptedPrivateKey = metadataOpenPgpPrivateKeys[entity.metadataKeyId]
          || (metadataOpenPgpPrivateKeys[entity.metadataKeyId] = await this.getAndReadMetadataPrivateKey(entity, metadataKeys, options));

        const openpgpMessage = await this.decryptMetadataWithGpgKey(entity, metadataDecryptedPrivateKey);
        sessionKeysDtos.push(this.extractSessionKeyDtoForEntity(entity, openpgpMessage));
      } catch (causeError) {
        const error = new Error(`Unable to decrypt the metadata of the resource (${entity?.id}) using the shared key (${entity?.metadataKeyId}).`, {cause: causeError});
        this.handleError(error, options);
      }
    }

    return sessionKeysDtos;
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
   * @param {SessionKeysCollection} [options.extractedSessionKeys] The collection of session keys to which new session keys will be aggregated.
   *   Session keys will not be extracted if no collection is provided.
   * @returns {Promise<array>} The session keys dto retrieved after decrypting the metadata
   * @throws {UserPassphraseRequiredError} If the passphrase was required but none found or given.
   * @private
   */
  async decryptAllFromForeignModelsWithUserKey(collection, passphrase, options = {}) {
    const filteredItems = collection.items.filter(entity =>
      entity.metadataKeyType === ResourceEntity.METADATA_KEY_TYPE_USER_KEY
      && !entity.isMetadataDecrypted()
    );
    if (!filteredItems.length) {
      return [];
    }

    passphrase = passphrase || await PassphraseStorageService.getOrFail();
    const userDecryptedPrivateKey = await DecryptPrivateKeyService.decryptArmoredKey(this.account.userPrivateArmoredKey, passphrase);
    const sessionKeysDtos = [];

    for (const entity of filteredItems) {
      try {
        const openpgpMessage = await this.decryptMetadataWithGpgKey(entity, userDecryptedPrivateKey);
        sessionKeysDtos.push(this.extractSessionKeyDtoForEntity(entity, openpgpMessage));
      } catch (causeError) {
        const error = new Error(`Unable to decrypt the metadata of the resource (${entity?.id}) using the user key.`, {cause: causeError});
        this.handleError(error, options);
      }
    }

    return sessionKeysDtos;
  }

  /**
   * Decrypts the metadata of the given entity and mutates it with the decrypted result.
   *
   * @param {Entity} entity the entity to run metadata decryption on.
   * @returns {Promise<void>}
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
   * @returns {Promise<openpgp.Message>}
   * @private
   */
  async decryptMetadataWithGpgKey(entity, decryptionKey) {
    const gpgMessage = await OpenpgpAssertion.readMessageOrFail(entity.metadata);
    const decryptedData = await DecryptMessageService.decrypt(gpgMessage, decryptionKey);

    entity.metadata = JSON.parse(decryptedData);
    this.assertValidMetadataObjectType(entity);

    return gpgMessage;
  }

  /**
   * Extract the session key from a GPG message after decrypting the metadata of the given entity.
   * @param {ResourceEntity} entity The entity the session key has to be extracted for.
   * @param {openpgp.Message} openpgpMessage The decrypted message.
   * return {object} The session key dto
   */
  extractSessionKeyDtoForEntity(entity, openpgpMessage) {
    const sessionKeyString = GetSessionKeyService.getFromGpgMessage(openpgpMessage);
    return {
      foreign_model: "Resource",
      foreign_id: entity.id,
      session_key: sessionKeyString,
      modified: entity.modified
    };
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
   * Assert that the metadata object_type field is valid.
   *
   * @param {Resource} entity the resource to check the metadata object_type from.
   * @throws {EntityValidationError} if the object_type value is not set or not set with the expected value.
   */
  assertValidMetadataObjectType(entity) {
    if (entity.metadata.objectType !== ResourceMetadataEntity.METADATA_OBJECT_TYPE) {
      const error = new EntityValidationError();
      error.addError('metadata.object_type', 'required-v5', `The resource metadata object_type is required and must be set to '${ResourceMetadataEntity.METADATA_OBJECT_TYPE}'.`);
      throw error;
    }
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

  /**
   * Save session keys.
   *
   * Ignore any errors. The session key mechanism is optional and should not hinder the user journey.
   *
   * @param {SessionKeysCollection} sessionKeys The original session keys to save.
   * @param {array} decryptWithSharedKeySessionKeys The new session keys discovered when decrypting the metadata with the shared key.
   * @param {array} decryptWithUserKeySessionKeys The new session keys discovered when decrypting the metadata with the user key.
   * @param {string|null} [passphrase = null] The passphrase to use to decrypt the user private key. Marked as optional as it
   * might be available in the passphrase session storage.
   * @returns {Promise<void>}
   */
  async saveSessionKeys(sessionKeys, decryptWithSharedKeySessionKeys, decryptWithUserKeySessionKeys, passphrase = null) {
    try {
      const newSessionKeys = [...decryptWithSharedKeySessionKeys, ...decryptWithUserKeySessionKeys];

      if (newSessionKeys.length === 0) {
        return;
      }

      sessionKeys.pushMany(newSessionKeys, {ignoreInvalidEntity: true});
      await this.saveSessionKeysService.save(sessionKeys, passphrase);
    } catch (error) {
      console.warn("Unable to save the metadata session keys.", {cause: error});
    }
  }
}

export default DecryptMetadataService;
