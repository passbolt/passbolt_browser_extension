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
 * @since         5.5.0
 */

import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import MockExtension from "../../../../../test/mocks/mockExtension";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import BuildApiClientOptionsService from "../account/buildApiClientOptionsService";
import CreateMetadataPrivateKeysForServerAndUsersService from "./createMetadataPrivateKeysForServerAndUsersService";
import RoleEntity from "passbolt-styleguide/src/shared/models/entity/role/roleEntity";
import MetadataKeysCollection from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysCollection";
import Keyring from "../../model/keyring";
import {enableFetchMocks} from "jest-fetch-mock";
import UserLocalStorage from "../local_storage/userLocalStorage";
import {defaultMetadataKeysSettingsDto} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysSettingsEntity.test.data";
import {defaultMetadataKeyDto, metadataKeyWithSignedMetadataPrivateKeyDataDto} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeyEntity.test.data";
import {v4 as uuidv4} from "uuid";
import {decryptedMetadataPrivateKeyDto} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataPrivateKeyEntity.test.data";
import ShareMetadataPrivateKeysCollection from "passbolt-styleguide/src/shared/models/entity/metadata/shareMetadataPrivateKeysCollection";
import MetadataKeysSettingsEntity
  from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysSettingsEntity";
import {defaultUserDto} from "passbolt-styleguide/src/shared/models/entity/user/userEntity.test.data";
import UsersCollection from "../../model/entity/user/usersCollection";

describe("CreateMetadataPrivateKeysForServerAndUsersService", () => {
  let account, apiClientOptions, service, keyring;
  beforeEach(async() => {
    jest.clearAllMocks();
    enableFetchMocks();
    fetch.resetMocks();
    account = new AccountEntity(defaultAccountDto({
      role_name: RoleEntity.ROLE_ADMIN
    }));
    await MockExtension.withConfiguredAccount();
    apiClientOptions = BuildApiClientOptionsService.buildFromAccount(account);
    service = new CreateMetadataPrivateKeysForServerAndUsersService(account, apiClientOptions);
    keyring = new Keyring();
    await keyring.importPublic(pgpKeys.ada.public, pgpKeys.ada.userId);
    await keyring.importPublic(pgpKeys.betty.public, pgpKeys.betty.userId);
    jest.spyOn(service.keyring, "sync").mockImplementation(jest.fn());
    await UserLocalStorage.flush();
  });

  describe('::createPrivateKeys', () => {
    it("should assert metadata key settings parameter.", async() => {
      expect.assertions(1);

      await expect(() => service.createPrivateKeys({})).rejects.toThrow("The parameter 'metadataKeysSettings' should be a MetadataKeysSettingsEntity");
    });

    it("should assert passphrase parameter.", async() => {
      expect.assertions(1);

      await expect(() => service.createPrivateKeys(new MetadataKeysSettingsEntity(defaultMetadataKeysSettingsDto()), 2)).rejects.toThrow('The parameter "passphrase" should be a string.');
    });

    it("should throw if user is not an administrator.", async() => {
      expect.assertions(1);

      account = new AccountEntity(defaultAccountDto());
      service = new CreateMetadataPrivateKeysForServerAndUsersService(account, apiClientOptions);

      await expect(() => service.createPrivateKeys(new MetadataKeysSettingsEntity(defaultMetadataKeysSettingsDto()), pgpKeys.ada.passphrase)).rejects.toThrow('This action can only be performed by an administrator.');
    });

    it("should build metadata private keys for users having missing keys and for the server and sign the missing data keys signed by the current administrator", async() => {
      expect.assertions(7);
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

      jest.spyOn(service.findAndUpdateMetadataKeysSessionStorageService, "findAndUpdateAll").mockImplementationOnce(() => metadataKeys);
      jest.spyOn(service.findUsersService, "findAllActiveWithMissingKeys").mockImplementationOnce(() => usersCollection);
      jest.spyOn(service.metadataPrivateKeyApiService, "create").mockImplementation(metadataPrivateKeyCollection => {
        for (const metadataPrivateKey of metadataPrivateKeyCollection) {
          const expectedMetadataPrivateKey = expectedMetadataPrivateKeys.find(expectedMetadataPrivateKey => metadataPrivateKey.metadataKeyId === expectedMetadataPrivateKey.metadataKeyId);
          expectedMetadataPrivateKey.data = metadataPrivateKey.data;
        }
      });
      jest.spyOn(service.encryptMetadataPrivateKeysService, "encryptOne");

      const settings = new MetadataKeysSettingsEntity(defaultMetadataKeysSettingsDto());

      await service.createPrivateKeys(settings, pgpKeys.ada.passphrase);

      expect(service.encryptMetadataPrivateKeysService.encryptOne).toHaveBeenCalledTimes(4);
      expect(service.metadataPrivateKeyApiService.create).toHaveBeenCalledWith(new ShareMetadataPrivateKeysCollection([expectedMetadataPrivateKeys[0], expectedMetadataPrivateKeys[1]]));
      expect(settings.metadataPrivateKeys.hasDecryptedPrivateKeys()).toBeFalsy();
      expect(settings.metadataPrivateKeys.items[0].metadataKeyId).toStrictEqual(expectedMetadataPrivateKeys[2].metadataKeyId);
      expect(settings.metadataPrivateKeys.items[0].userId).toStrictEqual(null);
      expect(settings.metadataPrivateKeys.items[1].metadataKeyId).toStrictEqual(expectedMetadataPrivateKeys[1].metadataKeyId);
      expect(settings.metadataPrivateKeys.items[1].userId).toStrictEqual(null);
    });
  });
});
