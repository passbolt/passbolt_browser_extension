/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         4.9.0
 */

import {enableFetchMocks} from "jest-fetch-mock";
import {defaultGroupsDtos} from "../../model/entity/group/groupsCollection.test.data";
import {mockApiResponse} from "../../../../../test/mocks/mockApiResponse";
import FindMyGroupsController from "./findMyGroupsController";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import GroupsCollection from "../../model/entity/group/groupsCollection";
import MockExtension from "../../../../../test/mocks/mockExtension";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import FindGroupsService from "../../service/group/findGroupsService";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";

describe("FindMyGroupsController", () => {
  let controller;

  beforeEach(() => {
    enableFetchMocks();
    jest.resetModules();
    const account = new AccountEntity(defaultAccountDto());
    const apiClientOptions = defaultApiClientOptions();
    controller = new FindMyGroupsController(null, null, apiClientOptions, account);
  });

  describe("FindMyGroupsController::exec", () => {
    it("Should return groups the current user is member of", async() => {
      expect.assertions(3);
      const userInfo = pgpKeys.ada;
      await MockExtension.withConfiguredAccount(userInfo);

      const usersGroups = defaultGroupsDtos();

      fetch.doMockOnceIf(/groups.json/, async request => {
        const url = new URL(request.url);
        const hasUsers = url.searchParams.get("filter[has-users]");

        expect(hasUsers).toStrictEqual(userInfo.userId);
        return await mockApiResponse(usersGroups);
      });

      jest.spyOn(FindGroupsService.prototype, "findMyGroups");
      const result = await controller.exec();

      expect(result).toStrictEqual(new GroupsCollection(usersGroups));
      expect(FindGroupsService.prototype.findMyGroups).toHaveBeenCalled();
    });
  });
});
