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

import EncryptMessageService from "../crypto/encryptMessageService";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import {
  decryptedMetadataPrivateKeyDto,
  defaultMetadataPrivateKeyDto
} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataPrivateKeyEntity.test.data";
import DecryptMetadataPrivateKeysService from "./decryptMetadataPrivateKeysService";
import MetadataPrivateKeyEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataPrivateKeyEntity";
import UserPassphraseRequiredError from "passbolt-styleguide/src/shared/error/userPassphraseRequiredError";
import PassphraseStorageService from "../session_storage/passphraseStorageService";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import MetadataPrivateKeysCollection from "passbolt-styleguide/src/shared/models/entity/metadata/metadataPrivateKeysCollection";
import {defaultMetadataKeyDto} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeyEntity.test.data";
import MetadataKeysCollection from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysCollection";
import MetadataPrivateKeyDataEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataPrivateKeyDataEntity";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("DecryptMetadataPrivateKeysService", () => {
  describe("::decryptOne", () => {
    it("should decrypt a MetadataPrivateKeyEntity", async() => {
      expect.assertions(3);

      const account = new AccountEntity(defaultAccountDto());

      const dto = defaultMetadataPrivateKeyDto();
      dto.data = pgpKeys.metadataKey.encryptedMetadataPrivateKeyDataMessage;

      const metadataPrivateKeyEntity = new MetadataPrivateKeyEntity(dto);
      const service = new DecryptMetadataPrivateKeysService(account);

      await service.decryptOne(metadataPrivateKeyEntity, pgpKeys.ada.passphrase);

      expect(metadataPrivateKeyEntity._props.data).toBeUndefined();
      expect(metadataPrivateKeyEntity.data).toBeInstanceOf(MetadataPrivateKeyDataEntity);

      const openPgpPrivateKey = await OpenpgpAssertion.readKeyOrFail(metadataPrivateKeyEntity.data.armoredKey);
      await expect(() => OpenpgpAssertion.assertDecryptedPrivateKey(openPgpPrivateKey)).not.toThrow();
    }, 10 * 1000);

    it("should retrieve the passphrase from the storage", async() => {
      expect.assertions(2);

      const spyOnPassphraseStorage = jest.spyOn(PassphraseStorageService, "get");
      spyOnPassphraseStorage.mockImplementation(() => pgpKeys.ada.passphrase);

      const dto = defaultMetadataPrivateKeyDto();
      dto.data = pgpKeys.metadataKey.encryptedMetadataPrivateKeyDataMessage;

      const metadataPrivateKeyEntity = new MetadataPrivateKeyEntity(dto);

      const account = new AccountEntity(defaultAccountDto());
      const service = new DecryptMetadataPrivateKeysService(account);
      await service.decryptOne(metadataPrivateKeyEntity);

      expect(metadataPrivateKeyEntity.data).toBeInstanceOf(MetadataPrivateKeyDataEntity);

      const openPgpPrivateKey = await OpenpgpAssertion.readKeyOrFail(metadataPrivateKeyEntity.data.armoredKey);
      await expect(() => OpenpgpAssertion.assertDecryptedPrivateKey(openPgpPrivateKey)).not.toThrow();
    }, 10 * 1000);

    it("should ensure metadataPrivateKeyEntity is of a valid type", async() => {
      expect.assertions(1);
      const expectedError = new TypeError("The given entity is not a MetadataPrivateKeyEntity");
      const account = new AccountEntity(defaultAccountDto());

      const service = new DecryptMetadataPrivateKeysService(account);
      await expect(() => service.decryptOne("test")).rejects.toThrowError(expectedError);
    });

    it("should ensure metadataPrivateKeyEntity is not decrypted already", async() => {
      expect.assertions(1);
      const dto = defaultMetadataPrivateKeyDto();
      const metadataPrivateKeyEntity = new MetadataPrivateKeyEntity(dto);

      const account = new AccountEntity(defaultAccountDto());
      const service = new DecryptMetadataPrivateKeysService(account);
      await expect(() => service.decryptOne(metadataPrivateKeyEntity)).not.toThrow();
    });

    it("should ensure metadataPrivateKeyEntity data is a valid PGP message", async() => {
      expect.assertions(1);
      const dto = defaultMetadataPrivateKeyDto();
      const metadataPrivateKeyEntity = new MetadataPrivateKeyEntity(dto);

      //bypassing entity checks for the unit test
      metadataPrivateKeyEntity._props.data = "Test";

      const expectedError = new Error("The message should be a valid openpgp message.");

      const account = new AccountEntity(defaultAccountDto());
      const service = new DecryptMetadataPrivateKeysService(account);
      await expect(() => service.decryptOne(metadataPrivateKeyEntity, "test")).rejects.toThrowError(expectedError);
    });

    it("should throw an error if the passphrase is not available", async() => {
      expect.assertions(2);
      const spyOnPassphraseStorage = jest.spyOn(PassphraseStorageService, "get");
      spyOnPassphraseStorage.mockImplementation(() => null);

      const dto = defaultMetadataPrivateKeyDto();
      dto.data = pgpKeys.metadataKey.encryptedMetadataPrivateKeyDataMessage;
      const metadataPrivateKeyEntity = new MetadataPrivateKeyEntity(dto);

      const expectedError = new UserPassphraseRequiredError();

      const account = new AccountEntity(defaultAccountDto());
      const service = new DecryptMetadataPrivateKeysService(account);
      await expect(() => service.decryptOne(metadataPrivateKeyEntity)).rejects.toThrowError(expectedError);
      expect(spyOnPassphraseStorage).toHaveBeenCalledTimes(1);
    });
  });

  describe("::decryptAll", () => {
    it("should decrypt a MetadataPrivateKeysCollection", async() => {
      expect.assertions(5);

      const dto1 = defaultMetadataPrivateKeyDto();
      dto1.data = pgpKeys.metadataKey.encryptedMetadataPrivateKeyDataMessage;

      const dto2 = defaultMetadataPrivateKeyDto({metadata_key_id: dto1.metadata_key_id});
      dto2.data = pgpKeys.metadataKey.encryptedMetadataPrivateKeyDataMessage;

      const collection = new MetadataPrivateKeysCollection([dto1, dto2]);

      const account = new AccountEntity(defaultAccountDto());
      const service = new DecryptMetadataPrivateKeysService(account);
      await service.decryptAll(collection, pgpKeys.ada.passphrase);

      expect(collection).toHaveLength(2);
      expect(collection._items[0].data).toBeInstanceOf(MetadataPrivateKeyDataEntity);
      expect(collection._items[1].data).toBeInstanceOf(MetadataPrivateKeyDataEntity);

      const openPgpPrivateKey1 = await OpenpgpAssertion.readKeyOrFail(collection._items[0].data.armoredKey);
      const openPgpPrivateKey2 = await OpenpgpAssertion.readKeyOrFail(collection._items[0].data.armoredKey);
      await expect(() => OpenpgpAssertion.assertDecryptedPrivateKey(openPgpPrivateKey1)).not.toThrow();
      await expect(() => OpenpgpAssertion.assertDecryptedPrivateKey(openPgpPrivateKey2)).not.toThrow();
    }, 10 * 1000);

    it("should retrieve the passphrase from the storage", async() => {
      expect.assertions(5);

      const spyOnPassphraseStorage = jest.spyOn(PassphraseStorageService, "get");
      spyOnPassphraseStorage.mockImplementation(() => pgpKeys.ada.passphrase);

      const dto1 = defaultMetadataPrivateKeyDto();
      dto1.data = pgpKeys.metadataKey.encryptedMetadataPrivateKeyDataMessage;

      const dto2 = defaultMetadataPrivateKeyDto({metadata_key_id: dto1.metadata_key_id});
      dto2.data = pgpKeys.metadataKey.encryptedMetadataPrivateKeyDataMessage;

      const collection = new MetadataPrivateKeysCollection([dto1, dto2]);

      const account = new AccountEntity(defaultAccountDto());
      const service = new DecryptMetadataPrivateKeysService(account);
      await service.decryptAll(collection);

      expect(collection).toHaveLength(2);
      expect(collection._items[0].data).toBeInstanceOf(MetadataPrivateKeyDataEntity);
      expect(collection._items[1].data).toBeInstanceOf(MetadataPrivateKeyDataEntity);

      const openPgpPrivateKey1 = await OpenpgpAssertion.readKeyOrFail(collection._items[0].data.armoredKey);
      const openPgpPrivateKey2 = await OpenpgpAssertion.readKeyOrFail(collection._items[0].data.armoredKey);
      await expect(() => OpenpgpAssertion.assertDecryptedPrivateKey(openPgpPrivateKey1)).not.toThrow();
      await expect(() => OpenpgpAssertion.assertDecryptedPrivateKey(openPgpPrivateKey2)).not.toThrow();
    }, 10 * 1000);

    it("should ensure metadataPrivateKeysCollection is of a valid type", async() => {
      expect.assertions(1);

      const expectedError = new TypeError("The given collection is not of the type MetadataPrivateKeysCollection");

      const account = new AccountEntity(defaultAccountDto());
      const service = new DecryptMetadataPrivateKeysService(account);
      await expect(() => service.decryptAll("test")).rejects.toThrowError(expectedError);
    });

    it("should ensure metadataPrivateKeyEntity data is a valid PGP message", async() => {
      expect.assertions(1);
      const dto = defaultMetadataPrivateKeyDto();
      const collection = new MetadataPrivateKeysCollection([dto]);

      //bypassing entity checks for the unit test
      collection._items[0]._props.data = "Test";

      const expectedError = new Error("The message should be a valid openpgp message.");

      const account = new AccountEntity(defaultAccountDto());
      const service = new DecryptMetadataPrivateKeysService(account);
      await expect(() => service.decryptAll(collection, "test")).rejects.toThrowError(expectedError);
    });

    it("should throw an error if the passphrase is not available", async() => {
      expect.assertions(2);
      const spyOnPassphraseStorage = jest.spyOn(PassphraseStorageService, "get");
      spyOnPassphraseStorage.mockImplementation(() => null);

      const messageEncryptedArmored = await EncryptMessageService.encryptSymmetrically(pgpKeys.ada.private_decrypted, ["password"]);
      const dto = defaultMetadataPrivateKeyDto();
      dto.data = messageEncryptedArmored;
      const collection = new MetadataPrivateKeysCollection([dto]);

      const expectedError = new UserPassphraseRequiredError();

      const account = new AccountEntity(defaultAccountDto());
      const service = new DecryptMetadataPrivateKeysService(account);
      await expect(() => service.decryptAll(collection)).rejects.toThrowError(expectedError);
      expect(spyOnPassphraseStorage).toHaveBeenCalledTimes(1);
    });
  });

  describe("::decryptAllFromMetadataKeysCollection", () => {
    it("should decrypt the private keys from MetadataKeysCollection", async() => {
      expect.assertions(5);

      const dto1 = defaultMetadataKeyDto({}, {withMetadataPrivateKeys: true});
      dto1.metadata_private_keys[0].data = pgpKeys.metadataKey.encryptedMetadataPrivateKeyDataMessage;
      dto1.fingerprint = "abcd".repeat(10);

      const dto2 = defaultMetadataKeyDto({}, {withMetadataPrivateKeys: true});
      dto2.metadata_private_keys[0].data = pgpKeys.metadataKey.encryptedMetadataPrivateKeyDataMessage;
      dto2.fingerprint = "ef01".repeat(10);
      const collection = new MetadataKeysCollection([dto1, dto2]);

      const account = new AccountEntity(defaultAccountDto());
      const service = new DecryptMetadataPrivateKeysService(account);
      await service.decryptAllFromMetadataKeysCollection(collection, pgpKeys.ada.passphrase);

      const metadataPrivateKey1 = collection._items[0].metadataPrivateKeys._items[0];
      const metadataPrivateKey2 = collection._items[1].metadataPrivateKeys._items[0];

      expect(collection).toHaveLength(2);
      expect(metadataPrivateKey1.data).toBeInstanceOf(MetadataPrivateKeyDataEntity);
      expect(metadataPrivateKey2.data).toBeInstanceOf(MetadataPrivateKeyDataEntity);

      const openPgpPrivateKey1 = await OpenpgpAssertion.readKeyOrFail(metadataPrivateKey1.data.armoredKey);
      const openPgpPrivateKey2 = await OpenpgpAssertion.readKeyOrFail(metadataPrivateKey2.data.armoredKey);
      await expect(() => OpenpgpAssertion.assertDecryptedPrivateKey(openPgpPrivateKey1)).not.toThrow();
      await expect(() => OpenpgpAssertion.assertDecryptedPrivateKey(openPgpPrivateKey2)).not.toThrow();
    }, 10 * 1000);

    it("should retrieve the passphrase from the storage", async() => {
      expect.assertions(5);

      const spyOnPassphraseStorage = jest.spyOn(PassphraseStorageService, "get");
      spyOnPassphraseStorage.mockImplementation(() => pgpKeys.ada.passphrase);

      const dto1 = defaultMetadataKeyDto({}, {withMetadataPrivateKeys: true});
      dto1.metadata_private_keys[0].data = pgpKeys.metadataKey.encryptedMetadataPrivateKeyDataMessage;
      dto1.fingerprint = "abcd".repeat(10);

      const dto2 = defaultMetadataKeyDto({}, {withMetadataPrivateKeys: true});
      dto2.metadata_private_keys[0].data = pgpKeys.metadataKey.encryptedMetadataPrivateKeyDataMessage;
      dto2.fingerprint = "ef01".repeat(10);

      const collection = new MetadataKeysCollection([dto1, dto2]);

      const account = new AccountEntity(defaultAccountDto());
      const service = new DecryptMetadataPrivateKeysService(account);
      await service.decryptAllFromMetadataKeysCollection(collection);

      const metadataPrivateKey1 = collection._items[0].metadataPrivateKeys._items[0];
      const metadataPrivateKey2 = collection._items[1].metadataPrivateKeys._items[0];

      expect(collection).toHaveLength(2);
      expect(metadataPrivateKey1.data).toBeInstanceOf(MetadataPrivateKeyDataEntity);
      expect(metadataPrivateKey2.data).toBeInstanceOf(MetadataPrivateKeyDataEntity);

      const openPgpPrivateKey1 = await OpenpgpAssertion.readKeyOrFail(metadataPrivateKey1.data.armoredKey);
      const openPgpPrivateKey2 = await OpenpgpAssertion.readKeyOrFail(metadataPrivateKey2.data.armoredKey);
      await expect(() => OpenpgpAssertion.assertDecryptedPrivateKey(openPgpPrivateKey1)).not.toThrow();
      await expect(() => OpenpgpAssertion.assertDecryptedPrivateKey(openPgpPrivateKey2)).not.toThrow();
    }, 10 * 1000);

    it("does not retrieve the passphrase if no metadata private keys are associated to the collection public keys", async() => {
      expect.assertions(1);

      jest.spyOn(PassphraseStorageService, "get");
      const dto1 = defaultMetadataKeyDto();
      const collection = new MetadataKeysCollection([dto1]);

      const account = new AccountEntity(defaultAccountDto());
      const service = new DecryptMetadataPrivateKeysService(account);
      await service.decryptAllFromMetadataKeysCollection(collection);

      await expect(PassphraseStorageService.get).not.toHaveBeenCalled();
    });

    it("does not retrieve the passphrase if the metadata private keys associated to the collection public keys are already decrypted", async() => {
      expect.assertions(1);

      jest.spyOn(PassphraseStorageService, "get");
      const dto1 = defaultMetadataKeyDto({}, {withMetadataPrivateKeys: true});
      delete dto1.data;
      dto1.metadata_private_keys = [decryptedMetadataPrivateKeyDto({metadata_key_id: dto1.id})];
      const collection = new MetadataKeysCollection([dto1]);

      const account = new AccountEntity(defaultAccountDto());
      const service = new DecryptMetadataPrivateKeysService(account);
      await service.decryptAllFromMetadataKeysCollection(collection);

      await expect(PassphraseStorageService.get).not.toHaveBeenCalled();
    });

    it("should ensure metadataKeysCollection is of a valid type", async() => {
      expect.assertions(1);

      const expectedError = new TypeError("The given collection is not of the type MetadataKeysCollection");

      const account = new AccountEntity(defaultAccountDto());
      const service = new DecryptMetadataPrivateKeysService(account);
      await expect(() => service.decryptAllFromMetadataKeysCollection("test")).rejects.toThrowError(expectedError);
    });

    it("should throw an error if the passphrase is not available", async() => {
      expect.assertions(2);
      const spyOnPassphraseStorage = jest.spyOn(PassphraseStorageService, "get");
      spyOnPassphraseStorage.mockImplementation(() => null);

      const dto = defaultMetadataKeyDto({}, {withMetadataPrivateKeys: true});
      dto.metadata_private_keys[0].data = pgpKeys.metadataKey.encryptedMetadataPrivateKeyDataMessage;

      const collection = new MetadataKeysCollection([dto]);

      const expectedError = new UserPassphraseRequiredError();

      const account = new AccountEntity(defaultAccountDto());
      const service = new DecryptMetadataPrivateKeysService(account);
      await expect(() => service.decryptAllFromMetadataKeysCollection(collection)).rejects.toThrowError(expectedError);
      expect(spyOnPassphraseStorage).toHaveBeenCalledTimes(1);
    });
  });
});
