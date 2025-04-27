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
 * @since         5.1.0
 */

import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import BuildApiClientOptionsService from "../account/buildApiClientOptionsService";
import {
  defaultMetadataPrivateKeyDto,
  decryptedMetadataPrivateKeyDto
} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataPrivateKeyEntity.test.data";
import TrustMetadataKeyService from "./trustMetadataKeyService";
import MetadataKeyEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeyEntity";
import MetadataPrivateKeyEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataPrivateKeyEntity";
import {defaultMetadataKeyDto} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeyEntity.test.data";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import MetadataKeysCollection from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysCollection";
import {v4 as uuidv4} from "uuid";
import MockExtension from "../../../../../test/mocks/mockExtension";

describe("TrustMetadataKeyService", () => {
  let account, apiClientOptions, service;
  beforeEach(async() => {
    jest.clearAllMocks();
    account = new AccountEntity(defaultAccountDto());
    await MockExtension.withConfiguredAccount();
    apiClientOptions = BuildApiClientOptionsService.buildFromAccount(account);
    service = new TrustMetadataKeyService(account, apiClientOptions);
    // flush account related storage before each.
    await service.trustedMetadataKeyLocalStorage.flush();
    await service.metadataKeysSessionStorage.flush();
  });

  describe('::trust', () => {
    it("if private metadata key data not already signed: sign the metadata private key data, update the private key on the API, update the metadata key in the session storage, and pin the key.", async() => {
      expect.assertions(7);

      let trustedMetadataKey = await service.trustedMetadataKeyLocalStorage.get();
      expect(trustedMetadataKey).toBeUndefined();

      const id = uuidv4();
      const fingerprint = pgpKeys.metadataKey.fingerprint;
      const metadataPrivateKeysDto = [decryptedMetadataPrivateKeyDto({metadata_key_id: id, user_id: account.userId})];
      const metadataKeyDto = defaultMetadataKeyDto({id: id, fingerprint: fingerprint, metadata_private_keys: metadataPrivateKeysDto});
      const metadataKey = new MetadataKeyEntity(metadataKeyDto);
      const metadataKeys = new MetadataKeysCollection([metadataKeyDto]);
      service.metadataKeysSessionStorage.set(metadataKeys);

      const updatedMetadataPrivateKeyDto = JSON.parse(JSON.stringify(metadataPrivateKeysDto[0]));
      updatedMetadataPrivateKeyDto.data = pgpKeys.metadataKey.encryptedSignedMetadataPrivateKeyDataMessage;
      updatedMetadataPrivateKeyDto.modified = (new Date()).toISOString();
      updatedMetadataPrivateKeyDto.modified_by = account.userId;
      jest.spyOn(service.updateMetadataKeyPrivateService.metadataPrivateKeyApiService, "update").mockImplementationOnce(() => updatedMetadataPrivateKeyDto);
      jest.spyOn(service.metadataKeysSessionStorage, "updatePrivateKey");

      await service.trust(metadataKey.metadataPrivateKeys.items[0], "ada@passbolt.com");

      trustedMetadataKey = await service.trustedMetadataKeyLocalStorage.get();
      const metadataKeyDtosInSessionStorage = await service.metadataKeysSessionStorage.get();

      expect(trustedMetadataKey).not.toBeUndefined();
      expect(trustedMetadataKey.fingerprint).toEqual(metadataKey.fingerprint);
      expect(trustedMetadataKey.signed).toBeDefined();
      expect(metadataKeyDtosInSessionStorage[0].metadata_private_keys[0].data_signed_by_current_user).toStrictEqual(trustedMetadataKey.signed);
      expect(metadataKeyDtosInSessionStorage[0].metadata_private_keys[0].modified).toStrictEqual(updatedMetadataPrivateKeyDto.modified);
      expect(metadataKeyDtosInSessionStorage[0].metadata_private_keys[0].modified_by).toStrictEqual(account.userId);
    });

    it("if private metadata key data already signed: only pin the key", async() => {
      expect.assertions(6);

      let trustedMetadataKey = await service.trustedMetadataKeyLocalStorage.get();
      expect(trustedMetadataKey).toBeUndefined();

      const id = uuidv4();
      const fingerprint = pgpKeys.metadataKey.fingerprint;
      const metadataPrivateKeysDto = [decryptedMetadataPrivateKeyDto({metadata_key_id: id, user_id: account.userId, data_signed_by_current_user: (new Date()).toISOString()})];
      const metadataKeyDto = defaultMetadataKeyDto({id: id, fingerprint: fingerprint, metadata_private_keys: metadataPrivateKeysDto});
      const metadataKey = new MetadataKeyEntity(metadataKeyDto);
      const metadataKeys = new MetadataKeysCollection([metadataKeyDto]);
      service.metadataKeysSessionStorage.set(metadataKeys);

      jest.spyOn(service.updateMetadataKeyPrivateService.metadataPrivateKeyApiService, "update").mockImplementationOnce(jest.fn);
      jest.spyOn(service.metadataKeysSessionStorage, "updatePrivateKey");

      await service.trust(metadataKey.metadataPrivateKeys.items[0], "ada@passbolt.com");

      trustedMetadataKey = await service.trustedMetadataKeyLocalStorage.get();

      expect(service.updateMetadataKeyPrivateService.metadataPrivateKeyApiService.update).not.toHaveBeenCalled();
      expect(service.metadataKeysSessionStorage.updatePrivateKey).not.toHaveBeenCalled();
      expect(trustedMetadataKey).not.toBeUndefined();
      expect(trustedMetadataKey.fingerprint).toEqual(metadataKey.fingerprint);
      expect(trustedMetadataKey.signed).toBeDefined();
    });

    it("throws if the metadata private key parameter is not valid.", async() => {
      expect.assertions(1);
      await expect(() => service.trust({})).rejects.toThrow("The parameter `metadataPrivateKey` should be of type MetadataPrivateKeyEntity.");
    });

    it("throws if the passphrase parameter is not valid.", async() => {
      expect.assertions(1);
      const metadataPrivateKey = new MetadataPrivateKeyEntity(decryptedMetadataPrivateKeyDto());
      await expect(() => service.trust(metadataPrivateKey, 42)).rejects.toThrow("The `passphrase` parameter should be a string.");
    });

    it("throws if the metadata private key data is encrypted.", async() => {
      expect.assertions(1);
      const metadataPrivateKey = new MetadataPrivateKeyEntity(defaultMetadataPrivateKeyDto());
      await expect(() => service.trust(metadataPrivateKey, "passphrase")).rejects.toThrow("The metadata private key should be decrypted.");
    });
  });
});
