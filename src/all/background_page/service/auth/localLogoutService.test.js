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
 * @since         5.18.0
 */

import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import LocalLogoutService from "./localLogoutService";
import OfflineLogoutService from "./offlineLogoutService";
import SessionCookieFlushService from "./sessionCookieFlushService";
import AccountEntity from "../../model/entity/account/accountEntity";
import { defaultAccountDto } from "../../model/entity/account/accountEntity.test.data";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("LocalLogoutService", () => {
  const account = new AccountEntity(defaultAccountDto());

  describe("LocalLogoutService::exec", () => {
    it("removes the session cookies, then signs the user out as an offline logout does", async () => {
      expect.assertions(1);
      const calls = [];
      jest
        .spyOn(SessionCookieFlushService.prototype, "flush")
        .mockImplementation(async () => calls.push("flushCookies"));
      jest.spyOn(OfflineLogoutService.prototype, "exec").mockImplementation(async () => calls.push("offlineLogout"));

      await new LocalLogoutService(account, defaultApiClientOptions()).exec();

      expect(calls).toEqual(["flushCookies", "offlineLogout"]);
    });
  });
});
