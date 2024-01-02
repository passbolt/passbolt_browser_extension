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
 * @since         4.4.0
 */

import {enableFetchMocks} from "jest-fetch-mock";
import {mockApiResponse, mockApiResponseError} from "../../../../../test/mocks/mockApiResponse";
import {defaultApiClientOptions} from "../../service/api/apiClient/apiClientOptions.test.data";
import RoleEntity from "passbolt-styleguide/src/shared/models/entity/role/roleEntity";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import UpdateUserController from "./updateUserController";
import {defaultUserDto} from "passbolt-styleguide/src/shared/models/entity/user/userEntity.test.data";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import PassboltApiFetchError from "passbolt-styleguide/src/shared/lib/Error/PassboltApiFetchError";
import UserEntity from "../../model/entity/user/userEntity";

beforeEach(() => {
  enableFetchMocks();
});

describe("UpdateUserController", () => {
  describe("::exec", () => {
    const accountDto = defaultAccountDto();
    accountDto.role_name = RoleEntity.ROLE_ADMIN;
    const account = new AccountEntity(accountDto);

    it("Should update the user given the DTO", async() => {
      expect.assertions(2);

      const expectedDto = defaultUserDto({
        "disabled": new Date().toISOString().split('.')[0],
      });

      const expectedRequestDto = JSON.parse(JSON.stringify(expectedDto));
      delete expectedRequestDto.role;
      delete expectedRequestDto.profile.avatar;

      fetch.doMockOnceIf(new RegExp(`/users/${expectedDto.id}.json`), async req => {
        const body = JSON.parse(await req.text());
        expect(body).toStrictEqual(expectedRequestDto);
        return mockApiResponse(expectedDto);
      });

      const controller = new UpdateUserController(null, null, defaultApiClientOptions(), account);
      const resultingEntity = await controller.exec(expectedDto);
      expect(resultingEntity).toStrictEqual(new UserEntity(expectedDto));
    });

    it("Should throw an error if the user entity cannot validate", async() => {
      expect.assertions(1);

      const wrongDto = defaultUserDto({
        "disabled": true,
      });

      const controller = new UpdateUserController(null, null, defaultApiClientOptions(), account);
      try {
        await controller.exec(wrongDto);
      } catch (e) {
        expect(e).toBeInstanceOf(EntityValidationError);
      }
    });

    it("Should throw an error if something wrong happens on the API", async() => {
      expect.assertions(1);

      const dto = defaultUserDto();
      fetch.doMockOnceIf(new RegExp(`/users/${dto.id}.json`), async() => mockApiResponseError(500, "Something went wrong"));

      const controller = new UpdateUserController(null, null, defaultApiClientOptions(), account);
      try {
        await controller.exec(dto);
      } catch (e) {
        expect(e).toBeInstanceOf(PassboltApiFetchError);
      }
    });
  });
});
