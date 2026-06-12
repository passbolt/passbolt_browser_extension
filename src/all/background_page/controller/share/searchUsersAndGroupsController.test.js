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
import {
  defaultUserSearchResultDto,
  defaultGroupSearchResultDto,
} from "../../model/entity/userAndGroupSearchResultEntity/userAndGroupSearchResultEntity.test.data";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("SearchUsersAndGroupsController", () => {
  describe("SearchUsersAndGroupsController::exec", () => {
    it("should delegate to SearchUsersAndGroupsService and return the result", async () => {
      expect.assertions(3);

      const serverResponseDto = [defaultUserSearchResultDto(), defaultGroupSearchResultDto()];
      const expectedResult = new UserAndGroupSearchResultsCollection(serverResponseDto);
      const searchedKeyword = "test";

      const controller = new SearchUsersAndGroupsController(null, null, defaultApiClientOptions());
      jest.spyOn(controller.searchUsersAndGroupsService, "search").mockResolvedValue(expectedResult);

      const result = await controller.exec(searchedKeyword);

      expect(controller.searchUsersAndGroupsService.search).toHaveBeenCalledTimes(1);
      expect(controller.searchUsersAndGroupsService.search).toHaveBeenCalledWith(searchedKeyword);
      expect(result).toStrictEqual(expectedResult);
    });

    it("should throw an error if the keyword is not a valid string", async () => {
      expect.assertions(1);

      const controller = new SearchUsersAndGroupsController(null, null, defaultApiClientOptions());

      try {
        await controller.exec(1);
      } catch (e) {
        expect(e).toStrictEqual(new Error("keyword is not a valid string"));
      }
    });
  });
});
