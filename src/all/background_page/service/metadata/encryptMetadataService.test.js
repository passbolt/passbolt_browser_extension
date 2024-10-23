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
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import DecryptMetadataService from "./decryptMetadataService";
import MetadataKeysCollection from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysCollection";
import {
  defaultDecryptedSharedMetadataKeysDtos, defaultMinimalMetadataKeysDtos
} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysCollection.test.data";
import PassphraseStorageService from "../session_storage/passphraseStorageService";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import {defaultResourceDto} from "passbolt-styleguide/src/shared/models/entity/resource/resourceEntity.test.data";
import UserPassphraseRequiredError from "passbolt-styleguide/src/shared/error/userPassphraseRequiredError";
import ResourceEntity from "../../model/entity/resource/resourceEntity";
import EncryptMetadataService from "./encryptMetadataService";
import {
  TEST_RESOURCE_TYPE_V5_DEFAULT
} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypeEntity.test.data";
import GetDecryptedUserPrivateKeyService from "../account/getDecryptedUserPrivateKeyService";
import DecryptPrivateKeyService from "../crypto/decryptPrivateKeyService";
import {
  defaultMetadataKeysSettingsDto
} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysSettingsEntity.test.data";
import ResourcesCollection from "../../model/entity/resource/resourcesCollection";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("EncryptMetadataService", () => {
  let encryptService, decryptService, account, apiClientOptions;

  beforeEach(async() => {
    account = new AccountEntity(defaultAccountDto());
    apiClientOptions = defaultApiClientOptions();
    encryptService = new EncryptMetadataService(apiClientOptions, account);
    decryptService = new DecryptMetadataService(apiClientOptions, account);
    // flush account related storage before each.
    encryptService.getOrFindMetadataSettingsService.metadataKeysSettingsLocalStorage.flush();
  });

  describe("::encryptOneFromForeignModels", () => {
    it("should encrypt the metadata of a ResourcesEntity with shared metadata key", async() => {
      expect.assertions(5);

      const metadataKeysDtos = defaultDecryptedSharedMetadataKeysDtos({armored_key: pgpKeys.metadataKey.public});

      const metadataKeys = new MetadataKeysCollection(metadataKeysDtos);
      const resourceEntity = new ResourceEntity(defaultResourceDto({resource_type_id: TEST_RESOURCE_TYPE_V5_DEFAULT}));
      resourceEntity._props.personal = false;

      jest.spyOn(encryptService.getOrFindMetadataKeysService, "getOrFindAll").mockImplementation(() => metadataKeys);
      jest.spyOn(decryptService.getOrFindMetadataKeysService, "getOrFindAll").mockImplementation(() => metadataKeys);
      jest.spyOn(PassphraseStorageService, "get").mockImplementation(() => pgpKeys.ada.passphrase);

      expect(resourceEntity.isMetadataDecrypted()).toBeTruthy();

      await encryptService.encryptOneForForeignModel(resourceEntity, null);

      expect(resourceEntity.isMetadataDecrypted()).toBeFalsy();
      expect(resourceEntity.metadataKeyType).toEqual(ResourceEntity.METADATA_KEY_TYPE_METADATA_KEY);
      expect(resourceEntity.metadataKeyId).toEqual(metadataKeys.getFirstByLatestCreated().id);

      await decryptService.decryptOneWithSharedKey(resourceEntity);

      expect(resourceEntity.isMetadataDecrypted()).toBeTruthy();
    });

    it("should encrypt the metadata of a ResourcesEntity with user private key", async() => {
      expect.assertions(5);

      const resourceEntity = new ResourceEntity(defaultResourceDto({resource_type_id: TEST_RESOURCE_TYPE_V5_DEFAULT}));
      resourceEntity._props.personal = true;
      const metadataKeysSettingsDto = defaultMetadataKeysSettingsDto();
      const privateKeyDecrypted = await DecryptPrivateKeyService.decryptArmoredKey(account.userPrivateArmoredKey, pgpKeys.ada.passphrase);
      jest.spyOn(GetDecryptedUserPrivateKeyService, "getKey").mockImplementationOnce(async() => privateKeyDecrypted);
      jest.spyOn(encryptService.getOrFindMetadataSettingsService.findAndUpdateMetadataSettingsLocalStorageService.findMetadataSettingsService.metadataKeysSettingsApiService, "findSettings")
        .mockImplementationOnce(() => metadataKeysSettingsDto);

      expect(resourceEntity.isMetadataDecrypted()).toBeTruthy();

      await encryptService.encryptOneForForeignModel(resourceEntity, pgpKeys.ada.passphrase);

      expect(resourceEntity.isMetadataDecrypted()).toBeFalsy();
      expect(resourceEntity.metadataKeyType).toEqual(ResourceEntity.METADATA_KEY_TYPE_USER_KEY);
      expect(resourceEntity.metadataKeyId).toBeNull();

      await decryptService.decryptOneWithUserKey(resourceEntity, pgpKeys.ada.passphrase);

      expect(resourceEntity.isMetadataDecrypted()).toBeTruthy();
    });

    it("should encrypt the metadata of a ResourcesEntity with shared metadata key if user is not allowed to use his personal key", async() => {
      expect.assertions(5);

      const metadataKeysDtos = defaultDecryptedSharedMetadataKeysDtos({armored_key: pgpKeys.metadataKey.public});
      const metadataKeys = new MetadataKeysCollection(metadataKeysDtos);
      const resourceEntity = new ResourceEntity(defaultResourceDto({resource_type_id: TEST_RESOURCE_TYPE_V5_DEFAULT}));
      resourceEntity._props.personal = true;
      const metadataKeysSettingsDto = defaultMetadataKeysSettingsDto({allow_usage_of_personal_keys: false, zero_knowledge_key_share: false});

      jest.spyOn(encryptService.getOrFindMetadataKeysService, "getOrFindAll").mockImplementation(() => metadataKeys);
      jest.spyOn(decryptService.getOrFindMetadataKeysService, "getOrFindAll").mockImplementation(() => metadataKeys);
      jest.spyOn(encryptService.getOrFindMetadataSettingsService.findAndUpdateMetadataSettingsLocalStorageService.findMetadataSettingsService.metadataKeysSettingsApiService, "findSettings")
        .mockImplementationOnce(() => metadataKeysSettingsDto);

      expect(resourceEntity.isMetadataDecrypted()).toBeTruthy();

      await encryptService.encryptOneForForeignModel(resourceEntity, pgpKeys.ada.passphrase);

      expect(resourceEntity.isMetadataDecrypted()).toBeFalsy();
      expect(resourceEntity.metadataKeyType).toEqual(ResourceEntity.METADATA_KEY_TYPE_METADATA_KEY);
      expect(resourceEntity.metadataKeyId).toEqual(metadataKeys.getFirstByLatestCreated().id);

      await decryptService.decryptOneWithSharedKey(resourceEntity);

      expect(resourceEntity.isMetadataDecrypted()).toBeTruthy();
    });

    it("should throw an error if the metadata is already encrypted", async() => {
      expect.assertions(5);

      const metadataKeysDtos = defaultDecryptedSharedMetadataKeysDtos();

      const metadataKeys = new MetadataKeysCollection(metadataKeysDtos);
      const resourceEntity = new ResourceEntity(defaultResourceDto({resource_type_id: TEST_RESOURCE_TYPE_V5_DEFAULT}));
      resourceEntity._props.personal = false;

      jest.spyOn(encryptService.getOrFindMetadataKeysService, "getOrFindAll").mockImplementationOnce(() => metadataKeys);

      expect(resourceEntity.isMetadataDecrypted()).toBeTruthy();

      await encryptService.encryptOneForForeignModel(resourceEntity, pgpKeys.ada.passphrase);

      expect(resourceEntity.isMetadataDecrypted()).toBeFalsy();
      expect(resourceEntity.metadataKeyType).toEqual(ResourceEntity.METADATA_KEY_TYPE_METADATA_KEY);
      expect(resourceEntity.metadataKeyId).toEqual(metadataKeys.getFirstByLatestCreated().id);

      const resourceEntityClone = new ResourceEntity(resourceEntity.toDto(ResourceEntity.ALL_CONTAIN_OPTIONS));

      const expectedError = new Error("Unable to encrypt the entity metadata, metadata is already encrypted.");
      await expect(() => encryptService.encryptOneForForeignModel(resourceEntityClone, pgpKeys.ada.passphrase)).rejects.toThrow(expectedError);
    });

    it("should throw an error if no metadata key is found", async() => {
      expect.assertions(1);

      const resourceEntity = new ResourceEntity(defaultResourceDto({resource_type_id: TEST_RESOURCE_TYPE_V5_DEFAULT}));
      resourceEntity._props.personal = false;

      jest.spyOn(encryptService.getOrFindMetadataKeysService, "getOrFindAll").mockImplementationOnce(() => new MetadataKeysCollection([]));

      const expectedError = new Error("Unable to encrypt the entity metadata, no metadata key found.");
      await expect(() => encryptService.encryptOneForForeignModel(resourceEntity, pgpKeys.ada.passphrase)).rejects.toThrow(expectedError);
    });

    it("should throw an error if private metadata key is not decrypted", async() => {
      expect.assertions(1);

      const metadataKeysDtos = defaultMinimalMetadataKeysDtos();
      const metadataKeys = new MetadataKeysCollection(metadataKeysDtos);
      const resourceEntity = new ResourceEntity(defaultResourceDto({resource_type_id: TEST_RESOURCE_TYPE_V5_DEFAULT}));
      resourceEntity._props.personal = false;

      jest.spyOn(encryptService.getOrFindMetadataKeysService, "getOrFindAll").mockImplementationOnce(() => metadataKeys);

      const expectedError = new Error("Unable to encrypt the entity metadata, metadata private key is not decrypted.");
      await expect(() => encryptService.encryptOneForForeignModel(resourceEntity, pgpKeys.ada.passphrase)).rejects.toThrow(expectedError);
    });

    it("should assert that the entity is of type ResourcesEntity or FoldersEntity", async() => {
      expect.assertions(1);

      const resourceDto = defaultResourceDto();

      const expectedError = new Error("The given data type is not a ResourceEntity or a FolderEntity");
      await expect(() => encryptService.encryptOneForForeignModel(resourceDto)).rejects.toThrow(expectedError);
    });

    it("should throw an error if the passphrase can't be found", async() => {
      expect.assertions(1);

      const spyOnPassphraseStorage = jest.spyOn(PassphraseStorageService, "get");
      spyOnPassphraseStorage.mockImplementation(() => null);

      const resourceEntity = new ResourceEntity(defaultResourceDto({resource_type_id: TEST_RESOURCE_TYPE_V5_DEFAULT}));

      const expectedError = new UserPassphraseRequiredError();
      await expect(() => encryptService.encryptOneForForeignModel(resourceEntity)).rejects.toThrow(expectedError);
    });
  });

  describe("::encryptAllFromForeignModels", () => {
    it("should encrypt the metadata of a ResourceCollection with shared metadata key", async() => {
      expect.assertions(5);

      const resourceEntity = new ResourceEntity(defaultResourceDto({resource_type_id: TEST_RESOURCE_TYPE_V5_DEFAULT}));
      resourceEntity._props.personal = false;
      const collection = new ResourcesCollection([resourceEntity]);
      const metadataKeysDtos = defaultDecryptedSharedMetadataKeysDtos({armored_key: pgpKeys.metadataKey.public});
      const metadataKeys = new MetadataKeysCollection(metadataKeysDtos);

      jest.spyOn(encryptService.getOrFindMetadataKeysService, "getOrFindAll").mockImplementation(() => metadataKeys);
      jest.spyOn(decryptService.getOrFindMetadataKeysService, "getOrFindAll").mockImplementation(() => metadataKeys);
      jest.spyOn(PassphraseStorageService, "get").mockImplementation(() => pgpKeys.ada.passphrase);
      jest.spyOn(encryptService.getOrFindMetadataSettingsService.findAndUpdateMetadataSettingsLocalStorageService.findMetadataSettingsService.metadataKeysSettingsApiService, "findSettings")
        .mockImplementationOnce(() => defaultMetadataKeysSettingsDto());

      expect(collection.items[0].isMetadataDecrypted()).toBeTruthy();

      await encryptService.encryptAllFromForeignModels(collection, null);

      const expectedResult = collection.items[0];

      expect(expectedResult.isMetadataDecrypted()).toBeFalsy();
      expect(expectedResult.metadataKeyType).toEqual(ResourceEntity.METADATA_KEY_TYPE_METADATA_KEY);
      expect(expectedResult.metadataKeyId).toEqual(metadataKeys.getFirstByLatestCreated().id);

      await decryptService.decryptOneWithSharedKey(expectedResult);

      expect(expectedResult.isMetadataDecrypted()).toBeTruthy();
    });

    it("should encrypt the metadata of a ResourcesEntity with user private key", async() => {
      expect.assertions(5);

      const resourceEntity = new ResourceEntity(defaultResourceDto({resource_type_id: TEST_RESOURCE_TYPE_V5_DEFAULT}));
      resourceEntity._props.personal = true;
      const collection = new ResourcesCollection([resourceEntity]);
      const privateKeyDecrypted = await DecryptPrivateKeyService.decryptArmoredKey(account.userPrivateArmoredKey, pgpKeys.ada.passphrase);
      const metadataKeysDtos = defaultDecryptedSharedMetadataKeysDtos({armored_key: pgpKeys.metadataKey.public});
      const metadataKeys = new MetadataKeysCollection(metadataKeysDtos);

      jest.spyOn(encryptService.getOrFindMetadataKeysService, "getOrFindAll").mockImplementation(() => metadataKeys);
      jest.spyOn(decryptService.getOrFindMetadataKeysService, "getOrFindAll").mockImplementation(() => metadataKeys);
      jest.spyOn(GetDecryptedUserPrivateKeyService, "getKey").mockImplementationOnce(async() => privateKeyDecrypted);
      jest.spyOn(encryptService.getOrFindMetadataSettingsService.findAndUpdateMetadataSettingsLocalStorageService.findMetadataSettingsService.metadataKeysSettingsApiService, "findSettings")
        .mockImplementationOnce(() => defaultMetadataKeysSettingsDto());

      expect(collection.items[0].isMetadataDecrypted()).toBeTruthy();

      await encryptService.encryptAllFromForeignModels(collection, pgpKeys.ada.passphrase);

      const expectedResult = collection.items[0];

      expect(expectedResult.isMetadataDecrypted()).toBeFalsy();
      expect(expectedResult.metadataKeyType).toEqual(ResourceEntity.METADATA_KEY_TYPE_USER_KEY);
      expect(expectedResult.metadataKeyId).toBeNull();

      await decryptService.decryptOneWithUserKey(expectedResult, pgpKeys.ada.passphrase);

      expect(expectedResult.isMetadataDecrypted()).toBeTruthy();
    });

    it("should encrypt the metadata of a ResourcesEntity with shared metadata key if user is not allowed to use his personal key", async() => {
      expect.assertions(5);

      const resourceEntity = new ResourceEntity(defaultResourceDto({resource_type_id: TEST_RESOURCE_TYPE_V5_DEFAULT}));
      resourceEntity._props.personal = true;
      const collection = new ResourcesCollection([resourceEntity]);
      const metadataKeysSettingsDto = defaultMetadataKeysSettingsDto({allow_usage_of_personal_keys: false, zero_knowledge_key_share: false});
      const metadataKeysDtos = defaultDecryptedSharedMetadataKeysDtos({armored_key: pgpKeys.metadataKey.public});
      const metadataKeys = new MetadataKeysCollection(metadataKeysDtos);

      jest.spyOn(encryptService.getOrFindMetadataKeysService, "getOrFindAll").mockImplementation(() => metadataKeys);
      jest.spyOn(decryptService.getOrFindMetadataKeysService, "getOrFindAll").mockImplementation(() => metadataKeys);
      jest.spyOn(encryptService.getOrFindMetadataSettingsService.findAndUpdateMetadataSettingsLocalStorageService.findMetadataSettingsService.metadataKeysSettingsApiService, "findSettings")
        .mockImplementationOnce(() => metadataKeysSettingsDto);

      expect(collection.items[0].isMetadataDecrypted()).toBeTruthy();

      await encryptService.encryptAllFromForeignModels(collection, pgpKeys.ada.passphrase);

      const expectedResult = collection.items[0];

      expect(expectedResult.isMetadataDecrypted()).toBeFalsy();
      expect(expectedResult.metadataKeyType).toEqual(ResourceEntity.METADATA_KEY_TYPE_METADATA_KEY);
      expect(expectedResult.metadataKeyId).toEqual(metadataKeys.getFirstByLatestCreated().id);

      await decryptService.decryptOneWithSharedKey(expectedResult);

      expect(expectedResult.isMetadataDecrypted()).toBeTruthy();
    });


    it("should throw an error if the metadata is already encrypted", async() => {
      expect.assertions(5);

      const resourceEntity = new ResourceEntity(defaultResourceDto({resource_type_id: TEST_RESOURCE_TYPE_V5_DEFAULT}));
      resourceEntity._props.personal = false;
      const collection = new ResourcesCollection([resourceEntity]);
      const metadataKeysDtos = defaultDecryptedSharedMetadataKeysDtos({armored_key: pgpKeys.metadataKey.public});
      const metadataKeys = new MetadataKeysCollection(metadataKeysDtos);

      jest.spyOn(encryptService.getOrFindMetadataKeysService, "getOrFindAll").mockImplementation(() => metadataKeys);
      jest.spyOn(decryptService.getOrFindMetadataKeysService, "getOrFindAll").mockImplementation(() => metadataKeys);
      jest.spyOn(encryptService.getOrFindMetadataSettingsService.findAndUpdateMetadataSettingsLocalStorageService.findMetadataSettingsService.metadataKeysSettingsApiService, "findSettings")
        .mockImplementationOnce(() => defaultMetadataKeysSettingsDto());

      expect(resourceEntity.isMetadataDecrypted()).toBeTruthy();

      await encryptService.encryptAllFromForeignModels(collection, pgpKeys.ada.passphrase);

      const expectedResult = collection.items[0];

      expect(expectedResult.isMetadataDecrypted()).toBeFalsy();
      expect(expectedResult.metadataKeyType).toEqual(ResourceEntity.METADATA_KEY_TYPE_METADATA_KEY);
      expect(expectedResult.metadataKeyId).toEqual(metadataKeys.getFirstByLatestCreated().id);

      const resourceEntityClone = new ResourceEntity(expectedResult.toDto(ResourceEntity.ALL_CONTAIN_OPTIONS));

      const expectedError = new Error("Unable to encrypt the collection metadata, a resource metadata is already encrypted.");
      await expect(() => encryptService.encryptAllFromForeignModels(new ResourcesCollection([resourceEntityClone]), pgpKeys.ada.passphrase)).rejects.toThrow(expectedError);
    });

    it("should throw an error if no metadata key is found", async() => {
      expect.assertions(1);

      const resourceEntity = new ResourceEntity(defaultResourceDto({resource_type_id: TEST_RESOURCE_TYPE_V5_DEFAULT}));
      resourceEntity._props.personal = false;
      const collection = new ResourcesCollection([resourceEntity]);
      jest.spyOn(encryptService.getOrFindMetadataSettingsService.findAndUpdateMetadataSettingsLocalStorageService.findMetadataSettingsService.metadataKeysSettingsApiService, "findSettings")
        .mockImplementationOnce(() => defaultMetadataKeysSettingsDto());
      jest.spyOn(encryptService.getOrFindMetadataKeysService, "getOrFindAll").mockImplementationOnce(() => new MetadataKeysCollection([]));

      const expectedError = new Error("Unable to encrypt the entity metadata, no metadata key found.");
      await expect(() => encryptService.encryptAllFromForeignModels(collection, pgpKeys.ada.passphrase)).rejects.toThrow(expectedError);
    });

    it("should throw an error if private metadata key is not decrypted", async() => {
      expect.assertions(1);

      const resourceEntity = new ResourceEntity(defaultResourceDto({resource_type_id: TEST_RESOURCE_TYPE_V5_DEFAULT}));
      resourceEntity._props.personal = false;
      const collection = new ResourcesCollection([resourceEntity]);
      const metadataKeysDtos = defaultMinimalMetadataKeysDtos();
      const metadataKeys = new MetadataKeysCollection(metadataKeysDtos);

      jest.spyOn(encryptService.getOrFindMetadataKeysService, "getOrFindAll").mockImplementationOnce(() => metadataKeys);
      jest.spyOn(encryptService.getOrFindMetadataSettingsService.findAndUpdateMetadataSettingsLocalStorageService.findMetadataSettingsService.metadataKeysSettingsApiService, "findSettings")
        .mockImplementationOnce(() => defaultMetadataKeysSettingsDto());

      const expectedError = new Error("Unable to encrypt the entity metadata, metadata private key is not decrypted.");
      await expect(() => encryptService.encryptAllFromForeignModels(collection, pgpKeys.ada.passphrase)).rejects.toThrow(expectedError);
    });

    it("should assert that the entity is of type ResourcesEntity or FoldersEntity", async() => {
      expect.assertions(1);

      const resourceDto = [defaultResourceDto()];

      const expectedError = new Error("The given data type is not a ResourcesCollection or a FoldersCollection");
      await expect(() => encryptService.encryptAllFromForeignModels(resourceDto)).rejects.toThrow(expectedError);
    });

    it("should throw an error if the passphrase can't be found", async() => {
      expect.assertions(1);

      jest.spyOn(encryptService.getOrFindMetadataSettingsService.findAndUpdateMetadataSettingsLocalStorageService.findMetadataSettingsService.metadataKeysSettingsApiService, "findSettings")
        .mockImplementationOnce(() => defaultMetadataKeysSettingsDto());
      const spyOnPassphraseStorage = jest.spyOn(PassphraseStorageService, "get");
      spyOnPassphraseStorage.mockImplementation(() => null);

      const resourceEntity = new ResourceEntity(defaultResourceDto({resource_type_id: TEST_RESOURCE_TYPE_V5_DEFAULT}));
      const collection = new ResourcesCollection([resourceEntity]);

      const expectedError = new UserPassphraseRequiredError();
      await expect(() => encryptService.encryptAllFromForeignModels(collection)).rejects.toThrow(expectedError);
    });
  });
});
