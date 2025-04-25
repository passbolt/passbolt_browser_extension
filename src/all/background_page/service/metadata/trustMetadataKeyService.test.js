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
import {decryptedMetadataPrivateKeyDto} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataPrivateKeyEntity.test.data";
import MetadataPrivateKeyApiService from "../api/metadata/metadataPrivateKeyApiService";
import TrustedMetadataKeyLocalStorage from "../local_storage/trustedMetadataKeyLocalStorage";
import TrustMetadataKeyService from "./trustMetadataKeyService";
import MetadataKeyEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeyEntity";
import {defaultMetadataKeyDto} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeyEntity.test.data";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import MetadataKeysSessionStorage from "../session_storage/metadataKeysSessionStorage";
import MetadataKeysCollection from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysCollection";
import {v4 as uuidv4} from "uuid";
import MockExtension from "../../../../../test/mocks/mockExtension";

describe("TrustMetadataKeyService", () => {
  let account, storage, apiClientOptions, metadataKeysSessionStorage;
  beforeEach(async() => {
    jest.clearAllMocks();
    account = new AccountEntity(defaultAccountDto());
    await MockExtension.withConfiguredAccount();
    apiClientOptions = BuildApiClientOptionsService.buildFromAccount(account);
    storage = new TrustedMetadataKeyLocalStorage(account);
    metadataKeysSessionStorage = new MetadataKeysSessionStorage(account);
    // flush account related storage before each.
    await storage.flush();
    await metadataKeysSessionStorage.flush();
  });

  describe('::trust', () => {
    it("Should update trusted metadata key local storage with the trusted key information", async() => {
      expect.assertions(8);

      let trustedMetadataKey = await storage.get();
      expect(trustedMetadataKey).toBeUndefined();

      const id = uuidv4();
      const metadata_private_keys = [decryptedMetadataPrivateKeyDto({metadata_key_id: id, user_id: account.userId})];
      const metadataKeyDto = defaultMetadataKeyDto({id, metadata_private_keys});
      const metadataKeyEntity = new MetadataKeyEntity(metadataKeyDto);
      const metadataKeysCollection = new MetadataKeysCollection([metadataKeyDto]);
      metadataKeysSessionStorage.set(metadataKeysCollection);

      jest.spyOn(MetadataPrivateKeyApiService.prototype, "update").mockImplementationOnce(() => pgpKeys.metadataKey.encryptedSignedMetadataPrivateKeyDataMessage);
      jest.spyOn(MetadataKeysSessionStorage.prototype, "update");

      const service = new TrustMetadataKeyService(account, apiClientOptions);
      await service.trust(metadataKeyEntity, "ada@passbolt.com");

      trustedMetadataKey = await storage.get();
      const metadataKeysDtos = await metadataKeysSessionStorage.get();

      expect(trustedMetadataKey).not.toBeUndefined();
      expect(trustedMetadataKey.fingerprint).toEqual(metadataKeyEntity.fingerprint);
      expect(trustedMetadataKey.signed).toBeDefined();
      expect(metadataKeysSessionStorage.update).toHaveBeenCalledWith(metadataKeyEntity);
      expect(metadataKeysDtos[0].metadata_private_keys[0].data_signed_by_current_user).toBeDefined();
      expect(metadataKeysDtos[0].metadata_private_keys[0].modified).toBeDefined();
      expect(metadataKeysDtos[0].metadata_private_keys[0].modifiedBy).toStrictEqual(account.userId);
    });

    it("Should not update trusted metadata key local storage with the trusted key information if private key is encrypted", async() => {
      expect.assertions(4);

      let trustedMetadataKey = await storage.get();
      expect(trustedMetadataKey).toBeUndefined();

      const metadataKeyDto = defaultMetadataKeyDto({}, {withMetadataPrivateKeys: true});
      const metadataKeyEntity = new MetadataKeyEntity(metadataKeyDto);

      jest.spyOn(MetadataKeysSessionStorage.prototype, "get").mockImplementationOnce(() => [metadataKeyDto]);
      jest.spyOn(MetadataKeysSessionStorage.prototype, "update");

      const service = new TrustMetadataKeyService(account, apiClientOptions);
      await service.trust(metadataKeyEntity, "ada@passbolt.com");

      trustedMetadataKey = await storage.get();
      const metadataKeysDtos = await metadataKeysSessionStorage.get();

      expect(trustedMetadataKey).toBeUndefined();
      expect(metadataKeysSessionStorage.update).not.toHaveBeenCalled();
      expect(metadataKeysDtos[0].metadata_private_keys[0].data_signed_by_current_user).toBeNull();
    });
  });
});
