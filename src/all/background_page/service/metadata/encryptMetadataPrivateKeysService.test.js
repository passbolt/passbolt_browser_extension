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

import {v4 as uuidv4} from "uuid";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import {
  decryptedMetadataPrivateKeyDto,
  defaultMetadataPrivateKeyDto
} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataPrivateKeyEntity.test.data";
import MetadataPrivateKeyEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataPrivateKeyEntity";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import MetadataPrivateKeysCollection
  from "passbolt-styleguide/src/shared/models/entity/metadata/metadataPrivateKeysCollection";
import {defaultMetadataKeyDto} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeyEntity.test.data";
import EncryptMetadataPrivateKeysService from "./encryptMetadataPrivateKeysService";
import Keyring from "../../model/keyring";
import DecryptMessageService from "../crypto/decryptMessageService";
import MetadataKeyEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeyEntity";
import FindSignatureService from "../crypto/findSignatureService";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("EncryptMetadataPrivateKeysService", () => {
  let account, keyring, userPrivateKey, service;

  beforeEach(async() => {
    account = new AccountEntity(defaultAccountDto());
    keyring = new Keyring();
    userPrivateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
    service = new EncryptMetadataPrivateKeysService(account);
    // Flush the keyring after each test.
    keyring.flush(Keyring.PUBLIC);
    keyring.flush(Keyring.PRIVATE);
  });

  describe("::encryptOne", () => {
    it("encrypts a metadata private key for a user and mutate the metadata private key entity data with the encrypted result.", async() => {
      expect.assertions(3);

      await keyring.importPublic(pgpKeys.ada.public, pgpKeys.ada.userId);
      const dto = decryptedMetadataPrivateKeyDto({user_id: pgpKeys.ada.userId});
      const metadataPrivateKey = new MetadataPrivateKeyEntity(dto);

      await service.encryptOne(metadataPrivateKey, userPrivateKey);

      expect(metadataPrivateKey._data).toBeUndefined();
      expect(typeof metadataPrivateKey.data).toBe("string");
      const recipientPrivateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      const message = await OpenpgpAssertion.readMessageOrFail(metadataPrivateKey.data);
      const decryptedData = JSON.parse(await DecryptMessageService.decrypt(message, recipientPrivateKey, [userPrivateKey]));
      expect(decryptedData).toEqual(dto.data);
    }, 10 * 1000);

    it("encrypts a metadata private key for the API and mutate the metadata private key entity data with the encrypted result.", async() => {
      expect.assertions(3);

      const dto = decryptedMetadataPrivateKeyDto({user_id: null});
      const metadataPrivateKey = new MetadataPrivateKeyEntity(dto);

      await service.encryptOne(metadataPrivateKey, userPrivateKey);

      expect(metadataPrivateKey._data).toBeUndefined();
      expect(typeof metadataPrivateKey.data).toBe("string");
      const recipientPrivateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.server.private);
      const message = await OpenpgpAssertion.readMessageOrFail(metadataPrivateKey.data);
      const decryptedData = JSON.parse(await DecryptMessageService.decrypt(message, recipientPrivateKey, [userPrivateKey]));
      expect(decryptedData).toEqual(dto.data);
    }, 10 * 1000);

    it("encrypts a metadata private key and override the signature date.", async() => {
      expect.assertions(4);

      await keyring.importPublic(pgpKeys.ada.public, pgpKeys.ada.userId);
      const dto = decryptedMetadataPrivateKeyDto({user_id: pgpKeys.ada.userId});
      const metadataPrivateKey = new MetadataPrivateKeyEntity(dto);
      const date = new Date(2025, 1, 1);

      await service.encryptOne(metadataPrivateKey, userPrivateKey, {date});

      expect(metadataPrivateKey._data).toBeUndefined();
      expect(typeof metadataPrivateKey.data).toBe("string");
      const recipientPrivateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      const message = await OpenpgpAssertion.readMessageOrFail(metadataPrivateKey.data);
      const decryptResult = await DecryptMessageService.decrypt(message, recipientPrivateKey, [userPrivateKey], {returnOnlyData: false});
      const signature = await FindSignatureService.findSignatureForGpgKey(decryptResult.signatures, userPrivateKey);
      const decryptedData = JSON.parse(decryptResult.data);
      expect(decryptedData).toEqual(dto.data);
      expect(signature.created).toEqual(date.toISOString());
    }, 10 * 1000);


    it("should encrypt a metadata private key and without sign it.", async() => {
      expect.assertions(4);

      await keyring.importPublic(pgpKeys.ada.public, pgpKeys.ada.userId);
      const dto = decryptedMetadataPrivateKeyDto({user_id: pgpKeys.ada.userId});
      const metadataPrivateKey = new MetadataPrivateKeyEntity(dto);

      await service.encryptOne(metadataPrivateKey, userPrivateKey);

      expect(metadataPrivateKey._data).toBeUndefined();
      expect(typeof metadataPrivateKey.data).toBe("string");
      const recipientPrivateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      const message = await OpenpgpAssertion.readMessageOrFail(metadataPrivateKey.data);
      const decryptResult = await DecryptMessageService.decrypt(message, recipientPrivateKey);

      const decryptedData = JSON.parse(decryptResult);
      expect(decryptedData).toEqual(dto.data);
      expect(decryptResult.signatures).toBeUndefined();
    }, 10 * 1000);

    it("does nothing if the data is already encrypted", async() => {
      expect.assertions(2);
      const dto = defaultMetadataPrivateKeyDto();
      const metadataPrivateKey = new MetadataPrivateKeyEntity(dto);
      await expect(() => service.encryptOne(metadataPrivateKey, userPrivateKey)).not.toThrow();
      expect(metadataPrivateKey.data).toEqual(dto.data);
    });

    it("throws if no key found for the user defined the metadata private key.", async() => {
      expect.assertions(1);
      const expectedError = new TypeError(`The public key for the user with ID ${pgpKeys.ada.userId} could not be found.`);
      const dto = decryptedMetadataPrivateKeyDto({user_id: pgpKeys.ada.userId});
      const metadataPrivateKey = new MetadataPrivateKeyEntity(dto);
      await expect(() => service.encryptOne(metadataPrivateKey, userPrivateKey)).rejects.toThrowError(expectedError);
    });

    it("throws if the key for the user defined the metadata private key is expired.", async() => {
      expect.assertions(1);
      await keyring.importPublic(pgpKeys.lynne.public, pgpKeys.lynne.userId);
      const expectedError = new TypeError(`The public key for the user with ID ${pgpKeys.lynne.userId} is expired.`);
      const dto = decryptedMetadataPrivateKeyDto({user_id: pgpKeys.lynne.userId});
      const metadataPrivateKey = new MetadataPrivateKeyEntity(dto);
      await expect(() => service.encryptOne(metadataPrivateKey, userPrivateKey)).rejects.toThrowError(expectedError);
    });

    it("throws if the given metadata private key is not of type MetadataKeyPrivateKeyEntity.", async() => {
      expect.assertions(1);
      const expectedError = new TypeError("The 'metadataPrivateKey' parameter should be of type MetadataPrivateKeysEntity.");
      await expect(() => service.encryptOne("test")).rejects.toThrowError(expectedError);
    });

    it("throws if the given user private key is not an openpgp decrypted private key.", async() => {
      expect.assertions(1);
      const expectedError = new Error("The key should be a valid openpgp private key.");
      const dto = defaultMetadataPrivateKeyDto();
      const metadataPrivateKey = new MetadataPrivateKeyEntity(dto);
      await expect(() => service.encryptOne(metadataPrivateKey, "test")).rejects.toThrowError(expectedError);
    });

    it("throws an error if the optional date parameter is not of Date type.", async() => {
      expect.assertions(1);

      await keyring.importPublic(pgpKeys.ada.public, pgpKeys.ada.userId);
      const dto = decryptedMetadataPrivateKeyDto({user_id: pgpKeys.ada.userId});
      const metadataPrivateKey = new MetadataPrivateKeyEntity(dto);

      const promise = service.encryptOne(metadataPrivateKey, userPrivateKey, {date: 42});

      await expect(promise).rejects.toThrow("The optional 'date' parameter should be of type Date.");
    });
  });

  describe("::encryptAll", () => {
    it("encrypts a collection of metadata private key entities and mutates all entities data with their encrypted result", async() => {
      expect.assertions(7);

      await keyring.importPublic(pgpKeys.ada.public, pgpKeys.ada.userId);
      await keyring.importPublic(pgpKeys.betty.public, pgpKeys.betty.userId);
      const dto1 = decryptedMetadataPrivateKeyDto({user_id: pgpKeys.ada.userId});
      const dto2 = decryptedMetadataPrivateKeyDto({user_id: pgpKeys.betty.userId, metadata_key_id: dto1.metadata_key_id});
      const metadataPrivateKeys = new MetadataPrivateKeysCollection([dto1, dto2]);

      await service.encryptAll(metadataPrivateKeys, userPrivateKey);

      expect(metadataPrivateKeys).toHaveLength(2);

      expect(typeof metadataPrivateKeys._items[0].data).toBe("string");
      expect(metadataPrivateKeys.items[0]._data).toBeUndefined();
      const recipientPrivateKey1 = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      const message1 = await OpenpgpAssertion.readMessageOrFail(metadataPrivateKeys.items[0].data);
      const decryptedData1 = JSON.parse(await DecryptMessageService.decrypt(message1, recipientPrivateKey1, [userPrivateKey]));
      expect(decryptedData1).toEqual(dto1.data);

      expect(typeof metadataPrivateKeys._items[1].data).toBe("string");
      expect(metadataPrivateKeys.items[1]._data).toBeUndefined();
      const recipientPrivateKey2 = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted);
      const message2 = await OpenpgpAssertion.readMessageOrFail(metadataPrivateKeys.items[1].data);
      const decryptedData2 = JSON.parse(await DecryptMessageService.decrypt(message2, recipientPrivateKey2, [userPrivateKey]));
      expect(decryptedData2).toEqual(dto2.data);
    }, 10 * 1000);

    it("throws if no key found for one of the user defined in the metadata private keys.", async() => {
      expect.assertions(1);
      const expectedError = new TypeError(`The public key for the user with ID ${pgpKeys.ada.userId} could not be found.`);
      const dto = [decryptedMetadataPrivateKeyDto({user_id: pgpKeys.ada.userId})];
      const metadataPrivateKeys = new MetadataPrivateKeysCollection(dto);
      await expect(() => service.encryptAll(metadataPrivateKeys, userPrivateKey)).rejects.toThrowError(expectedError);
    });

    it("throws if the key for one of the user defined in the metadata private keys is expired.", async() => {
      expect.assertions(1);
      await keyring.importPublic(pgpKeys.lynne.public, pgpKeys.lynne.userId);
      const expectedError = new TypeError(`The public key for the user with ID ${pgpKeys.lynne.userId} is expired.`);
      const dto = [decryptedMetadataPrivateKeyDto({user_id: pgpKeys.lynne.userId})];
      const metadataPrivateKeys = new MetadataPrivateKeysCollection(dto);
      await expect(() => service.encryptAll(metadataPrivateKeys, userPrivateKey)).rejects.toThrowError(expectedError);
    });

    it("throws if the given metadata private keys are not of type MetadataKeyPrivateKeyCollection.", async() => {
      expect.assertions(1);
      const expectedError = new TypeError("The 'metadataPrivateKeys' parameter should be of type MetadataPrivateKeysCollection.");
      await expect(() => service.encryptAll("test")).rejects.toThrowError(expectedError);
    });

    it("throws if the given user private key is not an openpgp decrypted private key.", async() => {
      expect.assertions(1);
      const expectedError = new Error("The key should be a valid openpgp private key.");
      const dto = [defaultMetadataPrivateKeyDto()];
      const metadataPrivateKeys = new MetadataPrivateKeysCollection(dto);
      await expect(() => service.encryptAll(metadataPrivateKeys, "test")).rejects.toThrowError(expectedError);
    });
  });

  describe("::encryptAllFromMetadataKeyEntity", () => {
    it("encrypts the metadata private keys from a metadata key entity and mutate all metadata private key entities with their encrypted result.", async() => {
      expect.assertions(7);

      await keyring.importPublic(pgpKeys.ada.public, pgpKeys.ada.userId);
      await keyring.importPublic(pgpKeys.betty.public, pgpKeys.betty.userId);
      const id = uuidv4();
      const dto = defaultMetadataKeyDto({
        id: id,
        metadata_private_keys: [
          decryptedMetadataPrivateKeyDto({user_id: pgpKeys.ada.userId, metadata_key_id: id}),
          decryptedMetadataPrivateKeyDto({user_id: pgpKeys.betty.userId, metadata_key_id: id})
        ]
      });
      const metadataKey = new MetadataKeyEntity(dto);

      await service.encryptAllFromMetadataKeyEntity(metadataKey, userPrivateKey);

      expect(metadataKey.metadataPrivateKeys).toHaveLength(2);

      expect(typeof metadataKey.metadataPrivateKeys._items[0].data).toBe("string");
      expect(metadataKey.metadataPrivateKeys.items[0]._data).toBeUndefined();
      const recipientPrivateKey1 = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      const message1 = await OpenpgpAssertion.readMessageOrFail(metadataKey.metadataPrivateKeys.items[0].data);
      const decryptedData1 = JSON.parse(await DecryptMessageService.decrypt(message1, recipientPrivateKey1, [userPrivateKey]));
      expect(decryptedData1).toEqual(dto.metadata_private_keys[0].data);

      expect(typeof metadataKey.metadataPrivateKeys._items[1].data).toBe("string");
      expect(metadataKey.metadataPrivateKeys.items[1]._data).toBeUndefined();
      const recipientPrivateKey2 = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted);
      const message2 = await OpenpgpAssertion.readMessageOrFail(metadataKey.metadataPrivateKeys.items[1].data);
      const decryptedData2 = JSON.parse(await DecryptMessageService.decrypt(message2, recipientPrivateKey2, [userPrivateKey]));
      expect(decryptedData2).toEqual(dto.metadata_private_keys[1].data);
    }, 10 * 1000);

    it("throws if the given metadata key are not of type MetadataKeyEntity.", async() => {
      expect.assertions(1);
      const expectedError = new TypeError("The 'metadataKey' parameter should be of type MetadataKeyEntity.");
      await expect(() => service.encryptAllFromMetadataKeyEntity("test")).rejects.toThrowError(expectedError);
    });

    it("throws if the given user private key is not an openpgp decrypted private key.", async() => {
      expect.assertions(1);
      const expectedError = new Error("The key should be a valid openpgp private key.");
      const metadataPrivateKeys = new MetadataKeyEntity(defaultMetadataKeyDto());
      await expect(() => service.encryptAllFromMetadataKeyEntity(metadataPrivateKeys, "test")).rejects.toThrowError(expectedError);
    });
  });
});
