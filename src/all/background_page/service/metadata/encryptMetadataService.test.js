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
import ResourceTypesCollection from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection";
import {
  resourceTypesCollectionDto
} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection.test.data";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import Keyring from "../../model/keyring";
import passphraseStorageService from "../session_storage/passphraseStorageService";

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
    it("should encrypt the metadata of a ResourcesEntity with shared metadata key, using the passphrase from the session storage", async() => {
      expect.assertions(6);

      const metadataKeysDtos = defaultDecryptedSharedMetadataKeysDtos({armored_key: pgpKeys.metadataKey.public});

      const metadataKeys = new MetadataKeysCollection(metadataKeysDtos);
      const resourceEntity = new ResourceEntity(defaultResourceDto({resource_type_id: TEST_RESOURCE_TYPE_V5_DEFAULT}));
      resourceEntity._props.personal = false;

      jest.spyOn(encryptService.getOrFindMetadataKeysService, "getOrFindAll").mockImplementation(() => metadataKeys);
      jest.spyOn(decryptService.getOrFindMetadataKeysService, "getOrFindAll").mockImplementation(() => metadataKeys);
      jest.spyOn(PassphraseStorageService, "get").mockImplementation(() => pgpKeys.ada.passphrase);

      expect(resourceEntity.isMetadataDecrypted()).toBeTruthy();

      await encryptService.encryptOneForForeignModel(resourceEntity, null);

      expect(passphraseStorageService.get).toHaveBeenCalledTimes(1);
      expect(resourceEntity.isMetadataDecrypted()).toBeFalsy();
      expect(resourceEntity.metadataKeyType).toEqual(ResourceEntity.METADATA_KEY_TYPE_METADATA_KEY);
      expect(resourceEntity.metadataKeyId).toEqual(metadataKeys.getFirstByLatestCreated().id);

      await decryptService.decryptOneWithSharedKey(resourceEntity);

      expect(resourceEntity.isMetadataDecrypted()).toBeTruthy();
    });

    it("should not retrieve the passphrase from the session storage if passed as parameter", async() => {
      expect.assertions(1);

      const metadataKeysDtos = defaultDecryptedSharedMetadataKeysDtos({armored_key: pgpKeys.metadataKey.public});

      const metadataKeys = new MetadataKeysCollection(metadataKeysDtos);
      const resourceEntity = new ResourceEntity(defaultResourceDto({resource_type_id: TEST_RESOURCE_TYPE_V5_DEFAULT}));
      resourceEntity._props.personal = false;

      jest.spyOn(encryptService.getOrFindMetadataKeysService, "getOrFindAll").mockImplementation(() => metadataKeys);
      jest.spyOn(decryptService.getOrFindMetadataKeysService, "getOrFindAll").mockImplementation(() => metadataKeys);
      jest.spyOn(PassphraseStorageService, "get");

      await encryptService.encryptOneForForeignModel(resourceEntity, pgpKeys.ada.passphrase);

      expect(passphraseStorageService.get).not.toHaveBeenCalled();
    });

    it("should encrypt the metadata of a ResourcesEntity with user private key", async() => {
      expect.assertions(6);

      const resourceEntity = new ResourceEntity(defaultResourceDto({resource_type_id: TEST_RESOURCE_TYPE_V5_DEFAULT}));
      resourceEntity._props.personal = true;
      const metadataKeysSettingsDto = defaultMetadataKeysSettingsDto();
      const privateKeyDecrypted = await DecryptPrivateKeyService.decryptArmoredKey(account.userPrivateArmoredKey, pgpKeys.ada.passphrase);
      jest.spyOn(GetDecryptedUserPrivateKeyService, "getKey").mockImplementationOnce(async() => privateKeyDecrypted);
      jest.spyOn(encryptService.getOrFindMetadataSettingsService.findAndUpdateMetadataSettingsLocalStorageService.findMetadataSettingsService.metadataKeysSettingsApiService, "findSettings")
        .mockImplementationOnce(() => metadataKeysSettingsDto);
      jest.spyOn(PassphraseStorageService, "get");

      expect(resourceEntity.isMetadataDecrypted()).toBeTruthy();

      await encryptService.encryptOneForForeignModel(resourceEntity, pgpKeys.ada.passphrase);

      expect(passphraseStorageService.get).not.toHaveBeenCalled();
      expect(resourceEntity.isMetadataDecrypted()).toBeFalsy();
      expect(resourceEntity.metadataKeyType).toEqual(ResourceEntity.METADATA_KEY_TYPE_USER_KEY);
      expect(resourceEntity.metadataKeyId).toBeNull();

      const adasPrivateKeyDecrypted = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      await decryptService.decryptMetadataWithGpgKey(resourceEntity, adasPrivateKeyDecrypted);

      expect(resourceEntity.isMetadataDecrypted()).toBeTruthy();
    });

    it("should encrypt the metadata of a ResourcesEntity with shared metadata key if user is not allowed to use his personal key", async() => {
      expect.assertions(6);

      const metadataKeysDtos = defaultDecryptedSharedMetadataKeysDtos({armored_key: pgpKeys.metadataKey.public});
      const metadataKeys = new MetadataKeysCollection(metadataKeysDtos);
      const resourceEntity = new ResourceEntity(defaultResourceDto({resource_type_id: TEST_RESOURCE_TYPE_V5_DEFAULT}));
      resourceEntity._props.personal = true;
      const metadataKeysSettingsDto = defaultMetadataKeysSettingsDto({allow_usage_of_personal_keys: false, zero_knowledge_key_share: false});

      jest.spyOn(encryptService.getOrFindMetadataKeysService, "getOrFindAll").mockImplementation(() => metadataKeys);
      jest.spyOn(decryptService.getOrFindMetadataKeysService, "getOrFindAll").mockImplementation(() => metadataKeys);
      jest.spyOn(encryptService.getOrFindMetadataSettingsService.findAndUpdateMetadataSettingsLocalStorageService.findMetadataSettingsService.metadataKeysSettingsApiService, "findSettings")
        .mockImplementationOnce(() => metadataKeysSettingsDto);
      jest.spyOn(passphraseStorageService, "get");

      expect(resourceEntity.isMetadataDecrypted()).toBeTruthy();

      await encryptService.encryptOneForForeignModel(resourceEntity, pgpKeys.ada.passphrase);

      expect(passphraseStorageService.get).not.toHaveBeenCalled();
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
    it("should encrypt the metadata of share resources of the collection with the shared metadata key", async() => {
      expect.assertions(5);

      const resourceEntity = new ResourceEntity(defaultResourceDto({resource_type_id: TEST_RESOURCE_TYPE_V5_DEFAULT}));
      resourceEntity._props.personal = false;
      const collection = new ResourcesCollection([resourceEntity]);
      const metadataKeysDtos = defaultDecryptedSharedMetadataKeysDtos({armored_key: pgpKeys.metadataKey.public});
      const metadataKeys = new MetadataKeysCollection(metadataKeysDtos);
      const resourceTypes = new ResourceTypesCollection(resourceTypesCollectionDto());

      jest.spyOn(encryptService.resourceTypesModel, "getOrFindAll").mockImplementation(() => resourceTypes);
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

    it("should not retrieve the passphrase from the session storage is passed as parameter", async() => {
      expect.assertions(1);

      const resourceEntity = new ResourceEntity(defaultResourceDto({resource_type_id: TEST_RESOURCE_TYPE_V5_DEFAULT}));
      resourceEntity._props.personal = false;
      const collection = new ResourcesCollection([resourceEntity]);
      const metadataKeysDtos = defaultDecryptedSharedMetadataKeysDtos({armored_key: pgpKeys.metadataKey.public});
      const metadataKeys = new MetadataKeysCollection(metadataKeysDtos);
      const resourceTypes = new ResourceTypesCollection(resourceTypesCollectionDto());

      jest.spyOn(encryptService.resourceTypesModel, "getOrFindAll").mockImplementation(() => resourceTypes);
      jest.spyOn(encryptService.getOrFindMetadataKeysService, "getOrFindAll").mockImplementation(() => metadataKeys);
      jest.spyOn(decryptService.getOrFindMetadataKeysService, "getOrFindAll").mockImplementation(() => metadataKeys);
      jest.spyOn(PassphraseStorageService, "get");
      jest.spyOn(encryptService.getOrFindMetadataSettingsService.findAndUpdateMetadataSettingsLocalStorageService.findMetadataSettingsService.metadataKeysSettingsApiService, "findSettings")
        .mockImplementationOnce(() => defaultMetadataKeysSettingsDto());

      await encryptService.encryptAllFromForeignModels(collection, pgpKeys.ada.passphrase);

      expect(PassphraseStorageService.get).not.toHaveBeenCalled();
    });

    it("should encrypt the metadata of a personal resource from the collection with user private key", async() => {
      expect.assertions(5);

      const resourceEntity = new ResourceEntity(defaultResourceDto({resource_type_id: TEST_RESOURCE_TYPE_V5_DEFAULT}));
      resourceEntity._props.personal = true;
      const collection = new ResourcesCollection([resourceEntity]);
      const privateKeyDecrypted = await DecryptPrivateKeyService.decryptArmoredKey(account.userPrivateArmoredKey, pgpKeys.ada.passphrase);
      const metadataKeysDtos = defaultDecryptedSharedMetadataKeysDtos({armored_key: pgpKeys.metadataKey.public});
      const metadataKeys = new MetadataKeysCollection(metadataKeysDtos);
      const resourceTypes = new ResourceTypesCollection(resourceTypesCollectionDto());

      const keyring = new Keyring();
      await keyring.importPublic(pgpKeys.ada.public, pgpKeys.ada.userId);

      jest.spyOn(encryptService.resourceTypesModel, "getOrFindAll").mockImplementation(() => resourceTypes);
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

      const adasPrivateKeyDecrypted = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      await decryptService.decryptMetadataWithGpgKey(expectedResult, adasPrivateKeyDecrypted);

      expect(expectedResult.isMetadataDecrypted()).toBeTruthy();
    });

    it("should encrypt the metadata of personal resource of the collection with shared metadata key if users are not allowed to use their personal key", async() => {
      expect.assertions(5);

      const resourceEntity = new ResourceEntity(defaultResourceDto({resource_type_id: TEST_RESOURCE_TYPE_V5_DEFAULT}));
      resourceEntity._props.personal = true;
      const collection = new ResourcesCollection([resourceEntity]);
      const metadataKeysSettingsDto = defaultMetadataKeysSettingsDto({allow_usage_of_personal_keys: false, zero_knowledge_key_share: false});
      const metadataKeysDtos = defaultDecryptedSharedMetadataKeysDtos({armored_key: pgpKeys.metadataKey.public});
      const metadataKeys = new MetadataKeysCollection(metadataKeysDtos);
      const resourceTypes = new ResourceTypesCollection(resourceTypesCollectionDto());

      jest.spyOn(encryptService.resourceTypesModel, "getOrFindAll").mockImplementation(() => resourceTypes);
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

    it("should ignore resources of type v4 and not trigger any metadata relative process such as requesting the metadata keys settings", async() => {
      expect.assertions(7);
      const personalResourceEntity = new ResourceEntity(defaultResourceDto({personal: true}));
      const sharedResourceEntity = new ResourceEntity(defaultResourceDto({personal: false}));
      const collection = new ResourcesCollection([personalResourceEntity, sharedResourceEntity]);
      const resourceTypes = new ResourceTypesCollection(resourceTypesCollectionDto());

      jest.spyOn(encryptService.resourceTypesModel, "getOrFindAll").mockImplementation(() => resourceTypes);
      jest.spyOn(encryptService.getOrFindMetadataKeysService, "getOrFindAll");
      jest.spyOn(PassphraseStorageService, "get");
      jest.spyOn(encryptService.getOrFindMetadataSettingsService.findAndUpdateMetadataSettingsLocalStorageService.findMetadataSettingsService.metadataKeysSettingsApiService, "findSettings");

      expect(collection.items[0].isMetadataDecrypted()).toBeTruthy();

      await encryptService.encryptAllFromForeignModels(collection);

      const expectedResult = collection.items[0];

      expect(encryptService.getOrFindMetadataKeysService.getOrFindAll).not.toHaveBeenCalled();
      expect(PassphraseStorageService.get).not.toHaveBeenCalled();
      expect(encryptService.getOrFindMetadataSettingsService.findAndUpdateMetadataSettingsLocalStorageService.findMetadataSettingsService.metadataKeysSettingsApiService.findSettings)
        .not.toHaveBeenCalled();
      expect(expectedResult.isMetadataDecrypted()).toBeTruthy();
      expect(expectedResult.metadataKeyType).toBeNull();
      expect(expectedResult.metadataKeyId).toBeNull();
    });

    it("should encrypt the metadata of a ResourcesEntity for personal and shared resources, and should also ignore v4 resource types if any", async() => {
      expect.assertions(4);

      const personV5ResourceEntity = new ResourceEntity(defaultResourceDto({resource_type_id: TEST_RESOURCE_TYPE_V5_DEFAULT, personal: true}));
      const sharedV5ResourceEntity = new ResourceEntity(defaultResourceDto({resource_type_id: TEST_RESOURCE_TYPE_V5_DEFAULT, personal: false}));
      const personalv4ResourceEntity = new ResourceEntity(defaultResourceDto({personal: true}));
      const sharedv4ResourceEntity = new ResourceEntity(defaultResourceDto({personal: false}));
      const collection = new ResourcesCollection([personV5ResourceEntity, sharedV5ResourceEntity, personalv4ResourceEntity, sharedv4ResourceEntity]);
      const privateKeyDecrypted = await DecryptPrivateKeyService.decryptArmoredKey(account.userPrivateArmoredKey, pgpKeys.ada.passphrase);
      const metadataKeysDtos = defaultDecryptedSharedMetadataKeysDtos({armored_key: pgpKeys.metadataKey.public});
      const metadataKeys = new MetadataKeysCollection(metadataKeysDtos);
      const resourceTypes = new ResourceTypesCollection(resourceTypesCollectionDto());

      jest.spyOn(encryptService.resourceTypesModel, "getOrFindAll").mockImplementation(() => resourceTypes);
      jest.spyOn(encryptService.getOrFindMetadataKeysService, "getOrFindAll").mockImplementation(() => metadataKeys);
      jest.spyOn(decryptService.getOrFindMetadataKeysService, "getOrFindAll").mockImplementation(() => metadataKeys);
      jest.spyOn(GetDecryptedUserPrivateKeyService, "getKey").mockImplementationOnce(async() => privateKeyDecrypted);
      jest.spyOn(encryptService.getOrFindMetadataSettingsService.findAndUpdateMetadataSettingsLocalStorageService.findMetadataSettingsService.metadataKeysSettingsApiService, "findSettings")
        .mockImplementationOnce(() => defaultMetadataKeysSettingsDto());

      const keyring = new Keyring();
      await keyring.importPublic(pgpKeys.ada.public, pgpKeys.ada.userId);

      await encryptService.encryptAllFromForeignModels(collection, pgpKeys.ada.passphrase);

      expect(collection.items[0].isMetadataDecrypted()).toBeFalsy();
      expect(collection.items[1].isMetadataDecrypted()).toBeFalsy();
      expect(collection.items[2].isMetadataDecrypted()).toBeTruthy();
      expect(collection.items[3].isMetadataDecrypted()).toBeTruthy();
    });

    it("should throw an error if the metadata is already encrypted", async() => {
      expect.assertions(5);

      const resourceEntity = new ResourceEntity(defaultResourceDto({resource_type_id: TEST_RESOURCE_TYPE_V5_DEFAULT}));
      resourceEntity._props.personal = false;
      const collection = new ResourcesCollection([resourceEntity]);
      const metadataKeysDtos = defaultDecryptedSharedMetadataKeysDtos({armored_key: pgpKeys.metadataKey.public});
      const metadataKeys = new MetadataKeysCollection(metadataKeysDtos);
      const resourceTypes = new ResourceTypesCollection(resourceTypesCollectionDto());

      jest.spyOn(encryptService.resourceTypesModel, "getOrFindAll").mockImplementation(() => resourceTypes);
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
      const resourceTypes = new ResourceTypesCollection(resourceTypesCollectionDto());

      jest.spyOn(encryptService.resourceTypesModel, "getOrFindAll").mockImplementation(() => resourceTypes);
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
      const resourceTypes = new ResourceTypesCollection(resourceTypesCollectionDto());

      jest.spyOn(encryptService.resourceTypesModel, "getOrFindAll").mockImplementation(() => resourceTypes);
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
      const resourceTypes = new ResourceTypesCollection(resourceTypesCollectionDto());

      jest.spyOn(encryptService.resourceTypesModel, "getOrFindAll").mockImplementation(() => resourceTypes);
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
