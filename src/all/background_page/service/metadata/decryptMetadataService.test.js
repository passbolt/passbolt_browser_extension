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

import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import {defaultSharedResourcesWithEncryptedMetadataDtos, defaultPrivateResourcesWithEncryptedMetadataDtos, defaultResourceDtosCollection} from "passbolt-styleguide/src/shared/models/entity/resource/resourcesCollection.test.data";
import AccountEntity from "../../model/entity/account/accountEntity";
import ResourcesCollection from "../../model/entity/resource/resourcesCollection";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import DecryptMetadataService from "./decryptMetadataService";
import MetadataKeysCollection from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysCollection";
import {defaultDecryptedSharedMetadataKeysDtos} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysCollection.test.data";
import PassphraseStorageService from "../session_storage/passphraseStorageService";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import GetDecryptedUserPrivateKeyService from "../account/getDecryptedUserPrivateKeyService";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import UserPassphraseRequiredError from "passbolt-styleguide/src/shared/error/userPassphraseRequiredError";
import {v4 as uuidv4} from "uuid";
import ResourceEntity from "../../model/entity/resource/resourceEntity";
import DecryptMessageService from "../crypto/decryptMessageService";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("DecryptMetadataService", () => {
  describe("::decryptAllFromForeignModels", () => {
    it("should decrypt the metadata of a ResourcesCollection with shared metadata key", async() => {
      expect.assertions(2);

      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = defaultApiClientOptions();
      const metadataKeysDtos = defaultDecryptedSharedMetadataKeysDtos();

      const collectionDto = defaultSharedResourcesWithEncryptedMetadataDtos(10, {
        metadata_key_id: metadataKeysDtos[0].id
      });

      const collection = new ResourcesCollection(collectionDto);
      const passphrase = null;

      const metadataKeys = new MetadataKeysCollection(metadataKeysDtos);

      const service = new DecryptMetadataService(apiClientOptions, account);
      jest.spyOn(service.findMetadataKeysService, "findAllForSessionStorage").mockImplementation(() => metadataKeys);

      const isAllResourceMetadataEncrypted = collection.resources.reduce((accumulator, resource) => accumulator && !resource.isMetadataDecrypted(), true);
      expect(isAllResourceMetadataEncrypted).toStrictEqual(true);

      await service.decryptAllFromForeignModels(collection, passphrase);

      const isAllResourceMetadataDecrypted = collection.resources.reduce((accumulator, resource) => accumulator && resource.isMetadataDecrypted(), true);
      expect(isAllResourceMetadataDecrypted).toStrictEqual(true);
    }, 10 * 1000);

    it("should decrypt the metadata of a ResourcesCollection with private key", async() => {
      const collectionDto = defaultPrivateResourcesWithEncryptedMetadataDtos();
      expect.assertions(2 + collectionDto.length);

      const collection = new ResourcesCollection(collectionDto);

      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = defaultApiClientOptions();

      const passphrase = pgpKeys.ada.passphrase;

      const service = new DecryptMetadataService(apiClientOptions, account);
      jest.spyOn(GetDecryptedUserPrivateKeyService, "getKey").mockImplementation(async passphrase => {
        expect(passphrase).toStrictEqual(pgpKeys.ada.passphrase);
        return await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      });

      const isAllResourceMetadataEncrypted = collection.resources.reduce((accumulator, resource) => accumulator && !resource.isMetadataDecrypted(), true);
      expect(isAllResourceMetadataEncrypted).toStrictEqual(true);

      await service.decryptAllFromForeignModels(collection, passphrase);

      const isAllResourceMetadataDecrypted = collection.resources.reduce((accumulator, resource) => accumulator && resource.isMetadataDecrypted(), true);
      expect(isAllResourceMetadataDecrypted).toStrictEqual(true);
    }, 10 * 1000);

    it("should decrypt the metadata of a ResourcesCollection using the Passphrase storage to get the user's passphrase", async() => {
      const collectionDto = defaultPrivateResourcesWithEncryptedMetadataDtos();
      expect.assertions(2 + collectionDto.length);

      const spyOnPassphraseStorage = jest.spyOn(PassphraseStorageService, "get");
      spyOnPassphraseStorage.mockImplementation(() => pgpKeys.ada.passphrase);

      const collection = new ResourcesCollection(collectionDto);

      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = defaultApiClientOptions();

      const service = new DecryptMetadataService(apiClientOptions, account);
      jest.spyOn(GetDecryptedUserPrivateKeyService, "getKey").mockImplementation(async passphrase => {
        expect(passphrase).toStrictEqual(pgpKeys.ada.passphrase);
        return await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      });

      const isAllResourceMetadataEncrypted = collection.resources.reduce((accumulator, resource) => accumulator && !resource.isMetadataDecrypted(), true);
      expect(isAllResourceMetadataEncrypted).toStrictEqual(true);

      await service.decryptAllFromForeignModels(collection);

      const isAllResourceMetadataDecrypted = collection.resources.reduce((accumulator, resource) => accumulator && resource.isMetadataDecrypted(), true);
      expect(isAllResourceMetadataDecrypted).toStrictEqual(true);
    }, 10 * 1000);

    it("should do nothing if the metadata is already decrypted", async() => {
      expect.assertions(4);

      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = defaultApiClientOptions();

      const collectionDto = defaultResourceDtosCollection();

      const collection = new ResourcesCollection(collectionDto);

      const service = new DecryptMetadataService(apiClientOptions, account);
      const spyOnFindMetadataKeys = jest.spyOn(service.findMetadataKeysService, "findAllForSessionStorage");
      const spyOnGetDecryptedPrivateKey = jest.spyOn(GetDecryptedUserPrivateKeyService, "getKey");

      let isAllResourceMetadataDecrypted = collection.resources.reduce((accumulator, resource) => accumulator && resource.isMetadataDecrypted(), true);
      expect(isAllResourceMetadataDecrypted).toStrictEqual(true);

      await service.decryptAllFromForeignModels(collection);

      isAllResourceMetadataDecrypted = collection.resources.reduce((accumulator, resource) => accumulator && resource.isMetadataDecrypted(), true);
      expect(isAllResourceMetadataDecrypted).toStrictEqual(true);

      expect(spyOnFindMetadataKeys).not.toHaveBeenCalled();
      expect(spyOnGetDecryptedPrivateKey).not.toHaveBeenCalled();
    });

    it("should throw an error if no matching metadata key is found", async() => {
      expect.assertions(1);

      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = defaultApiClientOptions();

      const collectionDto = defaultSharedResourcesWithEncryptedMetadataDtos(1);
      const collection = new ResourcesCollection(collectionDto);

      const service = new DecryptMetadataService(apiClientOptions, account);
      jest.spyOn(service.findMetadataKeysService, "findAllForSessionStorage").mockImplementation(() => new MetadataKeysCollection([]));

      const expectedError = new Error(`Metadata of the resource (${collection._items[0]._props.id}) cannot be decrypted.`);
      expectedError.cause = new Error(`No metadata key found with the id (${collection._items[0]._props.metadata_key_id})`);
      await expect(() => service.decryptAllFromForeignModels(collection)).rejects.toThrow(expectedError);
    });

    it("should assert that the collection is of type ResourcesCollection or FoldersCollection", async() => {
      expect.assertions(1);

      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = defaultApiClientOptions();

      const collectionDto = defaultSharedResourcesWithEncryptedMetadataDtos(1);

      const service = new DecryptMetadataService(apiClientOptions, account);
      jest.spyOn(service.findMetadataKeysService, "findAllForSessionStorage").mockImplementation(() => new MetadataKeysCollection([]));

      const expectedError = new Error("The given collection is neither a ResourcesCollection nor a FoldersCollection");
      await expect(() => service.decryptAllFromForeignModels(collectionDto)).rejects.toThrow(expectedError);
    });

    it("should throw an error if the passphrase can't be found", async() => {
      expect.assertions(1);

      const spyOnPassphraseStorage = jest.spyOn(PassphraseStorageService, "get");
      spyOnPassphraseStorage.mockImplementation(() => null);

      const collectionDto = defaultPrivateResourcesWithEncryptedMetadataDtos();
      const collection = new ResourcesCollection(collectionDto);

      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = defaultApiClientOptions();

      const service = new DecryptMetadataService(apiClientOptions, account);

      const expectedError = new UserPassphraseRequiredError();
      await expect(() => service.decryptAllFromForeignModels(collection)).rejects.toThrow(expectedError);
    });

    it("should throw an error if a resource is encrypted with user key and has a metadata key id", async() => {
      expect.assertions(1);

      const collectionDto = defaultPrivateResourcesWithEncryptedMetadataDtos(1);
      collectionDto[0].metadata_key_id = uuidv4();
      const collection = new ResourcesCollection(collectionDto);

      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = defaultApiClientOptions();

      const service = new DecryptMetadataService(apiClientOptions, account);

      const expectedError = new Error(`Metadata of the resource (${collectionDto[0].id}) cannot be decrypted.`);
      const errorCause = new Error("Entitie's metadata should either be encrypted with a shared metadata key or with the current user's private key.");
      expectedError.cause = errorCause;

      await expect(() => service.decryptAllFromForeignModels(collection, "passphrase")).rejects.toThrow(expectedError);
    });

    it("should throw error if a resource is encrypted with shared metadata key but is marked as encrypted with private key", async() => {
      expect.assertions(1);

      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = defaultApiClientOptions();

      const collectionDto = defaultSharedResourcesWithEncryptedMetadataDtos(1);
      collectionDto[0].metadata_key_type = ResourceEntity.METADATA_KEY_TYPE_USER_KEY;

      const collection = new ResourcesCollection(collectionDto);
      const service = new DecryptMetadataService(apiClientOptions, account);

      const expectedError = new Error(`Metadata of the resource (${collectionDto[0].id}) cannot be decrypted.`);
      const errorCause = new Error("Entitie's metadata should either be encrypted with a shared metadata key or with the current user's private key.");
      expectedError.cause = errorCause;

      await expect(() => service.decryptAllFromForeignModels(collection)).rejects.toThrow(expectedError);
    });

    it("should ignore error if a resource is encrypted with user key and has a metadata key id", async() => {
      expect.assertions(1);

      const collectionDto = defaultPrivateResourcesWithEncryptedMetadataDtos(1);
      collectionDto[0].metadata_key_id = uuidv4();
      const collection = new ResourcesCollection(collectionDto);

      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = defaultApiClientOptions();

      const service = new DecryptMetadataService(apiClientOptions, account);

      await expect(() => service.decryptAllFromForeignModels(collection, "passphrase", {ignoreDecryptionError: true})).not.toThrow();
    });

    it("should ignore error if a resource is encrypted with shared metadata key but is marked as encrypted with private key", async() => {
      expect.assertions(1);

      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = defaultApiClientOptions();

      const collectionDto = defaultSharedResourcesWithEncryptedMetadataDtos(1);
      collectionDto[0].metadata_key_type = ResourceEntity.METADATA_KEY_TYPE_USER_KEY;

      const collection = new ResourcesCollection(collectionDto);
      const service = new DecryptMetadataService(apiClientOptions, account);

      await expect(() => service.decryptAllFromForeignModels(collection, null, {ignoreDecryptionError: true})).not.toThrow();
    });

    it("should throw error if an error occurs during decryption with a shared key", async() => {
      expect.assertions(1);

      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = defaultApiClientOptions();
      const metadataKeysDtos = defaultDecryptedSharedMetadataKeysDtos();

      const collectionDto = defaultSharedResourcesWithEncryptedMetadataDtos(10, {
        metadata_key_id: metadataKeysDtos[0].id
      });

      const collection = new ResourcesCollection(collectionDto);

      const metadataKeys = new MetadataKeysCollection(metadataKeysDtos);

      const service = new DecryptMetadataService(apiClientOptions, account);
      jest.spyOn(service.findMetadataKeysService, "findAllForSessionStorage").mockImplementation(() => metadataKeys);

      const decryptionErrorCause = new Error("An error occurs during decryption process");
      const decryptionError = new Error("Could not decrypt metadata");
      const expectedError = new Error(`Metadata of the resource (${collectionDto[0].id}) cannot be decrypted.`);
      decryptionError.cause = decryptionErrorCause;
      expectedError.cause = decryptionError;

      jest.spyOn(DecryptMessageService, "decrypt").mockImplementation(() => { throw new Error("An error occurs during decryption process"); });

      await expect(() => service.decryptAllFromForeignModels(collection)).rejects.toThrow(expectedError);
    });

    it("should ignore error if an error occurs during decryption with a shared key", async() => {
      expect.assertions(1);

      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = defaultApiClientOptions();
      const metadataKeysDtos = defaultDecryptedSharedMetadataKeysDtos();

      const collectionDto = defaultSharedResourcesWithEncryptedMetadataDtos(1, {
        metadata_key_id: metadataKeysDtos[0].id
      });

      const collection = new ResourcesCollection(collectionDto);
      const passphrase = null;

      const metadataKeys = new MetadataKeysCollection(metadataKeysDtos);

      const service = new DecryptMetadataService(apiClientOptions, account);
      jest.spyOn(service.findMetadataKeysService, "findAllForSessionStorage").mockImplementation(() => metadataKeys);
      jest.spyOn(DecryptMessageService, "decrypt").mockImplementation(() => { throw new Error(); });

      await expect(() => service.decryptAllFromForeignModels(collection, passphrase, {ignoreDecryptionError: true})).not.toThrow();
    });

    it("should ignore error if no matching metadata key is found", async() => {
      expect.assertions(1);

      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = defaultApiClientOptions();

      const collectionDto = defaultSharedResourcesWithEncryptedMetadataDtos(1);
      const collection = new ResourcesCollection(collectionDto);

      const service = new DecryptMetadataService(apiClientOptions, account);
      jest.spyOn(service.findMetadataKeysService, "findAllForSessionStorage").mockImplementation(() => new MetadataKeysCollection([]));

      await expect(() => service.decryptAllFromForeignModels(collection, null, {ignoreDecryptionError: true})).not.toThrow();
    });

    it("should throw error if an error occurs during decryption with a private key", async() => {
      expect.assertions(1);

      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = defaultApiClientOptions();

      const collectionDto = defaultPrivateResourcesWithEncryptedMetadataDtos();

      const collection = new ResourcesCollection(collectionDto);
      const service = new DecryptMetadataService(apiClientOptions, account);
      jest.spyOn(GetDecryptedUserPrivateKeyService, "getKey").mockImplementation(async() => await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted));

      const decryptionErrorCause = new Error("An error occurs during decryption process");
      const decryptionError = new Error("Could not decrypt metadata");
      const expectedError = new Error(`Metadata of the resource (${collectionDto[0].id}) cannot be decrypted.`);
      decryptionError.cause = decryptionErrorCause;
      expectedError.cause = decryptionError;

      jest.spyOn(DecryptMessageService, "decrypt").mockImplementation(() => { throw new Error("An error occurs during decryption process"); });

      await expect(() => service.decryptAllFromForeignModels(collection, "passphrase")).rejects.toThrow(expectedError);
    });

    it("should ignore error if an error occurs during decryption with a private key", async() => {
      expect.assertions(1);

      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = defaultApiClientOptions();

      const collectionDto = defaultPrivateResourcesWithEncryptedMetadataDtos();

      const collection = new ResourcesCollection(collectionDto);
      const service = new DecryptMetadataService(apiClientOptions, account);

      jest.spyOn(DecryptMessageService, "decrypt").mockImplementation(() => { throw new Error(); });

      await expect(() => service.decryptAllFromForeignModels(collection, "passphrase", {ignoreDecryptionError: true})).not.toThrow();
    });

    it.todo("should decrypt the metadata of a FoldersCollection");
  });
});
