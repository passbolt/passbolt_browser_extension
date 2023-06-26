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

import {enableFetchMocks} from "jest-fetch-mock";
import {mockApiResponse} from "../../../../../test/mocks/mockApiResponse";
import {defaultApiClientOptions} from "../../service/api/apiClient/apiClientOptions.test.data";
import {defaultUserDto} from "passbolt-styleguide/src/shared/models/entity/user/userEntity.test.data";
import GetOrFindLoggedInUserController from "./getOrFindLoggedInUserController";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import UserEntity from "../../model/entity/user/userEntity";
import UserMeSessionStorageService from "../../service/sessionStorage/userMeSessionStorageService";

beforeEach(() => {
  enableFetchMocks();
  fetch.resetMocks();
});

describe("GetOrFindLoggedInUserController", () => {
  describe("GetOrFindLoggedInUserController::exec", () => {
    it("Should find the information and set the cache if cache is empty.", async() => {
      expect.assertions(5);
      const account = new AccountEntity(defaultAccountDto());

      const mockApiResult = defaultUserDto();
      fetch.doMock(() => mockApiResponse(mockApiResult));

      expect(await UserMeSessionStorageService.get(account)).toBeNull();

      const controller = new GetOrFindLoggedInUserController(null, null, defaultApiClientOptions(), account);
      const userMe = await controller.exec();

      expect(userMe).toBeInstanceOf(UserEntity);
      const cachedUsedMe = await UserMeSessionStorageService.get(account);
      expect(cachedUsedMe).not.toBeNull();
      expect(cachedUsedMe.id).toEqual(mockApiResult.id);
      expect(fetch).toHaveBeenCalled();
    });

    it("Should return cached data if any.", async() => {
      expect.assertions(3);
      const account = new AccountEntity(defaultAccountDto());

      // Populate the cache
      await UserMeSessionStorageService.set(account, new UserEntity(defaultUserDto()));
      expect(await UserMeSessionStorageService.get(account)).not.toBeNull();

      const controller = new GetOrFindLoggedInUserController(null, null, defaultApiClientOptions(), account);
      const userMe = await controller.exec();

      expect(userMe).toBeInstanceOf(UserEntity);
      expect(fetch).not.toHaveBeenCalled();
    });

    it("Should refresh the cache if enforced.", async() => {
      expect.assertions(7);
      const account = new AccountEntity(defaultAccountDto());

      // Populate the cache
      await UserMeSessionStorageService.set(account, new UserEntity(defaultUserDto()));
      expect(await UserMeSessionStorageService.get(account)).not.toBeNull();
      // Spy on the cache set function
      jest.spyOn(UserMeSessionStorageService, 'set');
      // Mock the API response
      const mockApiResult = defaultUserDto();
      fetch.doMock(() => mockApiResponse(mockApiResult));

      expect(await UserMeSessionStorageService.get(account)).not.toBeNull();

      const controller = new GetOrFindLoggedInUserController(null, null, defaultApiClientOptions(), account);
      const userMe = await controller.exec(true);

      expect(userMe).toBeInstanceOf(UserEntity);
      const cachedUsedMe = await UserMeSessionStorageService.get(account);
      expect(cachedUsedMe).not.toBeNull();
      expect(cachedUsedMe.id).toEqual(mockApiResult.id);
      expect(fetch).toHaveBeenCalled();
      expect(UserMeSessionStorageService.set).toHaveBeenCalled();
    });
  });
});
