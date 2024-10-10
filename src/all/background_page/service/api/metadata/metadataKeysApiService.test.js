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
});
