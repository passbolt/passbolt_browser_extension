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
import {adminAccountDto, defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import DecryptMetadataService from "./decryptMetadataService";
import MetadataKeysCollection from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysCollection";
import {defaultDecryptedSharedMetadataKeysDtos} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysCollection.test.data";
import PassphraseStorageService from "../session_storage/passphraseStorageService";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import UserPassphraseRequiredError from "passbolt-styleguide/src/shared/error/userPassphraseRequiredError";
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
      expect.assertions(2);

      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = defaultApiClientOptions();
      const collectionDto = defaultPrivateResourcesWithEncryptedMetadataDtos();
      const collection = new ResourcesCollection(collectionDto);
      const passphrase = pgpKeys.ada.passphrase;

      const service = new DecryptMetadataService(apiClientOptions, account);

      const isAllResourceMetadataEncrypted = collection.resources.reduce((accumulator, resource) => accumulator && !resource.isMetadataDecrypted(), true);
      expect(isAllResourceMetadataEncrypted).toStrictEqual(true);

      await service.decryptAllFromForeignModels(collection, passphrase);

      const isAllResourceMetadataDecrypted = collection.resources.reduce((accumulator, resource) => accumulator && resource.isMetadataDecrypted(), true);
      expect(isAllResourceMetadataDecrypted).toStrictEqual(true);
    }, 10 * 1000);

    it("should decrypt the metadata of a ResourcesCollection using the Passphrase storage to get the user's passphrase", async() => {
      expect.assertions(3);

      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = defaultApiClientOptions();
      const collectionDto = defaultPrivateResourcesWithEncryptedMetadataDtos();
      const collection = new ResourcesCollection(collectionDto);

      const service = new DecryptMetadataService(apiClientOptions, account);
      jest.spyOn(PassphraseStorageService, "get");
      await PassphraseStorageService.set(pgpKeys.ada.passphrase);

      const isAllResourceMetadataEncrypted = collection.resources.reduce((accumulator, resource) => accumulator && !resource.isMetadataDecrypted(), true);
      expect(isAllResourceMetadataEncrypted).toStrictEqual(true);

      await service.decryptAllFromForeignModels(collection);

      expect(PassphraseStorageService.get).toHaveBeenCalledTimes(1);
      const isAllResourceMetadataDecrypted = collection.resources.reduce((accumulator, resource) => accumulator && resource.isMetadataDecrypted(), true);
      expect(isAllResourceMetadataDecrypted).toStrictEqual(true);
    }, 10 * 1000);

    it("should do nothing if the metadata is already decrypted", async() => {
      expect.assertions(3);

      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = defaultApiClientOptions();

      const collectionDto = defaultResourceDtosCollection();

      const collection = new ResourcesCollection(collectionDto);

      const service = new DecryptMetadataService(apiClientOptions, account);
      const spyOnFindMetadataKeys = jest.spyOn(service.findMetadataKeysService, "findAllForSessionStorage");

      let isAllResourceMetadataDecrypted = collection.resources.reduce((accumulator, resource) => accumulator && resource.isMetadataDecrypted(), true);
      expect(isAllResourceMetadataDecrypted).toStrictEqual(true);

      await service.decryptAllFromForeignModels(collection);

      isAllResourceMetadataDecrypted = collection.resources.reduce((accumulator, resource) => accumulator && resource.isMetadataDecrypted(), true);
      expect(isAllResourceMetadataDecrypted).toStrictEqual(true);

      expect(spyOnFindMetadataKeys).not.toHaveBeenCalled();
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
      expectedError.cause = new Error(`No metadata key found with the id (${collection._items[0]._props.metadata_key_id}).`);
      await expect(() => service.decryptAllFromForeignModels(collection)).rejects.toThrow(expectedError);
    });

    it("should throw an error if the matching metadata key does not have a metadata private key", async() => {
      expect.assertions(1);

      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = defaultApiClientOptions();

      const metadataKeysDtos = defaultDecryptedSharedMetadataKeysDtos();
      const metadataKeys = new MetadataKeysCollection(metadataKeysDtos);
      delete(metadataKeys.items[0]._metadata_private_keys);

      const collectionDto = defaultSharedResourcesWithEncryptedMetadataDtos(1, {
        metadata_key_id: metadataKeysDtos[0].id
      });
      const collection = new ResourcesCollection(collectionDto);

      const service = new DecryptMetadataService(apiClientOptions, account);

      // delete(metadataKeys.items[0].metadata_private_keys);
      jest.spyOn(service.findMetadataKeysService, "findAllForSessionStorage").mockImplementation(() => metadataKeys);


      const expectedError = new Error(`Metadata of the resource (${collection._items[0]._props.id}) cannot be decrypted.`);
      expectedError.cause = new Error(`No metadata private key found for the metadata key id (${collection._items[0]._props.metadata_key_id}).`);
      await expect(() => service.decryptAllFromForeignModels(collection)).rejects.toThrow(expectedError);
    });

    it("should throw an error if the matching metadata key has an encrypted private key", async() => {
      expect.assertions(1);

      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = defaultApiClientOptions();

      const metadataKeysDtos = defaultDecryptedSharedMetadataKeysDtos();
      const metadataKeys = new MetadataKeysCollection(metadataKeysDtos);
      metadataKeys.items[0]._metadata_private_keys.items[0].data = pgpKeys.metadataKey.encryptedMetadataPrivateKeyDataMessage;

      const collectionDto = defaultSharedResourcesWithEncryptedMetadataDtos(1, {
        metadata_key_id: metadataKeysDtos[0].id
      });
      const collection = new ResourcesCollection(collectionDto);

      const service = new DecryptMetadataService(apiClientOptions, account);

      // delete(metadataKeys.items[0].metadata_private_keys);
      jest.spyOn(service.findMetadataKeysService, "findAllForSessionStorage").mockImplementation(() => metadataKeys);


      const expectedError = new Error(`Metadata of the resource (${collection._items[0]._props.id}) cannot be decrypted.`);
      expectedError.cause = new Error(`The metadata private key for the metadata key id (${collection._items[0]._props.metadata_key_id}) should be decrypted.`);
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

      const errorCause = new Error("An error occurs during decryption process");
      const expectedError = new Error(`Metadata of the resource (${collectionDto[0].id}) cannot be decrypted.`);
      expectedError.cause = errorCause;

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

      const account = new AccountEntity(adminAccountDto());
      const apiClientOptions = defaultApiClientOptions();

      const collectionDto = defaultPrivateResourcesWithEncryptedMetadataDtos();

      const collection = new ResourcesCollection(collectionDto);
      const service = new DecryptMetadataService(apiClientOptions, account);

      const errorCause = new Error("An error occurs during decryption process");
      const expectedError = new Error(`Metadata of the resource (${collectionDto[0].id}) cannot be decrypted.`);
      expectedError.cause = errorCause;

      jest.spyOn(DecryptMessageService, "decrypt").mockImplementation(() => { throw new Error("An error occurs during decryption process"); });

      await expect(() => service.decryptAllFromForeignModels(collection, pgpKeys.admin.passphrase)).rejects.toThrow(expectedError);
    });

    it("should ignore error if an error occurs during decryption with a private key", async() => {
      expect.assertions(1);

      const account = new AccountEntity(adminAccountDto());
      const apiClientOptions = defaultApiClientOptions();

      const collectionDto = defaultPrivateResourcesWithEncryptedMetadataDtos();

      const collection = new ResourcesCollection(collectionDto);
      const service = new DecryptMetadataService(apiClientOptions, account);

      jest.spyOn(DecryptMessageService, "decrypt").mockImplementation(() => { throw new Error(); });

      await expect(() => service.decryptAllFromForeignModels(collection, pgpKeys.admin.passphrase, {ignoreDecryptionError: true})).not.toThrow();
    });
  });
});
