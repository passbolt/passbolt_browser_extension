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
 * @since         4.11.0
 */

import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import SaveMetadataSettingsService from "./saveMetadataSettingsService";
import MetadataTypesSettingsEntity
  from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTypesSettingsEntity";
import {
  defaultMetadataTypesSettingsV4Dto,
  defaultMetadataTypesSettingsV50FreshDto
} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTypesSettingsEntity.test.data";
import {
  defaultMetadataKeysSettingsDto
} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysSettingsEntity.test.data";
import MetadataKeysSettingsEntity
  from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysSettingsEntity";
import UsersCollection from "../../model/entity/user/usersCollection";
import {defaultMetadataKeyDto, metadataKeyWithSignedMetadataPrivateKeyDataDto} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeyEntity.test.data";
import {v4 as uuidv4} from "uuid";
import {decryptedMetadataPrivateKeyDto} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataPrivateKeyEntity.test.data";
import ShareMetadataPrivateKeysCollection from "passbolt-styleguide/src/shared/models/entity/metadata/shareMetadataPrivateKeysCollection";
import {defaultUserDto} from "passbolt-styleguide/src/shared/models/entity/user/userEntity.test.data";
import MetadataKeysCollection from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysCollection";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import RoleEntity from "passbolt-styleguide/src/shared/models/entity/role/roleEntity";
import Keyring from "../../model/keyring";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("SaveMetadataSettingsService", () => {
  let saveMetadataSettingsService, account, apiClientOptions, keyring;

  beforeEach(async() => {
    account = new AccountEntity(defaultAccountDto({
      role_name: RoleEntity.ROLE_ADMIN
    }));
    apiClientOptions = defaultApiClientOptions();
    saveMetadataSettingsService = new SaveMetadataSettingsService(account, apiClientOptions);
    keyring = new Keyring();
    await keyring.importPublic(pgpKeys.ada.public, pgpKeys.ada.userId);
    await keyring.importPublic(pgpKeys.betty.public, pgpKeys.betty.userId);
    jest.spyOn(saveMetadataSettingsService.shareMetadataKeyPrivateService.keyring, "sync").mockImplementation(jest.fn());
    // flush account related storages before each test.
    await saveMetadataSettingsService.metadataTypesSettingsLocalStorage.flush();
  });

  describe("::saveTypesSettings", () => {
    it("saves the metadata types settings to the API and store them into the local storage.", async() => {
      expect.assertions(3);
      const metadataTypesSettingsDto = defaultMetadataTypesSettingsV50FreshDto();
      const metadataTypesSettings = new MetadataTypesSettingsEntity(metadataTypesSettingsDto);

      jest.spyOn(saveMetadataSettingsService.metadataTypesSettingsApiService, "save")
        .mockImplementation(settings => settings);

      const savedSettings = await saveMetadataSettingsService.saveTypesSettings(metadataTypesSettings);

      expect(saveMetadataSettingsService.metadataTypesSettingsApiService.save).toHaveBeenCalledWith(metadataTypesSettings);
      expect(savedSettings.toDto()).toEqual(metadataTypesSettingsDto);
      const storageValue = await saveMetadataSettingsService.metadataTypesSettingsLocalStorage.get();
      await expect(storageValue).toEqual(metadataTypesSettingsDto);
    });

    it("saves the metadata types settings to the API and replace existing settings already stored in the local storage.", async() => {
      expect.assertions(3);
      const metadataTypesSettingsDto = defaultMetadataTypesSettingsV50FreshDto();
      const metadataTypesSettings = new MetadataTypesSettingsEntity(metadataTypesSettingsDto);
      const originalMetadataTypesSettingsDto = defaultMetadataTypesSettingsV4Dto();
      await saveMetadataSettingsService.metadataTypesSettingsLocalStorage.set(new MetadataTypesSettingsEntity(originalMetadataTypesSettingsDto));

      jest.spyOn(saveMetadataSettingsService.metadataTypesSettingsApiService, "save")
        .mockImplementation(settings => settings);

      const savedSettings = await saveMetadataSettingsService.saveTypesSettings(metadataTypesSettings);

      expect(saveMetadataSettingsService.metadataTypesSettingsApiService.save).toHaveBeenCalledWith(metadataTypesSettings);
      expect(savedSettings.toDto()).toEqual(metadataTypesSettingsDto);
      const storageValue = await saveMetadataSettingsService.metadataTypesSettingsLocalStorage.get();
      await expect(storageValue).toEqual(metadataTypesSettingsDto);
    });

    it("throws if the given metadata types settings is not of type MetadataTypesSettingsEntity.", async() => {
      expect.assertions(1);
      await expect(() => saveMetadataSettingsService.saveTypesSettings(42)).rejects.toThrow(TypeError);
    });

    it("throws if API return invalid settings.", async() => {
      expect.assertions(1);

      const metadataTypesSettingsDto = defaultMetadataTypesSettingsV50FreshDto();
      const metadataTypesSettings = new MetadataTypesSettingsEntity(metadataTypesSettingsDto);

      jest.spyOn(saveMetadataSettingsService.metadataTypesSettingsApiService, "save")
        .mockImplementation(() => {});

      await expect(() => saveMetadataSettingsService.saveTypesSettings(metadataTypesSettings))
        .toThrowEntityValidationError("default_resource_types", "required");
    });
  });

  describe("::saveKeysSettings", () => {
    it("saves the metadata keys settings to the API and store them into the local storage.", async() => {
      expect.assertions(3);
      const metadataKeysSettingsDto = defaultMetadataKeysSettingsDto();
      const metadataKeysSettings = new MetadataKeysSettingsEntity(metadataKeysSettingsDto);

      jest.spyOn(saveMetadataSettingsService.findMetadataSettingsService.metadataKeysSettingsApiService, "findSettings").mockImplementation(() => defaultMetadataKeysSettingsDto());
      jest.spyOn(saveMetadataSettingsService.metadataKeysSettingsApiService, "save")
        .mockImplementation(settings => settings);

      const savedSettings = await saveMetadataSettingsService.saveKeysSettings(metadataKeysSettings, pgpKeys.ada.passphrase);

      expect(saveMetadataSettingsService.metadataKeysSettingsApiService.save).toHaveBeenCalledWith(metadataKeysSettings);
      expect(savedSettings.toDto()).toEqual(metadataKeysSettingsDto);
      const storageValue = await saveMetadataSettingsService.metadataKeysSettingsLocalStorage.get();
      await expect(storageValue).toEqual(metadataKeysSettingsDto);
    });

    it("saves the metadata keys settings to the API and replace existing settings already stored in the local storage.", async() => {
      expect.assertions(3);
      const metadataKeysSettingsDto = defaultMetadataKeysSettingsDto();
      const metadataKeysSettings = new MetadataKeysSettingsEntity(metadataKeysSettingsDto);
      const originalMetadataKeysSettingsDto = defaultMetadataKeysSettingsDto({zero_knowledge_key_share: true});
      await saveMetadataSettingsService.metadataKeysSettingsLocalStorage.set(new MetadataKeysSettingsEntity(originalMetadataKeysSettingsDto));

      jest.spyOn(saveMetadataSettingsService.findMetadataSettingsService.metadataKeysSettingsApiService, "findSettings").mockImplementation(() => defaultMetadataKeysSettingsDto());
      jest.spyOn(saveMetadataSettingsService.metadataKeysSettingsApiService, "save")
        .mockImplementation(settings => settings);

      const savedSettings = await saveMetadataSettingsService.saveKeysSettings(metadataKeysSettings, pgpKeys.ada.passphrase);

      expect(saveMetadataSettingsService.metadataKeysSettingsApiService.save).toHaveBeenCalledWith(metadataKeysSettings);
      expect(savedSettings.toDto()).toEqual(metadataKeysSettingsDto);
      const storageValue = await saveMetadataSettingsService.metadataKeysSettingsLocalStorage.get();
      await expect(storageValue).toEqual(metadataKeysSettingsDto);
    });

    it("should build metadata private keys for users having missing keys and for the server and sign the missing data keys signed by the current administrator", async() => {
      expect.assertions(10);
      const metadataKeyId = uuidv4();
      const metadataPrivateKeyNotSigned = decryptedMetadataPrivateKeyDto({
        metadata_key_id: metadataKeyId,
      });

      const metadataKeys = new MetadataKeysCollection([metadataKeyWithSignedMetadataPrivateKeyDataDto(), defaultMetadataKeyDto({id: metadataKeyId, metadata_private_keys: [metadataPrivateKeyNotSigned]})]);

      const missingMetadataKeysIds = [metadataKeyId];

      const user1 = defaultUserDto({
        id: pgpKeys.betty.userId,
        username: "user1@passbolt.com",
        missing_metadata_key_ids: missingMetadataKeysIds
      });
      const user2 = defaultUserDto({
        username: "user2@passbolt.com",
        missing_metadata_key_ids: []
      });
      const usersCollection = new UsersCollection([user1, user2]);

      const expectedMetadataPrivateKeys = [];
      expectedMetadataPrivateKeys.push(metadataKeys.items[0].metadataPrivateKeys.items[0].cloneForSharing(user1.id));
      expectedMetadataPrivateKeys.push(metadataKeys.items[1].metadataPrivateKeys.items[0].cloneForSharing(user1.id));
      expectedMetadataPrivateKeys.push(metadataKeys.items[0].metadataPrivateKeys.items[0].cloneForSharing(null));
      expectedMetadataPrivateKeys.push(metadataKeys.items[1].metadataPrivateKeys.items[0].cloneForSharing(null));

      jest.spyOn(saveMetadataSettingsService.findAndUpdateMetadataKeysSessionStorageService, "findAndUpdateAll").mockImplementationOnce(() => metadataKeys);
      jest.spyOn(saveMetadataSettingsService.shareMetadataKeyPrivateService.getOrFindMetadataKeysService, "getOrFindAll").mockImplementationOnce(() => metadataKeys);
      jest.spyOn(saveMetadataSettingsService.shareMetadataKeyPrivateService.findUsersService, "findAllActiveWithMissingKeys").mockImplementationOnce(() => usersCollection);
      jest.spyOn(saveMetadataSettingsService.shareMetadataKeyPrivateService.metadataPrivateKeyApiService, "create").mockImplementation(metadataPrivateKeyCollection => {
        for (const metadataPrivateKey of metadataPrivateKeyCollection) {
          const expectedMetadataPrivateKey = expectedMetadataPrivateKeys.find(expectedMetadataPrivateKey => metadataPrivateKey.metadataKeyId === expectedMetadataPrivateKey.metadataKeyId);
          expectedMetadataPrivateKey.data = metadataPrivateKey.data;
        }
      });
      jest.spyOn(saveMetadataSettingsService.encryptMetadataPrivateKeysService, "encryptOne");
      jest.spyOn(saveMetadataSettingsService.shareMetadataKeyPrivateService.encryptMetadataPrivateKeysService, "encryptOne");
      jest.spyOn(saveMetadataSettingsService.shareMetadataKeyPrivateService, "shareAllMissing");
      jest.spyOn(saveMetadataSettingsService.findMetadataSettingsService.metadataKeysSettingsApiService, "findSettings").mockImplementation(() => defaultMetadataKeysSettingsDto({zero_knowledge_key_share: true}));
      jest.spyOn(saveMetadataSettingsService.metadataKeysSettingsApiService, "save")
        .mockImplementation(settings => settings);

      const settings = new MetadataKeysSettingsEntity(defaultMetadataKeysSettingsDto());

      await saveMetadataSettingsService.saveKeysSettings(settings, pgpKeys.ada.passphrase);

      expect(saveMetadataSettingsService.encryptMetadataPrivateKeysService.encryptOne).toHaveBeenCalledTimes(2);
      expect(saveMetadataSettingsService.shareMetadataKeyPrivateService.encryptMetadataPrivateKeysService.encryptOne).toHaveBeenCalledTimes(2);
      expect(saveMetadataSettingsService.shareMetadataKeyPrivateService.metadataPrivateKeyApiService.create).toHaveBeenCalledWith(new ShareMetadataPrivateKeysCollection([expectedMetadataPrivateKeys[0], expectedMetadataPrivateKeys[1]]));
      expect(saveMetadataSettingsService.shareMetadataKeyPrivateService.shareAllMissing).toHaveBeenNthCalledWith(1, pgpKeys.ada.passphrase);
      expect(settings.metadataPrivateKeys.hasDecryptedPrivateKeys()).toBeFalsy();
      expect(settings.metadataPrivateKeys.items[0].metadataKeyId).toStrictEqual(expectedMetadataPrivateKeys[2].metadataKeyId);
      expect(settings.metadataPrivateKeys.items[0].userId).toStrictEqual(null);
      expect(settings.metadataPrivateKeys.items[1].metadataKeyId).toStrictEqual(expectedMetadataPrivateKeys[1].metadataKeyId);
      expect(settings.metadataPrivateKeys.items[1].userId).toStrictEqual(null);
      expect(await saveMetadataSettingsService.metadataKeysSettingsLocalStorage.get()).toStrictEqual(settings.toDto());
    });

    it("throws if the given metadata keys settings is not of type MetadataKeysSettingsEntity.", async() => {
      expect.assertions(1);
      await expect(() => saveMetadataSettingsService.saveKeysSettings(42)).rejects.toThrow(TypeError);
    });

    it("throws if the given passphrase is not a string.", async() => {
      expect.assertions(1);

      await expect(() => saveMetadataSettingsService.saveKeysSettings(new MetadataKeysSettingsEntity(defaultMetadataKeysSettingsDto()), 2)).rejects.toThrow('The parameter "passphrase" should be a string.');
    });

    it("throws if API return invalid settings.", async() => {
      expect.assertions(1);

      const metadataKeysSettingsDto = defaultMetadataKeysSettingsDto();
      const metadataKeysSettings = new MetadataKeysSettingsEntity(metadataKeysSettingsDto);

      jest.spyOn(saveMetadataSettingsService.findMetadataSettingsService.metadataKeysSettingsApiService, "findSettings").mockImplementation(() => defaultMetadataKeysSettingsDto());


      jest.spyOn(saveMetadataSettingsService.metadataKeysSettingsApiService, "save")
        .mockImplementation(() => {});

      await expect(() => saveMetadataSettingsService.saveKeysSettings(metadataKeysSettings, pgpKeys.ada.passphrase))
        .toThrowEntityValidationError("allow_usage_of_personal_keys", "required");
    });
  });
});
