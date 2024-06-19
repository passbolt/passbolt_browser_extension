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

import {enableFetchMocks} from "jest-fetch-mock";
import {mockApiResponse} from "../../../../../../test/mocks/mockApiResponse";
import {defaultGroupSearchResultDto, defaultUserSearchResultDto} from "../../../model/entity/userAndGroupSearchResultEntity/userAndGroupSearchResultEntity.test.data";
import ShareService from "./shareService";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";

beforeEach(() => {
  jest.clearAllMocks();
  enableFetchMocks();
});

describe("ShareService", () => {
  describe("::searchUsersAndGroups", () => {
    it("should return a collection dto from the API", async() => {
      expect.assertions(1);
      const expectedDto = [
        defaultUserSearchResultDto(),
        defaultGroupSearchResultDto(),
      ];
      const contains = {
        profile: true,
        user_count: true,
      };
      fetch.doMockOnceIf(/share\/search-aros\.json/, () => mockApiResponse(expectedDto));

      const keyword = "test";
      const service = new ShareService(defaultApiClientOptions());
      const resultDto = await service.searchUsersAndGroups(keyword, contains);

      expect(resultDto).toStrictEqual(expectedDto);
    });

    it("should set only the right filters and contains", async() => {
      expect.assertions(4);
      const expectedDto = [
        defaultUserSearchResultDto(),
        defaultGroupSearchResultDto(),
      ];
      const contains = {
        profile: true,
        user_count: true,
        unsupported_contain: true,
      };
      fetch.doMockOnceIf(/share\/search-aros\.json/, async request => {
        const url = new URL(request.url);
        expect(url.searchParams.get('contain[profile]')).toStrictEqual('1');
        expect(url.searchParams.get('contain[user_count]')).toStrictEqual('1');
        expect(url.searchParams.has('contain[unsupported_contain]')).toStrictEqual(false);
        return await mockApiResponse(expectedDto);
      });

      const keyword = "test";
      const service = new ShareService(defaultApiClientOptions());
      const resultDto = await service.searchUsersAndGroups(keyword, contains);

      expect(resultDto).toStrictEqual(expectedDto);
    });

    it("should throw an excpetion if the search keyword is empty", async() => {
      expect.assertions(1);

      const service = new ShareService(defaultApiClientOptions());
      try {
        await service.searchUsersAndGroups(1, {});
      } catch (e) {
        expect(e).toStrictEqual(new Error("keyword is not a valid string"));
      }
    });
  });
});
