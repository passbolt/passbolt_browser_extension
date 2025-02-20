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
 * @since         4.12.0
 */

import {enableFetchMocks} from "jest-fetch-mock";
import {mockApiResponseWithPagination} from '../../../../../../test/mocks/mockApiResponse';
import AccountEntity from "../../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../../model/entity/account/accountEntity.test.data";
import BuildApiClientOptionsService from "../../account/buildApiClientOptionsService";
import {mockApiResponseError} from "passbolt-styleguide/test/mocks/mockApiResponse";
import PassboltApiFetchError from "passbolt-styleguide/src/shared/lib/Error/PassboltApiFetchError";
import PassboltServiceUnavailableError from "passbolt-styleguide/src/shared/lib/Error/PassboltServiceUnavailableError";
import {defaultResourceDtosCollection} from "passbolt-styleguide/src/shared/models/entity/resource/resourcesCollection.test.data";
import MigrateMetadataResourcesApiService from "./migrateMetadataResourcesApiService";
import PassboltResponseEntity from "passbolt-styleguide/src/shared/models/entity/apiService/PassboltResponseEntity";

describe("migrateMetadataResourcesApiService", () => {
  let apiClientOptions;
  beforeEach(async() => {
    enableFetchMocks();
    fetch.resetMocks();
    const account = new AccountEntity(defaultAccountDto());
    apiClientOptions = BuildApiClientOptionsService.buildFromAccount(account);
  });

  describe('::findAll', () => {
    it("retrieves the settings from API", async() => {
      expect.assertions(5);
      const pageCount = 5;
      const resourcesCollection = defaultResourceDtosCollection();
      fetch.doMockOnceIf(/metadata\/upgrade\/resources\.json/, () => mockApiResponseWithPagination(resourcesCollection, {}, pageCount));

      const service = new MigrateMetadataResourcesApiService(apiClientOptions);
      const result = await service.findAll();

      expect(result).toBeInstanceOf(PassboltResponseEntity);
      const pagination = result._header._pagination;
      expect(pagination._props.page).toStrictEqual(1);
      expect(pagination._props.count).toStrictEqual(resourcesCollection.length);
      expect(pagination._props.limit).toStrictEqual(pageCount * resourcesCollection.length);
      expect(result._props.body).toStrictEqual(resourcesCollection);
    });

    it("throws API error if the API encountered an issue", async() => {
      expect.assertions(1);
      fetch.doMockOnceIf(/metadata\/upgrade\/resources\.json/, () => mockApiResponseError(500, "Something wrong happened!"));

      const service = new MigrateMetadataResourcesApiService(apiClientOptions);

      await expect(() => service.findAll()).rejects.toThrow(PassboltApiFetchError);
    });

    it("throws service unavailable error if an error occurred but not from the API (by instance cloudflare)", async() => {
      expect.assertions(1);
      fetch.doMockOnceIf(/metadata\/upgrade\/resources\.json/, () => { throw new Error("Service unavailable"); });

      const service = new MigrateMetadataResourcesApiService(apiClientOptions);

      await expect(() => service.findAll()).rejects.toThrow(PassboltServiceUnavailableError);
    });
  });
});
