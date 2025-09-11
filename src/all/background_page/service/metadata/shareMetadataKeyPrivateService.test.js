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
 * @since         5.1.1
 */

import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import MockExtension from "../../../../../test/mocks/mockExtension";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import BuildApiClientOptionsService from "../account/buildApiClientOptionsService";
import ShareMetadataKeyPrivateService from "./shareMetadataKeyPrivateService";
import {metadataKeysNotSignedByCurrentDto, metadataKeysSignedByCurrentDto, usersWithMissingMetadataKeysDto, usersWithoutMissingMetadataKeysDto} from "./shareMetadataKeyPrivateService.test.data";
import RoleEntity from "passbolt-styleguide/src/shared/models/entity/role/roleEntity";
import UsersCollection from "../../model/entity/user/usersCollection";
import MetadataKeysCollection from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysCollection";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import Keyring from "../../model/keyring";
import {enableFetchMocks} from "jest-fetch-mock";
import DecryptMessageService from "../crypto/decryptMessageService";
import FindSignatureService from "../crypto/findSignatureService";
import UserLocalStorage from "../local_storage/userLocalStorage";

describe("ShareMetadataKeyPrivateService", () => {
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
    service = new ShareMetadataKeyPrivateService(account, apiClientOptions);
    keyring = new Keyring();
    await keyring.importPublic(pgpKeys.ada.public, pgpKeys.ada.userId);
    await keyring.importPublic(pgpKeys.betty.public, pgpKeys.betty.userId);
    jest.spyOn(service.keyring, "sync").mockImplementation(jest.fn());
    await UserLocalStorage.flush();
  });

  describe('::shareOneMissing', () => {
    it("should assert userId parameter.", async() => {
      expect.assertions(1);

      await expect(() => service.shareOneMissing(1)).rejects.toThrow("The user id should be a valid uuid.");
    });

    it("should assert passphrase parameter.", async() => {
      expect.assertions(1);

      await expect(() => service.shareOneMissing(pgpKeys.betty.userId, 2)).rejects.toThrow('The parameter "passphrase" should be a string.');
    });

    it("should throw if user is not an administrator.", async() => {
      expect.assertions(1);

      account = new AccountEntity(defaultAccountDto());
      service = new ShareMetadataKeyPrivateService(account, apiClientOptions);

      await expect(() => service.shareOneMissing(pgpKeys.betty.userId, pgpKeys.ada.passphrase)).rejects.toThrow('This action can only be performed by an administrator.');
    });

    it("should return if the targeted user does not have missing metadata keys", async() => {
      expect.assertions(1);

      const users = new UsersCollection(usersWithoutMissingMetadataKeysDto());
      jest.spyOn(service.userModel, "getOrFindAll").mockImplementationOnce(() => users);
      jest.spyOn(service.getOrFindMetadataKeysService, "getOrFindAll");

      await service.shareOneMissing(pgpKeys.betty.userId, pgpKeys.ada.passphrase);

      await expect(service.getOrFindMetadataKeysService.getOrFindAll).not.toHaveBeenCalled();
    });

    it("should share and sign the missing data keys signed by the current administrator", async() => {
      expect.assertions(8);
      const decryptedPrivateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      const recipientPrivateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted);

      const metadataKeys = new MetadataKeysCollection(metadataKeysSignedByCurrentDto());
      const missingMetadataKeysIds = [metadataKeys.items[0].id];
      const users = new UsersCollection(usersWithMissingMetadataKeysDto({
        missingMetadataKeysIds
      }));

      const expectedSharedMetadataPrivateKey = await metadataKeys.items[0].metadataPrivateKeys.items[0].cloneForSharing(users.items[0].id);
      await UserLocalStorage.set(users);
      jest.spyOn(service.getOrFindMetadataKeysService, "getOrFindAll").mockImplementationOnce(() => metadataKeys);
      jest.spyOn(service.metadataPrivateKeyApiService, "create").mockImplementationOnce(async encryptedMetadataPrivateKeys => {
        expect(encryptedMetadataPrivateKeys.items.length).toEqual(1);

        const metadataPrivateKeyEntity = encryptedMetadataPrivateKeys.items[0];
        const messageEncrypted = await OpenpgpAssertion.readMessageOrFail(metadataPrivateKeyEntity.data);
        const decryptResult = await DecryptMessageService.decrypt(messageEncrypted, recipientPrivateKey, [decryptedPrivateKey], {returnOnlyData: false});
        const signature = await FindSignatureService.findSignatureForGpgKey(decryptResult.signatures, decryptedPrivateKey);

        expect(metadataPrivateKeyEntity.userId).toEqual(expectedSharedMetadataPrivateKey.userId);
        expect(metadataPrivateKeyEntity.metadataKeyId).toEqual(expectedSharedMetadataPrivateKey.metadataKeyId);
        expect(JSON.parse(decryptResult.data)).toEqual(expectedSharedMetadataPrivateKey.data.toDto());
        expect(signature.isVerified).toBeTruthy();
      });
      jest.spyOn(service.encryptMetadataPrivateKeysService, "encryptOne");

      await service.shareOneMissing(pgpKeys.betty.userId, pgpKeys.ada.passphrase);

      const user = await UserLocalStorage.getUserById(pgpKeys.betty.userId);

      expect(user.missing_metadata_key_ids).toEqual([]);
      expect(service.metadataPrivateKeyApiService.create).toHaveBeenCalled();
      expect(service.encryptMetadataPrivateKeysService.encryptOne).toHaveBeenCalledTimes(1);
    });


    it("should share and not sign the missing data keys if the current administrator is not signator", async() => {
      expect.assertions(8);
      const decryptedPrivateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      const recipientPrivateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted);

      const metadataKeys = new MetadataKeysCollection(metadataKeysNotSignedByCurrentDto());
      const missingMetadataKeysIds = [metadataKeys.items[0].id];
      const users = new UsersCollection(usersWithMissingMetadataKeysDto({
        missingMetadataKeysIds
      }));

      const expectedSharedMetadataPrivateKey = await metadataKeys.items[0].metadataPrivateKeys.items[0].cloneForSharing(users.items[0].id);
      await UserLocalStorage.set(users);
      jest.spyOn(service.getOrFindMetadataKeysService, "getOrFindAll").mockImplementationOnce(() => metadataKeys);
      jest.spyOn(service.metadataPrivateKeyApiService, "create").mockImplementationOnce(async encryptedMetadataPrivateKeys => {
        expect(encryptedMetadataPrivateKeys.items.length).toEqual(1);

        const metadataPrivateKeyEntity = encryptedMetadataPrivateKeys.items[0];
        const messageEncrypted = await OpenpgpAssertion.readMessageOrFail(metadataPrivateKeyEntity.data);
        const decryptResult = await DecryptMessageService.decrypt(messageEncrypted, recipientPrivateKey, [decryptedPrivateKey], {returnOnlyData: false, throwOnInvalidSignaturesVerification: false});
        const signature = await FindSignatureService.findSignatureForGpgKey(decryptResult.signatures, decryptedPrivateKey);

        expect(metadataPrivateKeyEntity.userId).toEqual(expectedSharedMetadataPrivateKey.userId);
        expect(metadataPrivateKeyEntity.metadataKeyId).toEqual(expectedSharedMetadataPrivateKey.metadataKeyId);
        expect(JSON.parse(decryptResult.data)).toEqual(expectedSharedMetadataPrivateKey.data.toDto());
        expect(signature).toBe(null);
      });
      jest.spyOn(service.encryptMetadataPrivateKeysService, "encryptOne");

      await service.shareOneMissing(pgpKeys.betty.userId, pgpKeys.ada.passphrase);
      const user = await UserLocalStorage.getUserById(pgpKeys.betty.userId);

      expect(user.missing_metadata_key_ids).toEqual([]);
      expect(service.metadataPrivateKeyApiService.create).toHaveBeenCalled();
      expect(service.encryptMetadataPrivateKeysService.encryptOne).toHaveBeenCalledTimes(1);
    });

    it("should return if the current administrator cannot share the missing keys", async() => {
      expect.assertions(2);

      const metadataKeys = new MetadataKeysCollection([]);
      const users = new UsersCollection(usersWithMissingMetadataKeysDto());

      await UserLocalStorage.set(users);
      jest.spyOn(service.getOrFindMetadataKeysService, "getOrFindAll").mockImplementationOnce(() => metadataKeys);
      jest.spyOn(service.metadataPrivateKeyApiService, "create");

      await service.shareOneMissing(pgpKeys.betty.userId, pgpKeys.ada.passphrase);
      const user = await UserLocalStorage.getUserById(pgpKeys.betty.userId);

      expect(user.missing_metadata_key_ids.length).toEqual(1);
      await expect(service.metadataPrivateKeyApiService.create).not.toHaveBeenCalled();
    });
  });

  describe('::shareAllMissing', () => {
    it("should assert passphrase parameter.", async() => {
      expect.assertions(1);

      await expect(() => service.shareAllMissing(2)).rejects.toThrow('The parameter "passphrase" should be a string.');
    });

    it("should throw if user is not an administrator.", async() => {
      expect.assertions(1);

      account = new AccountEntity(defaultAccountDto());
      service = new ShareMetadataKeyPrivateService(account, apiClientOptions);

      await expect(() => service.shareAllMissing(pgpKeys.betty.userId, pgpKeys.ada.passphrase)).rejects.toThrow('This action can only be performed by an administrator.');
    });

    it("should return if the targeted user does not have missing metadata keys", async() => {
      expect.assertions(1);

      const users = new UsersCollection(usersWithoutMissingMetadataKeysDto());
      jest.spyOn(service.findUsersService, "findAll").mockImplementationOnce(() => users);
      jest.spyOn(service.getOrFindMetadataKeysService, "getOrFindAll");

      await service.shareAllMissing(pgpKeys.ada.passphrase);

      await expect(service.getOrFindMetadataKeysService.getOrFindAll).not.toHaveBeenCalled();
    });

    it("should share and sign the missing data keys signed by the current administrator", async() => {
      expect.assertions(7);
      const decryptedPrivateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      const recipientPrivateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted);

      const metadataKeys = new MetadataKeysCollection(metadataKeysSignedByCurrentDto());
      const missingMetadataKeysIds = [metadataKeys.items[0].id];
      const users = new UsersCollection(usersWithMissingMetadataKeysDto({
        missingMetadataKeysIds
      }));

      const expectedSharedMetadataPrivateKey = await metadataKeys.items[0].metadataPrivateKeys.items[0].cloneForSharing(users.items[0].id);

      jest.spyOn(service.findUsersService, "findAll").mockImplementationOnce(() => users);
      jest.spyOn(service.getOrFindMetadataKeysService, "getOrFindAll").mockImplementationOnce(() => metadataKeys);
      jest.spyOn(service.metadataPrivateKeyApiService, "create").mockImplementationOnce(async encryptedMetadataPrivateKeys => {
        expect(encryptedMetadataPrivateKeys.items.length).toEqual(1);

        const metadataPrivateKeyEntity = encryptedMetadataPrivateKeys.items[0];
        const messageEncrypted = await OpenpgpAssertion.readMessageOrFail(metadataPrivateKeyEntity.data);
        const decryptResult = await DecryptMessageService.decrypt(messageEncrypted, recipientPrivateKey, [decryptedPrivateKey], {returnOnlyData: false});
        const signature = await FindSignatureService.findSignatureForGpgKey(decryptResult.signatures, decryptedPrivateKey);

        expect(metadataPrivateKeyEntity.userId).toEqual(expectedSharedMetadataPrivateKey.userId);
        expect(metadataPrivateKeyEntity.metadataKeyId).toEqual(expectedSharedMetadataPrivateKey.metadataKeyId);
        expect(JSON.parse(decryptResult.data)).toEqual(expectedSharedMetadataPrivateKey.data.toDto());
        expect(signature.isVerified).toBeTruthy();
      });
      jest.spyOn(service.encryptMetadataPrivateKeysService, "encryptOne");

      await service.shareAllMissing(pgpKeys.ada.passphrase);


      expect(service.metadataPrivateKeyApiService.create).toHaveBeenCalled();
      expect(service.encryptMetadataPrivateKeysService.encryptOne).toHaveBeenCalledTimes(1);
    });


    it("should share and not sign the missing data keys if the current administrator is not signator", async() => {
      expect.assertions(7);
      const decryptedPrivateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      const recipientPrivateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted);

      const metadataKeys = new MetadataKeysCollection(metadataKeysNotSignedByCurrentDto());
      const missingMetadataKeysIds = [metadataKeys.items[0].id];
      const users = new UsersCollection(usersWithMissingMetadataKeysDto({
        missingMetadataKeysIds
      }));

      const expectedSharedMetadataPrivateKey = await metadataKeys.items[0].metadataPrivateKeys.items[0].cloneForSharing(users.items[0].id);
      jest.spyOn(service.findUsersService, "findAll").mockImplementationOnce(() => users);
      jest.spyOn(service.getOrFindMetadataKeysService, "getOrFindAll").mockImplementationOnce(() => metadataKeys);
      jest.spyOn(service.metadataPrivateKeyApiService, "create").mockImplementationOnce(async encryptedMetadataPrivateKeys => {
        expect(encryptedMetadataPrivateKeys.items.length).toEqual(1);

        const metadataPrivateKeyEntity = encryptedMetadataPrivateKeys.items[0];
        const messageEncrypted = await OpenpgpAssertion.readMessageOrFail(metadataPrivateKeyEntity.data);
        const decryptResult = await DecryptMessageService.decrypt(messageEncrypted, recipientPrivateKey, [decryptedPrivateKey], {returnOnlyData: false, throwOnInvalidSignaturesVerification: false});
        const signature = await FindSignatureService.findSignatureForGpgKey(decryptResult.signatures, decryptedPrivateKey);

        expect(metadataPrivateKeyEntity.userId).toEqual(expectedSharedMetadataPrivateKey.userId);
        expect(metadataPrivateKeyEntity.metadataKeyId).toEqual(expectedSharedMetadataPrivateKey.metadataKeyId);
        expect(JSON.parse(decryptResult.data)).toEqual(expectedSharedMetadataPrivateKey.data.toDto());
        expect(signature).toBe(null);
      });
      jest.spyOn(service.encryptMetadataPrivateKeysService, "encryptOne");

      await service.shareAllMissing(pgpKeys.ada.passphrase);

      expect(service.metadataPrivateKeyApiService.create).toHaveBeenCalled();
      expect(service.encryptMetadataPrivateKeysService.encryptOne).toHaveBeenCalledTimes(1);
    });
  });
});
