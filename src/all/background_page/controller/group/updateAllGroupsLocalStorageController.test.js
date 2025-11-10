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
 * @since         5.7.0
 */

import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import GroupsCollection from "../../model/entity/group/groupsCollection";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import UpdateAllGroupsLocalStorageController from "./updateAllGroupsLocalStorageController";
import FindAndUpdateGroupsLocalStorageService from "../../service/group/findAndUpdateGroupsLocalStorageService";
import {setupMockData} from "../../service/group/findGroupsService.test.data";

describe("UpdateAllGroupsLocalStorageController", () => {
  let controller;

  beforeEach(() => {
    jest.resetModules();
    const account = new AccountEntity(defaultAccountDto());
    const apiClientOptions = defaultApiClientOptions();
    controller = new UpdateAllGroupsLocalStorageController(null, null, apiClientOptions, account);
  });

  describe("UpdateAllGroupsLocalStorageController::exec", () => {
    it("Should call for the service to find groups and update the local storage", async() => {
      expect.assertions(2);

      const groupsDtos = setupMockData();
      const groupCollection = new GroupsCollection(groupsDtos);

      jest.spyOn(FindAndUpdateGroupsLocalStorageService.prototype, "findAndUpdateAll").mockResolvedValue(groupCollection);
      const result = await controller.exec();

      expect(result).toStrictEqual(groupCollection);
      expect(FindAndUpdateGroupsLocalStorageService.prototype.findAndUpdateAll).toHaveBeenCalled();
    });
  });
});
