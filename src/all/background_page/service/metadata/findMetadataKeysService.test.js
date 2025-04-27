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
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import PassphraseStorageService from "../session_storage/passphraseStorageService";
import BuildApiClientOptionsService from "../account/buildApiClientOptionsService";
import FindMetadataKeysService from "./findMetadataKeysService";
import {mockApiResponseError} from "passbolt-styleguide/test/mocks/mockApiResponse";
import PassboltApiFetchError from "passbolt-styleguide/src/shared/lib/Error/PassboltApiFetchError";
import PassboltServiceUnavailableError from "passbolt-styleguide/src/shared/lib/Error/PassboltServiceUnavailableError";
import {defaultMetadataKeyDto} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeyEntity.test.data";
import MetadataKeysCollection from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysCollection";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import {decryptedMetadataPrivateKeyDto, defaultMetadataPrivateKeyDto} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataPrivateKeyEntity.test.data";
import {v4 as uuidv4} from "uuid";
import {
  defaultMetadataKeysDtos
} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysCollection.test.data";
import CollectionValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/collectionValidationError";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";

describe("FindMetadataKeysApiService", () => {
  let apiClientOptions, account;
  beforeEach(async() => {
    enableFetchMocks();
    fetch.resetMocks();
    account = new AccountEntity(defaultAccountDto());
    apiClientOptions = BuildApiClientOptionsService.buildFromAccount(account);
  });

  describe('::findAll', () => {
    it("retrieves the settings from API", async() => {
      expect.assertions(5);

      const spyOnPassphraseStorage = jest.spyOn(PassphraseStorageService, "get");
      spyOnPassphraseStorage.mockImplementation(() => pgpKeys.ada.passphrase);

      const id = uuidv4();
      const metadata_private_keys = [defaultMetadataPrivateKeyDto({metadata_key_id: id, data: pgpKeys.metadataKey.encryptedMetadataPrivateKeyDataMessage})];
      const fingerprint = "c0dce0aaea4d8cce961c26bddfb6e74e598f025c";
      const apiMetadataKeysCollection = [defaultMetadataKeyDto({id, metadata_private_keys, fingerprint})];

      const service = new FindMetadataKeysService(apiClientOptions, account);
      const spyOnFindService = jest.spyOn(service.metadataKeysApiService, "findAll");
      spyOnFindService.mockImplementation(() => apiMetadataKeysCollection);
      const resultDto = await service.findAll();

      expect(resultDto).toBeInstanceOf(MetadataKeysCollection);
      expect(resultDto).toHaveLength(apiMetadataKeysCollection.length);
      expect(resultDto.hasEncryptedKeys()).toStrictEqual(false);
      expect(spyOnFindService).toHaveBeenCalledTimes(1);
      expect(spyOnFindService).toHaveBeenCalledWith({}, {});
    });

    it("throw an error if fingerprint is not matching with the armored public key", async() => {
      expect.assertions(2);

      const spyOnPassphraseStorage = jest.spyOn(PassphraseStorageService, "get");
      spyOnPassphraseStorage.mockImplementation(() => pgpKeys.ada.passphrase);

      const id = uuidv4();
      const metadata_private_keys = [defaultMetadataPrivateKeyDto({metadata_key_id: id, data: pgpKeys.metadataKey.encryptedMetadataPrivateKeyDataMessage})];
      const fingerprint = "c0dce0aaea4d8cce961c26bddfb6e74e598f025d";
      const apiMetadataKeysCollection = [defaultMetadataKeyDto({id, metadata_private_keys, fingerprint})];

      const service = new FindMetadataKeysService(apiClientOptions, account);
      const spyOnFindService = jest.spyOn(service.metadataKeysApiService, "findAll");
      spyOnFindService.mockImplementation(() => apiMetadataKeysCollection);
      try {
        await service.findAll();
      } catch (error) {
        const entityValidationError = new EntityValidationError();
        entityValidationError.addError('metadata_public_keys.0.fingerprint', 'fingerprint_match', 'The fingerprint of the metadata armored public key does not match the entity fingerprint');
        const collectionValidationError = new CollectionValidationError();
        collectionValidationError.addItemValidationError(0, entityValidationError);

        expect(error).toBeInstanceOf(CollectionValidationError);
        expect(error).toEqual(collectionValidationError);
      }
    });

    it("throws an error if the keys from the API is already decrypted", async() => {
      expect.assertions(1);

      const spyOnPassphraseStorage = jest.spyOn(PassphraseStorageService, "get");
      spyOnPassphraseStorage.mockImplementation(() => pgpKeys.ada.passphrase);

      const id = uuidv4();
      const metadata_private_keys = [decryptedMetadataPrivateKeyDto({metadata_key_id: id})];
      const apiMetadataKeysCollection = [defaultMetadataKeyDto({id, metadata_private_keys})];

      const service = new FindMetadataKeysService(apiClientOptions, account);
      const spyOnFindService = jest.spyOn(service.metadataKeysApiService, "findAll");
      spyOnFindService.mockImplementation(() => apiMetadataKeysCollection);

      const expectedError = new Error("The metadata private keys should not be decrypted.");
      await expect(() => service.findAll()).rejects.toThrow(expectedError);
    });

    it("throws API error if the API encountered an issue", async() => {
      expect.assertions(1);
      fetch.doMockOnceIf(/metadata\/keys/, () => mockApiResponseError(500, "Something wrong happened!"));

      const service = new FindMetadataKeysService(apiClientOptions);

      await expect(() => service.findAll()).rejects.toThrow(PassboltApiFetchError);
    });

    it("throws service unavailable error if an error occurred but not from the API (by instance cloudflare)", async() => {
      expect.assertions(1);
      fetch.doMockOnceIf(/metadata\/keys/, () => { throw new Error("Service unavailable"); });

      const service = new FindMetadataKeysService(apiClientOptions);

      await expect(() => service.findAll()).rejects.toThrow(PassboltServiceUnavailableError);
    });

    it("throws an error if the given contains are not supported", async() => {
      expect.assertions(1);

      const service = new FindMetadataKeysService(apiClientOptions);
      const fakeContains = {wrongOne: true};

      const expectedError = new Error("Unsupported contains parameter used, please check supported contains");

      await expect(() => service.findAll(fakeContains)).rejects.toThrow(expectedError);
    });

    it("throws an error if the given filters are not supported", async() => {
      expect.assertions(1);

      const service = new FindMetadataKeysService(apiClientOptions);
      const filters = {wrongOne: true};

      const expectedError = new Error("Unsupported filter parameter used, please check supported filters");

      await expect(() => service.findAll({}, filters)).rejects.toThrow(expectedError);
    });
  });

  describe('::findAllForSessionStorage', () => {
    it("retrieves the metadata keys from API with the right contains", async() => {
      expect.assertions(5);

      const spyOnPassphraseStorage = jest.spyOn(PassphraseStorageService, "get");
      spyOnPassphraseStorage.mockImplementation(() => pgpKeys.ada.passphrase);

      const id = uuidv4();
      const metadata_private_keys = [defaultMetadataPrivateKeyDto({metadata_key_id: id, data: pgpKeys.metadataKey.encryptedMetadataPrivateKeyDataMessage})];
      const fingerprint = "c0dce0aaea4d8cce961c26bddfb6e74e598f025c";
      const apiMetadataKeysCollection = [defaultMetadataKeyDto({id, metadata_private_keys, fingerprint})];

      const service = new FindMetadataKeysService(apiClientOptions, account);
      const spyOnFindService = jest.spyOn(service.metadataKeysApiService, "findAll");
      spyOnFindService.mockImplementation(() => apiMetadataKeysCollection);
      const resultDto = await service.findAllForSessionStorage();

      expect(resultDto).toBeInstanceOf(MetadataKeysCollection);
      expect(resultDto).toHaveLength(apiMetadataKeysCollection.length);
      expect(resultDto.hasEncryptedKeys()).toStrictEqual(false);
      expect(spyOnFindService).toHaveBeenCalledTimes(1);
      expect(spyOnFindService).toHaveBeenCalledWith({metadata_private_keys: true, creator: true, "creator.profile": true}, {deleted: false});
    });

    it("throws an error if the keys from the API is already decrypted", async() => {
      expect.assertions(1);

      const spyOnPassphraseStorage = jest.spyOn(PassphraseStorageService, "get");
      spyOnPassphraseStorage.mockImplementation(() => pgpKeys.ada.passphrase);

      const id = uuidv4();
      const metadata_private_keys = [decryptedMetadataPrivateKeyDto({metadata_key_id: id})];
      const apiMetadataKeysCollection = [defaultMetadataKeyDto({id, metadata_private_keys})];

      const service = new FindMetadataKeysService(apiClientOptions, account);
      const spyOnFindService = jest.spyOn(service.metadataKeysApiService, "findAll");
      spyOnFindService.mockImplementation(() => apiMetadataKeysCollection);

      const expectedError = new Error("The metadata private keys should not be decrypted.");
      await expect(() => service.findAllForSessionStorage()).rejects.toThrow(expectedError);
    });

    it("throws API error if the API encountered an issue", async() => {
      expect.assertions(1);
      fetch.doMockOnceIf(/metadata\/keys/, () => mockApiResponseError(500, "Something wrong happened!"));

      const service = new FindMetadataKeysService(apiClientOptions);

      await expect(() => service.findAllForSessionStorage()).rejects.toThrow(PassboltApiFetchError);
    });

    it("throws service unavailable error if an error occurred but not from the API (by instance cloudflare)", async() => {
      expect.assertions(1);
      fetch.doMockOnceIf(/metadata\/keys/, () => { throw new Error("Service unavailable"); });

      const service = new FindMetadataKeysService(apiClientOptions);

      await expect(() => service.findAllForSessionStorage()).rejects.toThrow(PassboltServiceUnavailableError);
    });
  });

  describe('::findAllNonDeleted', () => {
    it("retrieves metadata keys from API with the right filter", async() => {
      expect.assertions(3);

      const apiMetadataKeysCollection = defaultMetadataKeysDtos();
      const service = new FindMetadataKeysService(apiClientOptions, account);
      jest.spyOn(service, "findAll")
        .mockImplementation(() => new MetadataKeysCollection(apiMetadataKeysCollection));

      const metadataKeys = await service.findAllNonDeleted();

      expect(metadataKeys).toBeInstanceOf(MetadataKeysCollection);
      expect(metadataKeys).toHaveLength(apiMetadataKeysCollection.length);
      expect(service.findAll).toHaveBeenCalledWith({}, {deleted: false});
    });
  });
});
