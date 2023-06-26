/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.12.0
 */

import {enableFetchMocks} from "jest-fetch-mock";
import {mockApiResponse} from "../../../../../test/mocks/mockApiResponse";
import {defaultApiClientOptions} from "../../service/api/apiClient/apiClientOptions.test.data";
import UpdateUserLocalStorageController from "./updateUserLocalStorageController";
import RoleEntity from "passbolt-styleguide/src/shared/models/entity/role/roleEntity";
import AccountEntity from "../../model/entity/account/accountEntity";
import {adminAccountDto, defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";

beforeEach(() => {
  enableFetchMocks();
});

describe("UpdateUserLocalStorageController", () => {
  describe("UpdateUserLocalStorageController::exec", () => {
    it("Should update the user local storage for a user having a role user.", async() => {
      expect.assertions(1);


      fetch.doMockOnceIf(new RegExp(`/users.json`), async req => {
        const url = new URL(req.url);
        expect(url.search).toStrictEqual("?api-version=v2&contain%5Bprofile%5D=1&contain%5Bgpgkey%5D=0&contain%5Bgroups_users%5D=0&contain%5Bpending_account_recovery_request%5D=1&contain%5Baccount_recovery_user_setting%5D=1&contain%5BLastLoggedIn%5D=1");
        return mockApiResponse([]);
      });
      const account = defaultAccountDto();
      account.role_name = RoleEntity.ROLE_USER;
      const accountEntity = new AccountEntity(account);
      const controller = new UpdateUserLocalStorageController(null, null, defaultApiClientOptions(), accountEntity);
      await controller.exec();
    });

    it("Should update the user local storage for a user having a role admin.", async() => {
      expect.assertions(1);


      fetch.doMockOnceIf(new RegExp(`/users.json`), async req => {
        const url = new URL(req.url);
        expect(url.search).toStrictEqual("?api-version=v2&contain%5Bprofile%5D=1&contain%5Bgpgkey%5D=0&contain%5Bgroups_users%5D=0&contain%5Bpending_account_recovery_request%5D=1&contain%5Baccount_recovery_user_setting%5D=1&contain%5Bis_mfa_enabled%5D=1&contain%5BLastLoggedIn%5D=1");
        return mockApiResponse([]);
      });

      const account = adminAccountDto();
      account.role_name = RoleEntity.ROLE_ADMIN;
      const accountEntity = new AccountEntity(account);
      const controller = new UpdateUserLocalStorageController(null, null, defaultApiClientOptions(), accountEntity);
      await controller.exec();
    });
  });
});
