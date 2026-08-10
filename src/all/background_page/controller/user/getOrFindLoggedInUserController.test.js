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

import { enableFetchMocks } from "jest-fetch-mock";
import { mockApiResponse } from "../../../../../test/mocks/mockApiResponse";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import { defaultUserDto } from "passbolt-styleguide/src/shared/models/entity/user/userEntity.test.data";
import GetOrFindLoggedInUserController from "./getOrFindLoggedInUserController";
import AccountEntity from "../../model/entity/account/accountEntity";
import { defaultAccountDto } from "../../model/entity/account/accountEntity.test.data";
import UserEntity from "../../model/entity/user/userEntity";
import UserMeLocalStorage from "../../service/local_storage/userMeLocalStorage";

beforeEach(() => {
  enableFetchMocks();
  fetch.resetMocks();
});

describe("GetOrFindLoggedInUserController", () => {
  describe("GetOrFindLoggedInUserController::exec", () => {
    it("Should find the information and set the cache if cache is empty.", async () => {
      expect.assertions(5);
      const account = new AccountEntity(defaultAccountDto());
      const storage = new UserMeLocalStorage(account);
      const mockApiResult = defaultUserDto();
      fetch.doMock(() => mockApiResponse(mockApiResult));

      expect(await storage.getData()).toBeUndefined();

      const controller = new GetOrFindLoggedInUserController(null, null, defaultApiClientOptions(), account);
      const userMe = await controller.exec();

      expect(userMe).toBeInstanceOf(UserEntity);
      const cachedUsedMe = await storage.getData();
      expect(cachedUsedMe).not.toBeNull();
      expect(cachedUsedMe.id).toEqual(mockApiResult.id);
      expect(fetch).toHaveBeenCalled();

      await storage.flush();
    });

    it("Should return cached data if any.", async () => {
      expect.assertions(3);
      const account = new AccountEntity(defaultAccountDto());
      const storage = new UserMeLocalStorage(account);
      // Populate the cache
      await storage.setData(new UserEntity(defaultUserDto()));
      expect(await storage.getData()).not.toBeNull();

      const controller = new GetOrFindLoggedInUserController(null, null, defaultApiClientOptions(), account);
      const userMe = await controller.exec();

      expect(userMe).toBeInstanceOf(UserEntity);
      expect(fetch).not.toHaveBeenCalled();

      await storage.flush();
    });

    it("Should refresh the cache if enforced.", async () => {
      expect.assertions(7);
      const account = new AccountEntity(defaultAccountDto());
      const storage = new UserMeLocalStorage(account);
      // Populate the cache
      await storage.setData(new UserEntity(defaultUserDto()));
      expect(await storage.getData()).not.toBeNull();
      // Mock the API response
      const mockApiResult = defaultUserDto();
      fetch.doMock(() => mockApiResponse(mockApiResult));

      expect(await storage.getData()).not.toBeNull();

      const controller = new GetOrFindLoggedInUserController(null, null, defaultApiClientOptions(), account);
      // Spy on the cache set function
      jest.spyOn(controller.getOrFindMeService.userMeLocalStorageService, "setData");
      const userMe = await controller.exec(true);

      expect(userMe).toBeInstanceOf(UserEntity);
      const cachedUsedMe = await storage.getData();
      expect(cachedUsedMe).not.toBeNull();
      expect(cachedUsedMe.id).toEqual(mockApiResult.id);
      expect(fetch).toHaveBeenCalled();
      expect(controller.getOrFindMeService.userMeLocalStorageService.setData).toHaveBeenCalled();
    });
  });
});
