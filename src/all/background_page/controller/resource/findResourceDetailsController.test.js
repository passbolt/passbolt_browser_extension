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

import FindResourceDetailsController from "./findResourceDetailsController";
import ResourceEntity from "../../model/entity/resource/resourceEntity";
import AccountEntity from "../../model/entity/account/accountEntity";
import {enableFetchMocks} from "jest-fetch-mock";
import {defaultResourceDto} from "passbolt-styleguide/src/shared/models/entity/resource/resourceEntity.test.data";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {defaultUserDto} from "passbolt-styleguide/src/shared/models/entity/user/userEntity.test.data";
import {mockApiResponse} from "../../../../../test/mocks/mockApiResponse";

beforeEach(() => {
  enableFetchMocks();
  jest.resetModules();
});

describe("FindResourceDetailsController", () => {
  describe("FindResourceDetailsController::exec", () => {
    it("Should return the resoruce matching the given id with all the necessary contains", async() => {
      expect.assertions(5);

      const expectedUser = defaultUserDto();
      const resource = defaultResourceDto({
        creator: expectedUser,
        modifier: expectedUser,
      });

      fetch.doMockOnceIf(new RegExp(`resources/${resource.id}.json`), async request => {
        const url = new URL(request.url);
        const containCreator = url.searchParams.get("contain[creator]");
        const containModifier = url.searchParams.get("contain[modifier]");

        expect(containCreator).toStrictEqual("1");
        expect(containModifier).toStrictEqual("1");
        return await mockApiResponse(resource);
      });


      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = defaultApiClientOptions();
      const controller = new FindResourceDetailsController(null, null, apiClientOptions, account);
      const result = await controller.exec(resource.id);

      expect(result).toStrictEqual(new ResourceEntity(resource));
      const dto = result.toDto();
      expect(dto.creator).toStrictEqual(expectedUser);
      expect(dto.modifier).toStrictEqual(expectedUser);
    });

    it("Should throw an error if the resource ID is not a valid UUID", async() => {
      expect.assertions(1);

      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = defaultApiClientOptions();
      const controller = new FindResourceDetailsController(null, null, apiClientOptions, account);
      const expectedError = new Error("The given parameter is not a valid UUID");
      try {
        await controller.exec("not a uuid");
      } catch (e) {
        expect(e).toStrictEqual(expectedError);
      }
    });
  });
});
