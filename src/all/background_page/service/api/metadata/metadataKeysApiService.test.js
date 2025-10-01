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

import {enableFetchMocks} from "jest-fetch-mock";
import {mockApiResponse} from '../../../../../../test/mocks/mockApiResponse';
import AccountEntity from "../../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../../model/entity/account/accountEntity.test.data";
import BuildApiClientOptionsService from "../../account/buildApiClientOptionsService";
import {mockApiResponseError} from "passbolt-styleguide/test/mocks/mockApiResponse";
import PassboltApiFetchError from "passbolt-styleguide/src/shared/lib/Error/PassboltApiFetchError";
import PassboltServiceUnavailableError from "passbolt-styleguide/src/shared/lib/Error/PassboltServiceUnavailableError";
import {defaultMetadataKeyDto} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeyEntity.test.data";
import MetadataKeysApiService from "./metadataKeysApiService";
import MetadataKeyEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeyEntity";
import {v4 as uuidv4} from "uuid";
import RevokeGpgKeyService from "../../crypto/revokeGpgKeyService";
import {decryptedMetadataPrivateKeyDto} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataPrivateKeyEntity.test.data";
import {OpenpgpAssertion} from "../../../utils/openpgp/openpgpAssertions";

describe("MetadataKeysApiService", () => {
  let apiClientOptions, account;
  beforeEach(async() => {
    enableFetchMocks();
    fetch.resetMocks();
    account = new AccountEntity(defaultAccountDto());
    apiClientOptions = BuildApiClientOptionsService.buildFromAccount(account);
  });

  describe('::findAll', () => {
    it("retrieves the settings from API", async() => {
      expect.assertions(2);

      const apiMetadataKeysCollection = [defaultMetadataKeyDto()];
      fetch.doMockOnceIf(/metadata\/keys/, () => mockApiResponse(apiMetadataKeysCollection));

      const service = new MetadataKeysApiService(apiClientOptions, account);
      const resultDto = await service.findAll();

      expect(resultDto).toBeInstanceOf(Array);
      expect(resultDto).toHaveLength(apiMetadataKeysCollection.length);
    });

    it("throws API error if the API encountered an issue", async() => {
      expect.assertions(1);
      fetch.doMockOnceIf(/metadata\/keys/, () => mockApiResponseError(500, "Something wrong happened!"));

      const service = new MetadataKeysApiService(apiClientOptions);

      await expect(() => service.findAll()).rejects.toThrow(PassboltApiFetchError);
    });

    it("throws service unavailable error if an error occurred but not from the API (by instance cloudflare)", async() => {
      expect.assertions(1);
      fetch.doMockOnceIf(/metadata\/keys/, () => { throw new Error("Service unavailable"); });

      const service = new MetadataKeysApiService(apiClientOptions);

      await expect(() => service.findAll()).rejects.toThrow(PassboltServiceUnavailableError);
    });
  });

  describe('::create', () => {
    it("Create a metadata key on the API.", async() => {
      expect.assertions(5);

      const dto = defaultMetadataKeyDto({}, {withMetadataPrivateKeys: true});
      const metadataKey = new MetadataKeyEntity(dto);
      let reqPayload;
      fetch.doMockOnceIf(/metadata\/keys/, async req => {
        expect(req.method).toEqual("POST");
        reqPayload = await req.json();
        return mockApiResponse(defaultMetadataKeyDto(reqPayload));
      });

      const service = new MetadataKeysApiService(apiClientOptions);
      const resultDto = await service.create(metadataKey);

      expect(resultDto).toEqual(expect.objectContaining(dto));
      expect(reqPayload).toEqual(expect.objectContaining(dto));
      expect(reqPayload.metadata_private_keys).not.toBeUndefined();
      expect(reqPayload.metadata_private_keys).toEqual(dto.metadata_private_keys);
    });

    it("throws an invalid parameter error if the metadata key parameter is not valid", async() => {
      expect.assertions(1);

      const service = new MetadataKeysApiService(apiClientOptions);

      await expect(() => service.create(42)).rejects.toThrow(TypeError);
    });
  });

  describe('::delete', () => {
    it("should delete the metadata key with the given id from the API", async() => {
      expect.assertions(2);
      const expectedId = uuidv4();
      fetch.doMockOnceIf(new RegExp(`/metadata\/keys\/${expectedId}\.json`), async req => {
        expect(req.method).toEqual("DELETE");
        return mockApiResponse({});
      });

      const service = new MetadataKeysApiService(apiClientOptions);
      await expect(service.delete(expectedId)).resolves.not.toThrow();
    });

    it("should throw an error if the metadata key is not a valid id", async() => {
      expect.assertions(1);

      const service = new MetadataKeysApiService(apiClientOptions);
      const promise = service.delete("not a uuid");
      await expect(promise).rejects.toThrowError("The given parameter is not a valid UUID");
    });

    it("should throw an error if the API returns an error response", async() => {
      expect.assertions(2);

      const expectedId = uuidv4();
      fetch.doMockOnceIf(/metadata\/keys/, () => mockApiResponseError(500, "Something went wrong!"));

      const service = new MetadataKeysApiService(apiClientOptions);
      const promise = service.delete(expectedId);
      await expect(promise).rejects.toThrow(PassboltApiFetchError);
      await expect(promise).rejects.toThrowError("Something went wrong!");
    });

    it("should throw an error if the API returns an error response", async() => {
      expect.assertions(2);

      const expectedId = uuidv4();
      fetch.doMockOnceIf(/metadata\/keys/, () => { throw new Error("Service unavailable"); });

      const service = new MetadataKeysApiService(apiClientOptions);
      const promise = service.delete(expectedId);
      await expect(promise).rejects.toThrow(PassboltServiceUnavailableError);
      await expect(promise).rejects.toThrowError("Unable to reach the server, an unexpected error occurred");
    });
  });

  describe('::update', () => {
    it("should update and expired the metadata key with the given id from the API", async() => {
      expect.assertions(1);
      const expectedId = uuidv4();
      const metadataPrivateKeysDto = [decryptedMetadataPrivateKeyDto({metadata_key_id: expectedId, user_id: account.userId})];
      const metadataKeyDto = defaultMetadataKeyDto({id: expectedId, metadata_private_keys: metadataPrivateKeysDto});
      const metadataKey = new MetadataKeyEntity(metadataKeyDto);
      const metadataPrivateKeyToRevoke = metadataKey.metadataPrivateKeys.items[0];
      const privateKeyToRevoke = await OpenpgpAssertion.readKeyOrFail(metadataPrivateKeyToRevoke.data.armoredKey);
      const publicKeyRevoked = await RevokeGpgKeyService.revoke(privateKeyToRevoke);
      const metadataKeyUpdated = new MetadataKeyEntity({
        fingerprint: metadataKey.fingerprint,
        armored_key: publicKeyRevoked.armor(),
        expired: new Date().toISOString()
      });
      fetch.doMockOnceIf(/metadata\/keys/, () => mockApiResponse({}));

      const service = new MetadataKeysApiService(apiClientOptions);
      await expect(service.update(expectedId, metadataKeyUpdated)).resolves.not.toThrow();
    });

    it("should throw an error if the metadata key is not a valid id", async() => {
      expect.assertions(1);

      const service = new MetadataKeysApiService(apiClientOptions);
      const promise = service.update("not a uuid");
      await expect(promise).rejects.toThrowError("The given parameter is not a valid UUID");
    });

    it("should throw an error if the metadata data is empty", async() => {
      expect.assertions(1);

      const service = new MetadataKeysApiService(apiClientOptions);
      const promise = service.update(uuidv4(), null);
      await expect(promise).rejects.toThrow(TypeError);
    });

    it("should throw an error if the API returns an error response", async() => {
      expect.assertions(2);

      const expectedId = uuidv4();
      const metadataKeyDto = defaultMetadataKeyDto({id: expectedId});
      const metadataKey = new MetadataKeyEntity(metadataKeyDto);
      fetch.doMockOnceIf(/metadata\/keys/, () => mockApiResponseError(500, "Something went wrong!"));

      const service = new MetadataKeysApiService(apiClientOptions);
      const promise = service.update(expectedId, metadataKey);
      await expect(promise).rejects.toThrow(PassboltApiFetchError);
      await expect(promise).rejects.toThrowError("Something went wrong!");
    });

    it("should throw an error if the API returns an error response", async() => {
      expect.assertions(2);

      const expectedId = uuidv4();
      const metadataKeyDto = defaultMetadataKeyDto({id: expectedId});
      const metadataKey = new MetadataKeyEntity(metadataKeyDto);
      fetch.doMockOnceIf(/metadata\/keys/, () => { throw new Error("Service unavailable"); });

      const service = new MetadataKeysApiService(apiClientOptions);
      const promise = service.update(expectedId, metadataKey);
      await expect(promise).rejects.toThrow(PassboltServiceUnavailableError);
      await expect(promise).rejects.toThrowError("Unable to reach the server, an unexpected error occurred");
    });
  });
});
