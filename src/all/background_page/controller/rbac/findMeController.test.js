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
 * @since         4.1.0
 */

import {mockApiResponse} from "../../../../../test/mocks/mockApiResponse";
import FindMeController from "./findMeController";
import {
  userSettingsRbacsCollectionData
} from "passbolt-styleguide/src/shared/models/entity/rbac/rbacsCollection.test.data";
import rbacEntity from "passbolt-styleguide/src/shared/models/entity/rbac/rbacEntity";
import RbacsCollection from "passbolt-styleguide/src/shared/models/entity/rbac/rbacsCollection";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {enableFetchMocks} from "jest-fetch-mock";
import {defaultApiClientOptions} from "../../service/api/apiClient/apiClientOptions.test.data";

beforeEach(() => {
  enableFetchMocks();
});

describe("FindMeController", () => {
  describe("FindMeController::exec", () => {
    it("Should retrieve the rbacs that apply to the user.", async() => {
      const account = new AccountEntity(defaultAccountDto());

      // Mock API fetch account recovery organization policy response.
      const mockApiResult = userSettingsRbacsCollectionData();
      fetch.doMock(() => mockApiResponse(mockApiResult));

      const controller = new FindMeController(null, null, defaultApiClientOptions(), account);
      const rbacsCollection = await controller.exec();

      expect.assertions(2);
      expect(rbacsCollection).toBeInstanceOf(RbacsCollection);
      const rbacsDto = rbacsCollection.toDto(rbacEntity.ALL_CONTAIN_OPTIONS);
      await expect(rbacsDto).toEqual(mockApiResult);
    });
  });
});
