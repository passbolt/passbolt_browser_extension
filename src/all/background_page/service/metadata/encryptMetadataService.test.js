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
import FindMetadataKeysService from "./findMetadataKeysService";
import GetDecryptedUserPrivateKeyService from "../account/getDecryptedUserPrivateKeyService";
import DecryptPrivateKeyService from "../crypto/decryptPrivateKeyService";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("EncryptMetadataService", () => {
  describe("::encryptOneFromForeignModels", () => {
    it("should encrypt the metadata of a ResourcesEntity with shared metadata key", async() => {
      expect.assertions(5);

      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = defaultApiClientOptions();
      const metadataKeysDtos = defaultDecryptedSharedMetadataKeysDtos({armored_key: pgpKeys.metadataKey.public});

      const metadataKeys = new MetadataKeysCollection(metadataKeysDtos);
      const resourceEntity = new ResourceEntity(defaultResourceDto({resource_type_id: TEST_RESOURCE_TYPE_V5_DEFAULT}));
      resourceEntity._props.personal = false;

      const encryptService = new EncryptMetadataService(apiClientOptions, account);
      const decryptService = new DecryptMetadataService(apiClientOptions, account);
      jest.spyOn(FindMetadataKeysService.prototype, "findAllForSessionStorage").mockImplementation(() => metadataKeys);
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

      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = defaultApiClientOptions();

      const resourceEntity = new ResourceEntity(defaultResourceDto({resource_type_id: TEST_RESOURCE_TYPE_V5_DEFAULT}));
      resourceEntity._props.personal = true;

      const encryptService = new EncryptMetadataService(apiClientOptions, account);
      const decryptService = new DecryptMetadataService(apiClientOptions, account);
      const privateKeyDecrypted = await DecryptPrivateKeyService.decryptArmoredKey(account.userPrivateArmoredKey, pgpKeys.ada.passphrase);
      jest.spyOn(GetDecryptedUserPrivateKeyService, "getKey").mockImplementationOnce(async() => privateKeyDecrypted);

      expect(resourceEntity.isMetadataDecrypted()).toBeTruthy();

      await encryptService.encryptOneForForeignModel(resourceEntity, pgpKeys.ada.passphrase);

      expect(resourceEntity.isMetadataDecrypted()).toBeFalsy();
      expect(resourceEntity.metadataKeyType).toEqual(ResourceEntity.METADATA_KEY_TYPE_USER_KEY);
      expect(resourceEntity.metadataKeyId).toBeNull();

      await decryptService.decryptOneWithUserKey(resourceEntity, pgpKeys.ada.passphrase);

      expect(resourceEntity.isMetadataDecrypted()).toBeTruthy();
    });

    it("should throw an error if the metadata is already encrypted", async() => {
      expect.assertions(5);

      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = defaultApiClientOptions();
      const metadataKeysDtos = defaultDecryptedSharedMetadataKeysDtos();

      const metadataKeys = new MetadataKeysCollection(metadataKeysDtos);
      const resourceEntity = new ResourceEntity(defaultResourceDto({resource_type_id: TEST_RESOURCE_TYPE_V5_DEFAULT}));
      resourceEntity._props.personal = false;

      const encryptService = new EncryptMetadataService(apiClientOptions, account);
      jest.spyOn(FindMetadataKeysService.prototype, "findAllForSessionStorage").mockImplementationOnce(() => metadataKeys);

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

      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = defaultApiClientOptions();

      const resourceEntity = new ResourceEntity(defaultResourceDto({resource_type_id: TEST_RESOURCE_TYPE_V5_DEFAULT}));
      resourceEntity._props.personal = false;

      const service = new EncryptMetadataService(apiClientOptions, account);
      jest.spyOn(FindMetadataKeysService.prototype, "findAllForSessionStorage").mockImplementationOnce(() => new MetadataKeysCollection([]));

      const expectedError = new Error("Unable to encrypt the entity metadata, no metadata key found.");
      await expect(() => service.encryptOneForForeignModel(resourceEntity, pgpKeys.ada.passphrase)).rejects.toThrow(expectedError);
    });

    it("should throw an error if private metadata key is not decrypted", async() => {
      expect.assertions(1);

      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = defaultApiClientOptions();
      const metadataKeysDtos = defaultMinimalMetadataKeysDtos();
      const metadataKeys = new MetadataKeysCollection(metadataKeysDtos);
      const resourceEntity = new ResourceEntity(defaultResourceDto({resource_type_id: TEST_RESOURCE_TYPE_V5_DEFAULT}));
      resourceEntity._props.personal = false;

      const service = new EncryptMetadataService(apiClientOptions, account);
      jest.spyOn(FindMetadataKeysService.prototype, "findAllForSessionStorage").mockImplementationOnce(() => metadataKeys);

      const expectedError = new Error("Unable to encrypt the entity metadata, metadata private key is not decrypted.");
      await expect(() => service.encryptOneForForeignModel(resourceEntity, pgpKeys.ada.passphrase)).rejects.toThrow(expectedError);
    });

    it("should assert that the entity is of type ResourcesEntity or FoldersEntity", async() => {
      expect.assertions(1);

      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = defaultApiClientOptions();

      const resourceDto = defaultResourceDto();

      const service = new EncryptMetadataService(apiClientOptions, account);

      const expectedError = new Error("The given data type is not a ResourceEntity or a FolderEntity");
      await expect(() => service.encryptOneForForeignModel(resourceDto)).rejects.toThrow(expectedError);
    });

    it("should throw an error if the passphrase can't be found", async() => {
      expect.assertions(1);

      const spyOnPassphraseStorage = jest.spyOn(PassphraseStorageService, "get");
      spyOnPassphraseStorage.mockImplementation(() => null);

      const resourceEntity = new ResourceEntity(defaultResourceDto({resource_type_id: TEST_RESOURCE_TYPE_V5_DEFAULT}));

      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = defaultApiClientOptions();

      const service = new EncryptMetadataService(apiClientOptions, account);

      const expectedError = new UserPassphraseRequiredError();
      await expect(() => service.encryptOneForForeignModel(resourceEntity)).rejects.toThrow(expectedError);
    });
  });
});
