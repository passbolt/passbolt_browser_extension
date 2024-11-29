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
import UserPassphraseRequiredError from "passbolt-styleguide/src/shared/error/userPassphraseRequiredError";
import DecryptMessageService from "../crypto/decryptMessageService";
import {
  privateResourcesSessionKeys,
  sharedResourcesSessionKeys
} from "passbolt-styleguide/src/shared/models/entity/sessionKey/sessionKeysCollection.test.data";
import SessionKeysCollection from "passbolt-styleguide/src/shared/models/entity/sessionKey/sessionKeysCollection";
import {metadata} from "passbolt-styleguide/test/fixture/encryptedMetadata/metadata";
import {defaultSessionKeyDto} from "passbolt-styleguide/src/shared/models/entity/sessionKey/sessionKeyEntity.test.data";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("DecryptMetadataService", () => {
  let account, apiClientOptions, service;

  beforeEach(() => {
    account = new AccountEntity(defaultAccountDto());
    apiClientOptions = defaultApiClientOptions();
    service = new DecryptMetadataService(apiClientOptions, account);
  });

  describe("::decryptAllFromForeignModels", () => {
    it("decrypts the metadata of a ResourcesCollection with the shared metadata key", async() => {
      expect.assertions(2);

      const metadataKeysDtos = defaultDecryptedSharedMetadataKeysDtos();
      const collectionDto = defaultSharedResourcesWithEncryptedMetadataDtos(10, {
        metadata_key_id: metadataKeysDtos[0].id
      });

      const collection = new ResourcesCollection(collectionDto);
      const passphrase = null;

      const metadataKeys = new MetadataKeysCollection(metadataKeysDtos);

      jest.spyOn(service.getOrFindMetadataKeysService, "getOrFindAll").mockImplementation(() => metadataKeys);

      const isAllResourceMetadataEncrypted = collection.resources.reduce((accumulator, resource) => accumulator && !resource.isMetadataDecrypted(), true);
      expect(isAllResourceMetadataEncrypted).toStrictEqual(true);

      await service.decryptAllFromForeignModels(collection, passphrase);

      const isAllResourceMetadataDecrypted = collection.resources.reduce((accumulator, resource) => accumulator && resource.isMetadataDecrypted(), true);
      expect(isAllResourceMetadataDecrypted).toStrictEqual(true);
    });

    it("decrypts the metadata of a ResourcesCollection with the user key", async() => {
      expect.assertions(2);

      const collectionDto = defaultPrivateResourcesWithEncryptedMetadataDtos();
      const collection = new ResourcesCollection(collectionDto);

      account = new AccountEntity(defaultAccountDto());
      const passphrase = pgpKeys.ada.passphrase;
      service = new DecryptMetadataService(apiClientOptions, account);

      const isAllResourceMetadataEncrypted = collection.resources.reduce((accumulator, resource) => accumulator && !resource.isMetadataDecrypted(), true);
      expect(isAllResourceMetadataEncrypted).toStrictEqual(true);

      await service.decryptAllFromForeignModels(collection, passphrase);

      const isAllResourceMetadataDecrypted = collection.resources.reduce((accumulator, resource) => accumulator && resource.isMetadataDecrypted(), true);
      expect(isAllResourceMetadataDecrypted).toStrictEqual(true);
    });

    it("decrypts the metadata of a ResourcesCollection with the session keys", async() => {
      expect.assertions(12);

      const collectionDto = defaultSharedResourcesWithEncryptedMetadataDtos();
      const collection = new ResourcesCollection(collectionDto);
      const sessionsKeysForeignIds = collection.items.map(resource => ({foreign_id: resource.id}));
      const sessionKeysDtos = sharedResourcesSessionKeys(sessionsKeysForeignIds, {count: collection.length});
      const sessionKeys = new SessionKeysCollection(sessionKeysDtos);

      jest.spyOn(service.getOrFindSessionKeysService, "getOrFindAllByForeignModelAndForeignIds").mockImplementation(() => sessionKeys);

      const isAllResourceMetadataEncrypted = collection.items.findIndex(resource => resource.isMetadataDecrypted()) !== -1;
      expect(isAllResourceMetadataEncrypted).toStrictEqual(false);
      await service.decryptAllFromForeignModels(collection);

      const isAllResourceMetadataDecrypted = collection.items.findIndex(resource => !resource.isMetadataDecrypted()) !== -1;
      expect(isAllResourceMetadataDecrypted).toStrictEqual(false);
      for (let i = 0; i < collection.length; i++) {
        expect(collection.items[i].metadata.toDto()).toEqual(metadata.withSharedKey.decryptedMetadata[i % metadata.withSharedKey.encryptedMetadata.length]);
      }
    });

    it("fallbacks on metadata key if a session key cannot be used to decrypt a resource metadata encrypted with the shared key", async() => {
      const metadataKeysDtos = defaultDecryptedSharedMetadataKeysDtos();
      const metadataKeys = new MetadataKeysCollection(metadataKeysDtos);
      const collectionDto = defaultSharedResourcesWithEncryptedMetadataDtos(10, {
        metadata_key_id: metadataKeysDtos[0].id
      });
      const collection = new ResourcesCollection(collectionDto);
      const sessionsKeysForeignIds = collection.items.map(resource => ({foreign_id: resource.id}));
      const sessionKeysDtos = sharedResourcesSessionKeys(sessionsKeysForeignIds, {count: collection.length});
      sessionKeysDtos[3] = defaultSessionKeyDto({...sessionKeysDtos[3], session_key: "9:901D6ED579AFF935F9F157A5198BCE48B50AD87345DEADBA06F42C5D018C78CC"});
      const sessionKeys = new SessionKeysCollection(sessionKeysDtos);

      jest.spyOn(service.getOrFindMetadataKeysService, "getOrFindAll").mockImplementation(() => metadataKeys);
      jest.spyOn(service.getOrFindSessionKeysService, "getOrFindAllByForeignModelAndForeignIds").mockImplementation(() => sessionKeys);

      const isAllResourceMetadataEncrypted = collection.items.findIndex(resource => resource.isMetadataDecrypted()) !== -1;
      expect(isAllResourceMetadataEncrypted).toStrictEqual(false);
      await service.decryptAllFromForeignModels(collection);

      expect(service.getOrFindMetadataKeysService.getOrFindAll).toHaveBeenCalledTimes(1);
      const isAllResourceMetadataDecrypted = collection.items.findIndex(resource => !resource.isMetadataDecrypted()) !== -1;
      expect(isAllResourceMetadataDecrypted).toStrictEqual(false);
      for (let i = 0; i < collection.length; i++) {
        expect(collection.items[i].metadata.toDto()).toEqual(metadata.withSharedKey.decryptedMetadata[i % metadata.withSharedKey.encryptedMetadata.length]);
      }
    });

    it("fallbacks on user key if a session key cannot be used to decrypt a resource metadata encrypted with the user key", async() => {
      const collectionDto = defaultPrivateResourcesWithEncryptedMetadataDtos();
      const collection = new ResourcesCollection(collectionDto);
      const sessionsKeysForeignIds = collection.items.map(resource => ({foreign_id: resource.id}));
      const sessionKeysDtos = privateResourcesSessionKeys(sessionsKeysForeignIds, {count: collection.length});
      sessionKeysDtos[6] = defaultSessionKeyDto({...sessionKeysDtos[6], session_key: "9:901D6ED579AFF935F9F157A5198BCE48B50AD87345DEADBA06F42C5D018C78CC"});
      const sessionKeys = new SessionKeysCollection(sessionKeysDtos);

      jest.spyOn(service.getOrFindSessionKeysService, "getOrFindAllByForeignModelAndForeignIds").mockImplementation(() => sessionKeys);

      const isAllResourceMetadataEncrypted = collection.items.findIndex(resource => resource.isMetadataDecrypted()) !== -1;
      expect(isAllResourceMetadataEncrypted).toStrictEqual(false);

      await service.decryptAllFromForeignModels(collection, pgpKeys.ada.passphrase);

      const isAllResourceMetadataDecrypted = collection.items.findIndex(resource => !resource.isMetadataDecrypted()) !== -1;
      expect(isAllResourceMetadataDecrypted).toStrictEqual(false);
      for (let i = 0; i < collection.length; i++) {
        expect(collection.items[i].metadata.toDto()).toEqual(metadata.withSharedKey.decryptedMetadata[i % metadata.withSharedKey.encryptedMetadata.length]);
      }
    });

    it("fallbacks on user or shared metadata key if a an unexpected error occurred while decrypting with a session key", async() => {
      const collectionDto = defaultPrivateResourcesWithEncryptedMetadataDtos();
      const collection = new ResourcesCollection(collectionDto);

      jest.spyOn(service.getOrFindSessionKeysService, "getOrFindAllByForeignModelAndForeignIds").mockImplementation(() => {
        throw new Error("something went wrong");
      });

      const isAllResourceMetadataEncrypted = collection.items.findIndex(resource => resource.isMetadataDecrypted()) !== -1;
      expect(isAllResourceMetadataEncrypted).toStrictEqual(false);

      await service.decryptAllFromForeignModels(collection, pgpKeys.ada.passphrase);

      expect(service.getOrFindSessionKeysService.getOrFindAllByForeignModelAndForeignIds).toHaveBeenCalledTimes(1);
      const isAllResourceMetadataDecrypted = collection.items.findIndex(resource => !resource.isMetadataDecrypted()) !== -1;
      expect(isAllResourceMetadataDecrypted).toStrictEqual(false);
      for (let i = 0; i < collection.length; i++) {
        expect(collection.items[i].metadata.toDto()).toEqual(metadata.withSharedKey.decryptedMetadata[i % metadata.withSharedKey.encryptedMetadata.length]);
      }
    });

    it("decrypts the metadata of a ResourcesCollection using the Passphrase storage to get the user's passphrase", async() => {
      expect.assertions(3);

      const collectionDto = defaultPrivateResourcesWithEncryptedMetadataDtos();
      const collection = new ResourcesCollection(collectionDto);

      jest.spyOn(PassphraseStorageService, "get");
      await PassphraseStorageService.set(pgpKeys.ada.passphrase);
      account = new AccountEntity(defaultAccountDto());
      service = new DecryptMetadataService(apiClientOptions, account);

      const isAllResourceMetadataEncrypted = collection.resources.reduce((accumulator, resource) => accumulator && !resource.isMetadataDecrypted(), true);
      expect(isAllResourceMetadataEncrypted).toStrictEqual(true);

      await service.decryptAllFromForeignModels(collection);

      expect(PassphraseStorageService.get).toHaveBeenCalledTimes(1);
      const isAllResourceMetadataDecrypted = collection.resources.reduce((accumulator, resource) => accumulator && resource.isMetadataDecrypted(), true);
      expect(isAllResourceMetadataDecrypted).toStrictEqual(true);
    });

    it("does nothing if the metadata is already decrypted", async() => {
      expect.assertions(3);

      const collectionDto = defaultResourceDtosCollection();
      const collection = new ResourcesCollection(collectionDto);

      const spyOnFindMetadataKeys = jest.spyOn(service.getOrFindMetadataKeysService, "getOrFindAll");

      let isAllResourceMetadataDecrypted = collection.resources.reduce((accumulator, resource) => accumulator && resource.isMetadataDecrypted(), true);
      expect(isAllResourceMetadataDecrypted).toStrictEqual(true);

      await service.decryptAllFromForeignModels(collection);

      isAllResourceMetadataDecrypted = collection.resources.reduce((accumulator, resource) => accumulator && resource.isMetadataDecrypted(), true);
      expect(isAllResourceMetadataDecrypted).toStrictEqual(true);

      expect(spyOnFindMetadataKeys).not.toHaveBeenCalled();
    });

    it("throws an error if no matching metadata key is found", async() => {
      expect.assertions(1);

      const collectionDto = defaultSharedResourcesWithEncryptedMetadataDtos(1);
      const collection = new ResourcesCollection(collectionDto);

      jest.spyOn(service.getOrFindMetadataKeysService, "getOrFindAll").mockImplementation(() => new MetadataKeysCollection([]));

      const expectedError = new Error(`Unable to decrypt the metadata of the resource (${collection._items[0]._props.id}) using the shared key (${collection._items[0]._props.metadata_key_id}).`);
      expectedError.cause = new Error(`No metadata key found with the id (${collection._items[0]._props.metadata_key_id}).`);
      await expect(() => service.decryptAllFromForeignModels(collection)).rejects.toThrow(expectedError);
    });

    it("throws an error if the matching metadata key does not have a metadata private key", async() => {
      expect.assertions(1);

      const metadataKeysDtos = defaultDecryptedSharedMetadataKeysDtos();
      const metadataKeys = new MetadataKeysCollection(metadataKeysDtos);
      delete(metadataKeys.items[0]._metadata_private_keys);

      const collectionDto = defaultSharedResourcesWithEncryptedMetadataDtos(1, {
        metadata_key_id: metadataKeysDtos[0].id
      });
      const collection = new ResourcesCollection(collectionDto);

      jest.spyOn(service.getOrFindMetadataKeysService, "getOrFindAll").mockImplementation(() => metadataKeys);

      const expectedError = new Error(`Unable to decrypt the metadata of the resource (${collection._items[0]._props.id}) using the shared key (${collection._items[0]._props.metadata_key_id}).`);
      expectedError.cause = new Error(`No metadata private key found for the metadata key id (${collection._items[0]._props.metadata_key_id}).`);
      await expect(() => service.decryptAllFromForeignModels(collection)).rejects.toThrow(expectedError);
    });

    it("throws an error if the matching metadata key has an encrypted private key", async() => {
      expect.assertions(1);

      const metadataKeysDtos = defaultDecryptedSharedMetadataKeysDtos();
      const metadataKeys = new MetadataKeysCollection(metadataKeysDtos);
      metadataKeys.items[0]._metadata_private_keys.items[0].data = pgpKeys.metadataKey.encryptedMetadataPrivateKeyDataMessage;

      const collectionDto = defaultSharedResourcesWithEncryptedMetadataDtos(1, {
        metadata_key_id: metadataKeysDtos[0].id
      });
      const collection = new ResourcesCollection(collectionDto);

      jest.spyOn(service.getOrFindMetadataKeysService, "getOrFindAll").mockImplementation(() => metadataKeys);

      const expectedError = new Error(`Unable to decrypt the metadata of the resource (${collection._items[0]._props.id}) using the shared key (${collection._items[0]._props.metadata_key_id}).`);
      expectedError.cause = new Error(`The metadata private key for the metadata key id (${collection._items[0]._props.metadata_key_id}) should be decrypted.`);
      await expect(() => service.decryptAllFromForeignModels(collection)).rejects.toThrow(expectedError);
    });

    it("throws if the collection given in parameter is not of type ResourcesCollection", async() => {
      expect.assertions(1);
      await expect(() => service.decryptAllFromForeignModels(42)).rejects.toThrow("The parameter \"collection\" should be a ResourcesCollection.");
    });

    it("throws an error if the passphrase can't be found", async() => {
      expect.assertions(1);

      const spyOnPassphraseStorage = jest.spyOn(PassphraseStorageService, "get");
      spyOnPassphraseStorage.mockImplementation(() => null);

      const collectionDto = defaultPrivateResourcesWithEncryptedMetadataDtos();
      const collection = new ResourcesCollection(collectionDto);

      const expectedError = new UserPassphraseRequiredError();
      await expect(() => service.decryptAllFromForeignModels(collection)).rejects.toThrow(expectedError);
    });

    it("throws error if an error occurs during decryption with a shared key", async() => {
      expect.assertions(1);

      const metadataKeysDtos = defaultDecryptedSharedMetadataKeysDtos();

      const collectionDto = defaultSharedResourcesWithEncryptedMetadataDtos(10, {
        metadata_key_id: metadataKeysDtos[0].id
      });

      const collection = new ResourcesCollection(collectionDto);

      const metadataKeys = new MetadataKeysCollection(metadataKeysDtos);

      jest.spyOn(service.getOrFindMetadataKeysService, "getOrFindAll").mockImplementation(() => metadataKeys);

      const errorCause = new Error("An error occurs during decryption process");
      const expectedError = new Error(`Unable to decrypt the metadata of the resource (${collection._items[0]._props.id}) using the shared key (${collection._items[0]._props.metadata_key_id}).`);
      expectedError.cause = errorCause;

      jest.spyOn(DecryptMessageService, "decrypt").mockImplementation(() => { throw new Error("An error occurs during decryption process"); });

      await expect(() => service.decryptAllFromForeignModels(collection)).rejects.toThrow(expectedError);
    });

    it("ignores decryption error if an error occur while decrypting with the shared metadata key and the option ignore decryption error is set to true", async() => {
      expect.assertions(1);

      const metadataKeysDtos = defaultDecryptedSharedMetadataKeysDtos();

      const collectionDto = defaultSharedResourcesWithEncryptedMetadataDtos(1, {
        metadata_key_id: metadataKeysDtos[0].id
      });

      const collection = new ResourcesCollection(collectionDto);
      const passphrase = null;

      const metadataKeys = new MetadataKeysCollection(metadataKeysDtos);

      jest.spyOn(service.getOrFindMetadataKeysService, "getOrFindAll").mockImplementation(() => metadataKeys);
      jest.spyOn(DecryptMessageService, "decrypt").mockImplementation(() => { throw new Error(); });

      await expect(service.decryptAllFromForeignModels(collection, passphrase, {ignoreDecryptionError: true})).resolves.toBeUndefined();
    });

    it("ignores decryption error if no matching metadata key is found and the option ignore decryption error is set to true", async() => {
      expect.assertions(1);

      const collectionDto = defaultSharedResourcesWithEncryptedMetadataDtos(1);
      const collection = new ResourcesCollection(collectionDto);

      jest.spyOn(service.getOrFindMetadataKeysService, "getOrFindAll").mockImplementation(() => new MetadataKeysCollection([]));

      await expect(service.decryptAllFromForeignModels(collection, null, {ignoreDecryptionError: true})).resolves.toBeUndefined();
    });

    it("throws error if an error occurs when decrypting with the user key", async() => {
      expect.assertions(1);

      const collectionDto = defaultPrivateResourcesWithEncryptedMetadataDtos();
      const collection = new ResourcesCollection(collectionDto);

      const errorCause = new Error("An error occurs during decryption process");
      const expectedError = new Error(`Unable to decrypt the metadata of the resource (${collection._items[0]._props.id}) using the user key.`);
      expectedError.cause = errorCause;

      jest.spyOn(DecryptMessageService, "decrypt").mockImplementation(() => { throw new Error("An error occurs during decryption process"); });

      await expect(() => service.decryptAllFromForeignModels(collection, pgpKeys.ada.passphrase)).rejects.toThrow(expectedError);
    });

    it("ignores decryption error if an error occur while decrypting with the user key and the option ignore decryption error is set to true", async() => {
      expect.assertions(1);

      const collectionDto = defaultPrivateResourcesWithEncryptedMetadataDtos();
      const collection = new ResourcesCollection(collectionDto);

      jest.spyOn(DecryptMessageService, "decrypt").mockImplementation(() => { throw new Error(); });

      await expect(service.decryptAllFromForeignModels(collection, pgpKeys.ada.passphrase, {ignoreDecryptionError: true})).resolves.toBeUndefined();
    });
  });
});
