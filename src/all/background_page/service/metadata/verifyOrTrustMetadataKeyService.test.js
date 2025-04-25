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
import {
  defaultMetadataTrustedKeyDto
} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTrustedKeyEntity.test.data";
import MetadataTrustedKeyEntity
  from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTrustedKeyEntity";
import MetadataKeyEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeyEntity";
import {defaultMetadataKeyDto} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeyEntity.test.data";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import MetadataKeysSessionStorage from "../session_storage/metadataKeysSessionStorage";
import MetadataKeysCollection from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysCollection";
import {v4 as uuidv4} from "uuid";
import MockExtension from "../../../../../test/mocks/mockExtension";
import VerifyOrTrustMetadataKeyService from "./verifyOrTrustMetadataKeyService";
import UntrustedMetadataKeyError from "../../error/UntrustedMetadataKeyError";

describe("VerifyOrTrustMetadataKeyService", () => {
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

  describe('::verifyTrustedOrTrustNewMetadataKey', () => {
    it("Should update trusted metadata key local storage with the trusted key information without confirmation", async() => {
      expect.assertions(7);

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

      const service = new VerifyOrTrustMetadataKeyService(null, account, apiClientOptions);
      jest.spyOn(service.confirmMetadataKeyContentCodeService, "requestConfirm");
      await service.verifyTrustedOrTrustNewMetadataKey("ada@passbolt.com");

      trustedMetadataKey = await storage.get();
      const metadataKeysDtos = await metadataKeysSessionStorage.get();

      expect(trustedMetadataKey).not.toBeUndefined();
      expect(trustedMetadataKey.fingerprint).toEqual(metadataKeyEntity.fingerprint);
      expect(trustedMetadataKey.signed).toBeDefined();
      expect(metadataKeysSessionStorage.update).toHaveBeenCalled();
      expect(metadataKeysDtos[0].metadata_private_keys[0].data_signed_by_current_user).toBeDefined();
      expect(service.confirmMetadataKeyContentCodeService.requestConfirm).not.toHaveBeenCalled();
    });

    it("Should not update trusted metadata key local storage with the trusted key information if metadata key already trusted", async() => {
      expect.assertions(6);

      const metadataKeyTrusted = new MetadataTrustedKeyEntity(defaultMetadataTrustedKeyDto());
      await storage.set(metadataKeyTrusted);

      const id = uuidv4();
      const metadata_private_keys = [decryptedMetadataPrivateKeyDto({metadata_key_id: id, user_id: account.userId})];
      metadata_private_keys[0].data.fingerprint = metadataKeyTrusted.fingerprint;
      const metadataKeyDto = defaultMetadataKeyDto({id: id, metadata_private_keys: metadata_private_keys, fingerprint: metadataKeyTrusted.fingerprint});
      const metadataKeyEntity = new MetadataKeyEntity(metadataKeyDto);
      metadataKeyEntity.metadataPrivateKeys.items[0].isDataSignedByCurrentUser = metadataKeyTrusted.signed;
      const metadataKeysCollection = new MetadataKeysCollection([metadataKeyDto]);
      metadataKeysCollection.getFirstByLatestCreated().metadataPrivateKeys.items[0].isDataSignedByCurrentUser = metadataKeyTrusted.signed;
      metadataKeysSessionStorage.set(metadataKeysCollection);

      jest.spyOn(MetadataPrivateKeyApiService.prototype, "update").mockImplementationOnce(() => pgpKeys.metadataKey.encryptedSignedMetadataPrivateKeyDataMessage);
      jest.spyOn(MetadataKeysSessionStorage.prototype, "update");

      const service = new VerifyOrTrustMetadataKeyService(null, account, apiClientOptions);
      jest.spyOn(service.confirmMetadataKeyContentCodeService, "requestConfirm").mockImplementationOnce(() => true);
      jest.spyOn(service.trustMetadataKeyService.updateMetadataKeyPrivateService, "update");
      await service.verifyTrustedOrTrustNewMetadataKey("ada@passbolt.com");

      const trustedMetadataKey = await storage.get();
      const metadataKeysDtos = await metadataKeysSessionStorage.get();

      expect(trustedMetadataKey).not.toBeUndefined();
      expect(trustedMetadataKey).toStrictEqual(metadataKeyTrusted.toDto());
      !expect(metadataKeysSessionStorage.update).not.toHaveBeenCalledWith(metadataKeyEntity);
      expect(metadataKeysDtos[0].metadata_private_keys[0].data_signed_by_current_user).toBeDefined();
      expect(service.confirmMetadataKeyContentCodeService.requestConfirm).not.toHaveBeenCalled();
      expect(service.trustMetadataKeyService.updateMetadataKeyPrivateService.update).not.toHaveBeenCalled();
    });

    it("Should update trusted metadata key local storage with the trusted key information with user confirmation", async() => {
      expect.assertions(7);

      const metadataKeyTrusted = new MetadataTrustedKeyEntity(defaultMetadataTrustedKeyDto());
      await storage.set(metadataKeyTrusted);

      const id = uuidv4();
      const metadata_private_keys = [decryptedMetadataPrivateKeyDto({metadata_key_id: id, user_id: account.userId})];
      metadata_private_keys[0].data.fingerprint = metadataKeyTrusted.fingerprint;
      const metadataKeyDto = defaultMetadataKeyDto({id: id, metadata_private_keys: metadata_private_keys, fingerprint: metadataKeyTrusted.fingerprint});
      const metadataKeyEntity = new MetadataKeyEntity(metadataKeyDto);
      const metadataKeysCollection = new MetadataKeysCollection([metadataKeyDto]);
      metadataKeysSessionStorage.set(metadataKeysCollection);

      jest.spyOn(MetadataPrivateKeyApiService.prototype, "update").mockImplementationOnce(() => pgpKeys.metadataKey.encryptedSignedMetadataPrivateKeyDataMessage);
      jest.spyOn(MetadataKeysSessionStorage.prototype, "update");

      const service = new VerifyOrTrustMetadataKeyService(null, account, apiClientOptions);
      jest.spyOn(service.confirmMetadataKeyContentCodeService, "requestConfirm").mockImplementationOnce(() => true);
      jest.spyOn(service.trustMetadataKeyService.updateMetadataKeyPrivateService, "update");
      await service.verifyTrustedOrTrustNewMetadataKey("ada@passbolt.com");

      const trustedMetadataKey = await storage.get();
      const metadataKeysDtos = await metadataKeysSessionStorage.get();

      expect(trustedMetadataKey).not.toBeUndefined();
      expect(trustedMetadataKey.fingerprint).toEqual(metadataKeyEntity.fingerprint);
      expect(trustedMetadataKey.signed).toBeDefined();
      expect(metadataKeysSessionStorage.update).toHaveBeenCalled();
      expect(metadataKeysDtos[0].metadata_private_keys[0].data_signed_by_current_user).toBeDefined();
      expect(service.confirmMetadataKeyContentCodeService.requestConfirm).toHaveBeenCalled();
      expect(service.trustMetadataKeyService.updateMetadataKeyPrivateService.update).toHaveBeenCalled();
    });

    it("Should not update trusted metadata key local storage with the trusted key information with user confirmation", async() => {
      expect.assertions(7);

      const metadataKeyTrusted = new MetadataTrustedKeyEntity(defaultMetadataTrustedKeyDto());
      await storage.set(metadataKeyTrusted);

      const id = uuidv4();
      const metadata_private_keys = [decryptedMetadataPrivateKeyDto({metadata_key_id: id, user_id: account.userId})];
      metadata_private_keys[0].data.fingerprint = metadataKeyTrusted.fingerprint;
      const metadataKeyDto = defaultMetadataKeyDto({id: id, metadata_private_keys: metadata_private_keys, fingerprint: metadataKeyTrusted.fingerprint});
      const metadataKeysCollection = new MetadataKeysCollection([metadataKeyDto]);
      metadataKeysSessionStorage.set(metadataKeysCollection);

      jest.spyOn(MetadataPrivateKeyApiService.prototype, "update").mockImplementationOnce(() => pgpKeys.metadataKey.encryptedSignedMetadataPrivateKeyDataMessage);
      jest.spyOn(MetadataKeysSessionStorage.prototype, "update");

      const service = new VerifyOrTrustMetadataKeyService(null, account, apiClientOptions);
      jest.spyOn(service.confirmMetadataKeyContentCodeService, "requestConfirm").mockImplementationOnce(() => false);
      jest.spyOn(service.trustMetadataKeyService.updateMetadataKeyPrivateService, "update");

      try {
        await service.verifyTrustedOrTrustNewMetadataKey("ada@passbolt.com");
      } catch (error) {
        const trustedMetadataKey = await storage.get();
        const metadataKeysDtos = await metadataKeysSessionStorage.get();
        expect(trustedMetadataKey).not.toBeUndefined();
        expect(trustedMetadataKey).toStrictEqual(metadataKeyTrusted.toDto());
        expect(metadataKeysSessionStorage.update).not.toHaveBeenCalled();
        expect(metadataKeysDtos[0].metadata_private_keys[0].data_signed_by_current_user).toBeNull();
        expect(service.confirmMetadataKeyContentCodeService.requestConfirm).toHaveBeenCalled();
        expect(service.trustMetadataKeyService.updateMetadataKeyPrivateService.update).not.toHaveBeenCalled();
        expect(error).toStrictEqual(new UntrustedMetadataKeyError("The user has not confirmed the new metadata key"));
      }
    });
  });
});
