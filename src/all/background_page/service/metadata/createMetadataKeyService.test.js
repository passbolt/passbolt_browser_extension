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

import CreateMetadataKeyService from "./createMetadataKeyService";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import Keyring from "../../model/keyring";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import MetadataKeyEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeyEntity";
import ExternalGpgKeyPairEntity
  from "passbolt-styleguide/src/shared/models/entity/gpgkey/external/externalGpgKeyPairEntity";
import UsersCollection from "../../model/entity/user/usersCollection";
import {users} from "passbolt-styleguide/src/shared/models/entity/user/userEntity.test.data";
import MetadataKeysSettingsEntity
  from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysSettingsEntity";
import {
  defaultMetadataKeysSettingsDto
} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysSettingsEntity.test.data";
import DecryptMessageService from "../crypto/decryptMessageService";
import MockExtension from "../../../../../test/mocks/mockExtension";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("CreateMetadataKeyService", () => {
  let account, apiClientOptions, userPrivateKey, service;

  beforeEach(async() => {
    account = new AccountEntity(defaultAccountDto());
    apiClientOptions = defaultApiClientOptions();
    await MockExtension.withConfiguredAccount();
    userPrivateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
    service = new CreateMetadataKeyService(account, apiClientOptions);
    // Flush the keyring after each test.
    service.keyring.flush(Keyring.PUBLIC);
    service.keyring.flush(Keyring.PRIVATE);
  });

  describe("::create", () => {
    it("creates, with disabled zero knowledge, a metadata key and shares it with all active users and the API keys.", async() => {
      expect.assertions(24);

      const metadataKeyPairDto = {
        private_key: {armored_key: pgpKeys.eddsa_ed25519.private},
        public_key: {armored_key: pgpKeys.eddsa_ed25519.public},
      };
      const metadataKeyPair = new ExternalGpgKeyPairEntity(metadataKeyPairDto);

      service.keyring.importPublic(pgpKeys.ada.public, pgpKeys.ada.userId);
      service.keyring.importPublic(pgpKeys.betty.public, pgpKeys.betty.userId);
      jest.spyOn(service.keyring, "sync").mockImplementation(() => 2);
      jest.spyOn(service.getOrFindMetadataSettings, "getOrFindKeysSettings").mockReturnValue(new MetadataKeysSettingsEntity(defaultMetadataKeysSettingsDto()));
      jest.spyOn(service.findUsersService, "findAllActive").mockReturnValue(new UsersCollection([users.ada, users.betty]));
      let metadataKeyToCreate;
      jest.spyOn(service.metadataKeysApiService, "create").mockImplementation(metadataKey => {
        metadataKeyToCreate = metadataKey;
        return metadataKey.toDto();
      });

      const metadataKey = await service.create(metadataKeyPair, pgpKeys.ada.passphrase);

      expect(service.keyring.sync).toHaveBeenCalled();
      expect(metadataKey).toBeInstanceOf(MetadataKeyEntity);
      expect(metadataKeyToCreate.fingerprint).toBe(pgpKeys.eddsa_ed25519.fingerprint);
      expect(metadataKeyToCreate.armoredKey).toBe(pgpKeys.eddsa_ed25519.public);
      expect(metadataKeyToCreate.metadataPrivateKeys.items.length).toBe(3);

      expect(metadataKeyToCreate.metadataPrivateKeys.items[0].userId).toBe(pgpKeys.ada.userId);
      expect(metadataKeyToCreate.metadataPrivateKeys.items[0].isDecrypted).toBe(false);
      const recipientPrivateKey1 = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      const message1 = await OpenpgpAssertion.readMessageOrFail(metadataKeyToCreate.metadataPrivateKeys.items[0].data);
      const decryptedData1 = JSON.parse(await DecryptMessageService.decrypt(message1, recipientPrivateKey1, [userPrivateKey]));
      expect(decryptedData1.object_type).toBe("PASSBOLT_METADATA_PRIVATE_KEY");
      expect(decryptedData1.domain).toBe(account.domain);
      expect(decryptedData1.fingerprint).toBe(pgpKeys.eddsa_ed25519.fingerprint);
      expect(decryptedData1.armored_key).toBe(pgpKeys.eddsa_ed25519.private);
      expect(decryptedData1.passphrase).toBe("");

      expect(metadataKeyToCreate.metadataPrivateKeys.items[1].userId).toBe(pgpKeys.betty.userId);
      expect(metadataKeyToCreate.metadataPrivateKeys.items[1].isDecrypted).toBe(false);
      const recipientPrivateKey2 = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted);
      const message2 = await OpenpgpAssertion.readMessageOrFail(metadataKeyToCreate.metadataPrivateKeys.items[1].data);
      const decryptedData2 = JSON.parse(await DecryptMessageService.decrypt(message2, recipientPrivateKey2, [userPrivateKey]));
      expect(decryptedData2.object_type).toBe("PASSBOLT_METADATA_PRIVATE_KEY");
      expect(decryptedData2.domain).toBe(account.domain);
      expect(decryptedData2.fingerprint).toBe(pgpKeys.eddsa_ed25519.fingerprint);
      expect(decryptedData2.armored_key).toBe(pgpKeys.eddsa_ed25519.private);

      expect(metadataKeyToCreate.metadataPrivateKeys.items[2].userId).toBeNull();
      expect(metadataKeyToCreate.metadataPrivateKeys.items[2].isDecrypted).toBe(false);
      const recipientPrivateKey3 = await OpenpgpAssertion.readKeyOrFail(pgpKeys.server.private);
      const message3 = await OpenpgpAssertion.readMessageOrFail(metadataKeyToCreate.metadataPrivateKeys.items[2].data);
      const decryptedData3 = JSON.parse(await DecryptMessageService.decrypt(message3, recipientPrivateKey3, [userPrivateKey]));
      expect(decryptedData3.object_type).toBe("PASSBOLT_METADATA_PRIVATE_KEY");
      expect(decryptedData3.domain).toBe(account.domain);
      expect(decryptedData3.fingerprint).toBe(pgpKeys.eddsa_ed25519.fingerprint);
      expect(decryptedData3.armored_key).toBe(pgpKeys.eddsa_ed25519.private);
    }, 10 * 1000);

    it("create, with enabled zero knowledge, a metadata key and shares it with all active users only.", async() => {
      expect.assertions(17);

      const metadataKeyPairDto = {
        private_key: {armored_key: pgpKeys.eddsa_ed25519.private},
        public_key: {armored_key: pgpKeys.eddsa_ed25519.public},
      };
      const metadataKeyPair = new ExternalGpgKeyPairEntity(metadataKeyPairDto);

      service.keyring.importPublic(pgpKeys.ada.public, pgpKeys.ada.userId);
      service.keyring.importPublic(pgpKeys.betty.public, pgpKeys.betty.userId);
      jest.spyOn(service.keyring, "sync").mockImplementation(() => 2);
      const metadataKeysSettings = new MetadataKeysSettingsEntity(defaultMetadataKeysSettingsDto({zero_knowledge_key_share: true}));
      jest.spyOn(service.getOrFindMetadataSettings, "getOrFindKeysSettings").mockReturnValue(metadataKeysSettings);
      jest.spyOn(service.findUsersService, "findAllActive").mockReturnValue(new UsersCollection([users.ada, users.betty]));
      let metadataKeyToCreate;
      jest.spyOn(service.metadataKeysApiService, "create").mockImplementation(metadataKey => {
        metadataKeyToCreate = metadataKey;
        return metadataKey.toDto();
      });

      const metadataKey = await service.create(metadataKeyPair, pgpKeys.ada.passphrase);

      expect(metadataKey).toBeInstanceOf(MetadataKeyEntity);
      expect(metadataKeyToCreate.fingerprint).toBe(pgpKeys.eddsa_ed25519.fingerprint);
      expect(metadataKeyToCreate.armoredKey).toBe(pgpKeys.eddsa_ed25519.public);
      expect(metadataKeyToCreate.metadataPrivateKeys.items.length).toBe(2);

      expect(metadataKeyToCreate.metadataPrivateKeys.items[0].userId).toBe(pgpKeys.ada.userId);
      expect(metadataKeyToCreate.metadataPrivateKeys.items[0].isDecrypted).toBe(false);
      const recipientPrivateKey1 = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      const message1 = await OpenpgpAssertion.readMessageOrFail(metadataKeyToCreate.metadataPrivateKeys.items[0].data);
      const decryptedData1 = JSON.parse(await DecryptMessageService.decrypt(message1, recipientPrivateKey1, [userPrivateKey]));
      expect(decryptedData1.object_type).toBe("PASSBOLT_METADATA_PRIVATE_KEY");
      expect(decryptedData1.domain).toBe(account.domain);
      expect(decryptedData1.fingerprint).toBe(pgpKeys.eddsa_ed25519.fingerprint);
      expect(decryptedData1.armored_key).toBe(pgpKeys.eddsa_ed25519.private);
      expect(decryptedData1.passphrase).toBe("");

      expect(metadataKeyToCreate.metadataPrivateKeys.items[1].userId).toBe(pgpKeys.betty.userId);
      expect(metadataKeyToCreate.metadataPrivateKeys.items[1].isDecrypted).toBe(false);
      const recipientPrivateKey2 = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted);
      const message2 = await OpenpgpAssertion.readMessageOrFail(metadataKeyToCreate.metadataPrivateKeys.items[1].data);
      const decryptedData2 = JSON.parse(await DecryptMessageService.decrypt(message2, recipientPrivateKey2, [userPrivateKey]));
      expect(decryptedData2.object_type).toBe("PASSBOLT_METADATA_PRIVATE_KEY");
      expect(decryptedData2.domain).toBe(account.domain);
      expect(decryptedData2.fingerprint).toBe(pgpKeys.eddsa_ed25519.fingerprint);
      expect(decryptedData2.armored_key).toBe(pgpKeys.eddsa_ed25519.private);
    }, 10 * 1000);

    it("throws if the given metadata key pair is not of type ExternalGpgKeyPairEntity.", async() => {
      expect.assertions(1);
      const expectedError = new TypeError("The given data is not of the expected type");
      await expect(() => service.create("test")).rejects.toThrowError(expectedError);
    });

    it("throws if the given passphrase is not a valid string.", async() => {
      expect.assertions(1);
      const expectedError = new Error("The given parameter is not a valid string");
      const metadataKeyPairDto = {
        private_key: {armored_key: pgpKeys.eddsa_ed25519.private},
        public_key: {armored_key: pgpKeys.eddsa_ed25519.public},
      };
      const metadataKeyPair = new ExternalGpgKeyPairEntity(metadataKeyPairDto);
      await expect(() => service.create(metadataKeyPair, 42)).rejects.toThrowError(expectedError);
    });
  });
});
