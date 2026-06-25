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
 * @since         6.0.0
 */

import { defaultUserDto } from "passbolt-styleguide/src/shared/models/entity/user/userEntity.test.data";
import AccountEntity from "../../model/entity/account/accountEntity";
import { defaultAccountDto } from "../../model/entity/account/accountEntity.test.data";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import UserMeLocalStorage from "../local_storage/userMeLocalStorage";
import GetOrFindMeService from "./getOrFindMeService";
import UserEntity from "../../model/entity/user/userEntity";

describe("GetOrFindMeService", () => {
  let service, account, storage;

  beforeEach(async () => {
    jest.clearAllMocks();
    account = new AccountEntity(defaultAccountDto());
    service = new GetOrFindMeService(account, defaultApiClientOptions());
    storage = new UserMeLocalStorage(account);
    await storage.flush();
  });

  describe("::getOrFindMe", () => {
    it("returns the user me from the local storage on hot cache without get service.", async () => {
      expect.assertions(2);
      const usersDto = defaultUserDto();
      await storage.setData(new UserEntity(usersDto));
      jest.spyOn(service.userApiService, "get");

      const result = await service.getOrFindMe();

      expect(service.userApiService.get).not.toHaveBeenCalled();
      expect(result.toDto(storage.DEFAULT_CONTAIN)).toEqual(new UserEntity(usersDto).toDto(storage.DEFAULT_CONTAIN));
    });

    it("delegates to the get service on cold cache and returns its result.", async () => {
      expect.assertions(2);
      const usersDto = defaultUserDto();
      const expected = new UserEntity(usersDto);
      jest.spyOn(service.userApiService, "get").mockImplementation(() => expected);

      const result = await service.getOrFindMe();

      expect(service.userApiService.get).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual(expected);
    });
  });
});
