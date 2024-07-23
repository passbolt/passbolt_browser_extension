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

import ShareModel from "./shareModel";
import UserAndGroupSearchResultsCollection from "../entity/userAndGroupSearchResultEntity/userAndGroupSearchResultCollection";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import {defaultGroupSearchResultDto, defaultUserSearchResultDto} from "../entity/userAndGroupSearchResultEntity/userAndGroupSearchResultEntity.test.data";

jest.mock("../../service/local_storage/resourceLocalStorage");

describe("ShareModel", () => {
  describe('::search', () => {
    it("Should call for the service to update search for matching users and groups", async() => {
      expect.assertions(3);

      const collectionDto = [
        defaultUserSearchResultDto(),
        defaultGroupSearchResultDto(),
      ];
      const collection = new UserAndGroupSearchResultsCollection(collectionDto);

      const searchKeyword = "test";
      const expectedContains = {
        profile: true,
        user_count: true,
      };

      const model = new ShareModel(defaultApiClientOptions());
      jest.spyOn(model.shareService, "searchUsersAndGroups").mockImplementation((keyword, contains) => {
        expect(keyword).toStrictEqual(searchKeyword);
        expect(contains).toStrictEqual(expectedContains);
        return collection;
      });

      const result = await model.search(searchKeyword);
      expect(result).toStrictEqual(collection);
    });

    it("Should throw an Error if the keyword is not a valid string", async() => {
      expect.assertions(1);

      const model = new ShareModel(defaultApiClientOptions());
      try {
        await model.search(1);
      } catch (e) {
        expect(e).toStrictEqual(new Error("keyword is not a valid string"));
      }
    });
  });
});
