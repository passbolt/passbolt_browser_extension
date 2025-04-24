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
import {defaultMetadataPrivateKeyDto} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataPrivateKeyEntity.test.data";
import MetadataPrivateKeyApiService from "./metadataPrivateKeyApiService";
import MetadataPrivateKeyEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataPrivateKeyEntity";

describe("metadataPrivateKeyApiService", () => {
  let apiClientOptions;
  beforeEach(async() => {
    enableFetchMocks();
    fetch.resetMocks();
    const account = new AccountEntity(defaultAccountDto());
    apiClientOptions = BuildApiClientOptionsService.buildFromAccount(account);
  });

  describe('::update', () => {
    it("Save the new metadata key on the API.", async() => {
      expect.assertions(2);

      const encryptedMetadataPrivateKey = defaultMetadataPrivateKeyDto();

      fetch.doMockOnceIf(new RegExp(`/metadata/keys/private/${encryptedMetadataPrivateKey.id}`), async req => {
        expect(req.method).toEqual("PUT");
        return mockApiResponse(encryptedMetadataPrivateKey);
      });

      const entity = new MetadataPrivateKeyEntity(encryptedMetadataPrivateKey);
      const service = new MetadataPrivateKeyApiService(apiClientOptions);
      const resultDto = await service.update(entity);

      expect(resultDto).toEqual(encryptedMetadataPrivateKey.data);
    });

    it("throws an invalid parameter error if the settings parameter is not valid", async() => {
      expect.assertions(1);

      const service = new MetadataPrivateKeyApiService(apiClientOptions);

      await expect(() => service.update(42)).rejects.toThrow(TypeError);
    });
  });
});
