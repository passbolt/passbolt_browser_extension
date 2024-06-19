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
 * @since         4.9.0
 */

import SearchUsersAndGroupsController from "./searchUsersAndGroupsController";
import UserAndGroupSearchResultsCollection from "../../model/entity/userAndGroupSearchResultEntity/userAndGroupSearchResultCollection";
import {defaultUserSearchResultDto, defaultGroupSearchResultDto} from "../../model/entity/userAndGroupSearchResultEntity/userAndGroupSearchResultEntity.test.data";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import {enableFetchMocks} from "jest-fetch-mock";
import {mockApiResponse} from "../../../../../test/mocks/mockApiResponse";

jest.mock("../../service/progress/progressService");
jest.mock("../../service/passphrase/getPassphraseService");

beforeEach(() => {
  jest.clearAllMocks();
  enableFetchMocks();
});

describe("SearchUsersAndGroupsController", () => {
  describe("SearchUsersAndGroupsController::exec", () => {
    it("Request the API the right way and returns the a collection", async() => {
      expect.assertions(5);

      const serverResponseDto = [
        defaultUserSearchResultDto(),
        defaultGroupSearchResultDto(),
      ];

      const searchedKeyword = "test";

      fetch.doMockOnceIf(/share\/search-aros\.json/, async request => {
        const url = new URL(request.url);
        expect(url.searchParams.get('filter[search]')).toStrictEqual(searchedKeyword);
        expect(url.searchParams.get('contain[profile]')).toStrictEqual("1");
        expect(url.searchParams.get('contain[user_count]')).toStrictEqual("1");
        return await mockApiResponse(serverResponseDto);
      });

      const apiClientOptions = defaultApiClientOptions();
      const controller = new SearchUsersAndGroupsController(null, null, apiClientOptions);
      const result = await controller.exec(searchedKeyword);

      const expectedResult = new UserAndGroupSearchResultsCollection(serverResponseDto);

      expect(result).toBeInstanceOf(UserAndGroupSearchResultsCollection);
      expect(result).toStrictEqual(expectedResult);
    });

    it("should throw an error if the keyword is not a valid string", async() => {
      expect.assertions(1);

      const apiClientOptions = defaultApiClientOptions();
      const controller = new SearchUsersAndGroupsController(null, null, apiClientOptions);

      try {
        await controller.exec(1);
      } catch (e) {
        expect(e).toStrictEqual(new Error("keyword is not a valid string"));
      }
    });
  });
});
