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
import {enableFetchMocks} from "jest-fetch-mock";
import {mockApiResponse} from '../../../../../../test/mocks/mockApiResponse';
import AccountEntity from "../../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../../model/entity/account/accountEntity.test.data";
import BuildApiClientOptionsService from "../../account/buildApiClientOptionsService";
import {decryptedMetadataPrivateKeyDto, defaultMetadataPrivateKeyDto} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataPrivateKeyEntity.test.data";
import MetadataPrivateKeyApiService from "./metadataPrivateKeyApiService";
import MetadataPrivateKeyEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataPrivateKeyEntity";
import {shareMetadataPrivateKeysWithDecryptedKeyDtos, shareMetadataPrivateKeysWithEncryptedKeyDtos} from "../../../model/entity/metadata/shareMetadataPrivateKeysCollection.test.data";
import ShareMetadataPrivateKeysCollection from "../../../model/entity/metadata/shareMetadataPrivateKeysCollection";

describe("metadataPrivateKeyApiService", () => {
  let apiClientOptions;
  beforeEach(async() => {
    enableFetchMocks();
    fetch.resetMocks();
    const account = new AccountEntity(defaultAccountDto());
    apiClientOptions = BuildApiClientOptionsService.buildFromAccount(account);
  });

  describe('::update', () => {
    it("Save the new metadata private key on the API.", async() => {
      expect.assertions(2);

      const encryptedMetadataPrivateKeyDto = defaultMetadataPrivateKeyDto();

      fetch.doMockOnceIf(new RegExp(`/metadata/keys/private/${encryptedMetadataPrivateKeyDto.id}`), async req => {
        expect(req.method).toEqual("PUT");
        return mockApiResponse(encryptedMetadataPrivateKeyDto);
      });

      const entity = new MetadataPrivateKeyEntity(encryptedMetadataPrivateKeyDto);
      const service = new MetadataPrivateKeyApiService(apiClientOptions);
      const resultDto = await service.update(entity);

      expect(resultDto).toEqual(encryptedMetadataPrivateKeyDto);
    });

    it("throws an invalid parameter error if the settings parameter is not valid", async() => {
      expect.assertions(1);

      const service = new MetadataPrivateKeyApiService(apiClientOptions);

      await expect(() => service.update(42)).rejects.toThrow(TypeError);
    });

    it("throws an error if the metadata private key is decrypted", async() => {
      expect.assertions(1);

      const decryptedMetadataPrivateKey = decryptedMetadataPrivateKeyDto();
      const entity = new MetadataPrivateKeyEntity(decryptedMetadataPrivateKey);

      const service = new MetadataPrivateKeyApiService(apiClientOptions);

      await expect(() => service.update(entity)).rejects.toThrow(Error);
    });
  });

  describe('::create', () => {
    it("Share the metadata private keys with the user on the API.", async() => {
      expect.assertions(1);

      const shareMetadataPrivateKeysDtos = shareMetadataPrivateKeysWithEncryptedKeyDtos();

      fetch.doMockOnceIf(new RegExp(`/metadata/keys/private`), async req => {
        expect(req.method).toEqual("POST");
        return mockApiResponse(shareMetadataPrivateKeysDtos);
      });

      const entity = new ShareMetadataPrivateKeysCollection(shareMetadataPrivateKeysDtos);
      const service = new MetadataPrivateKeyApiService(apiClientOptions);
      await service.create(entity);
    });

    it("throws an invalid parameter error if the settings parameter is not valid", async() => {
      expect.assertions(1);

      const service = new MetadataPrivateKeyApiService(apiClientOptions);

      await expect(() => service.create(42)).rejects.toThrow(TypeError);
    });

    it("throws an error if the metadataPrivateKey is decrypted", async() => {
      expect.assertions(1);

      const decryptedMetadataPrivateKey = shareMetadataPrivateKeysWithDecryptedKeyDtos();
      const entity = new ShareMetadataPrivateKeysCollection(decryptedMetadataPrivateKey);

      const service = new MetadataPrivateKeyApiService(apiClientOptions);

      await expect(() => service.create(entity)).rejects.toThrow(Error);
    });
  });
});
