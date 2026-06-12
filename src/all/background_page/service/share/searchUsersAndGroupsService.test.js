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
 * @since         5.13.0
 */
import { enableFetchMocks } from "jest-fetch-mock";
import { mockApiResponse } from "../../../../../test/mocks/mockApiResponse";
import SearchUsersAndGroupsService from "./searchUsersAndGroupsService";
import UserAndGroupSearchResultsCollection from "../../model/entity/userAndGroupSearchResultEntity/userAndGroupSearchResultCollection";
import {
  defaultUserSearchResultDto,
  defaultGroupSearchResultDto,
} from "../../model/entity/userAndGroupSearchResultEntity/userAndGroupSearchResultEntity.test.data";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";

beforeEach(() => {
  jest.clearAllMocks();
  enableFetchMocks();
});

describe("SearchUsersAndGroupsService", () => {
  describe("::search", () => {
    it("should call the API with the right parameters and return a UserAndGroupSearchResultsCollection", async () => {
      expect.assertions(5);

      const serverResponseDto = [defaultUserSearchResultDto(), defaultGroupSearchResultDto()];
      const searchedKeyword = "test";

      fetch.doMockOnceIf(/share\/search-aros\.json/, async (request) => {
        const url = new URL(request.url);
        expect(url.searchParams.get("filter[search]")).toStrictEqual(searchedKeyword);
        expect(url.searchParams.get("contain[profile]")).toStrictEqual("1");
        expect(url.searchParams.get("contain[user_count]")).toStrictEqual("1");
        return await mockApiResponse(serverResponseDto);
      });

      const service = new SearchUsersAndGroupsService(defaultApiClientOptions());
      const result = await service.search(searchedKeyword);

      expect(result).toBeInstanceOf(UserAndGroupSearchResultsCollection);
      expect(result).toStrictEqual(new UserAndGroupSearchResultsCollection(serverResponseDto));
    });

    it("should throw an error if the keyword is not a valid string", async () => {
      expect.assertions(1);

      const service = new SearchUsersAndGroupsService(defaultApiClientOptions());

      try {
        await service.search(1);
      } catch (e) {
        expect(e).toStrictEqual(new Error("keyword is not a valid string"));
      }
    });
  });
});
