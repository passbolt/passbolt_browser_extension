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
import OfflineLogoutService from "./offlineLogoutService";
import PostLogoutService from "./postLogoutService";
import FindAndUpdateActiveSessionLocalStorageService from "../activeSession/findAndUpdateActiveSessionLocalStorageService";
import OfflineSessionExpiryAlarmService from "./offlineSessionExpiryAlarmService";
import AccountEntity from "../../model/entity/account/accountEntity";
import { defaultAccountDto } from "../../model/entity/account/accountEntity.test.data";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("OfflineLogoutService", () => {
  const account = new AccountEntity(defaultAccountDto());

  describe("OfflineLogoutService::exec", () => {
    it("marks the active session as signed out, clears the offline alarm, then runs the post-logout cleanup", async () => {
      expect.assertions(1);
      const calls = [];
      jest
        .spyOn(FindAndUpdateActiveSessionLocalStorageService.prototype, "resetAuthentication")
        .mockImplementation(async () => calls.push("resetAuthentication"));
      jest
        .spyOn(OfflineSessionExpiryAlarmService, "clearAlarm")
        .mockImplementation(async () => calls.push("clearAlarm"));
      jest.spyOn(PostLogoutService, "exec").mockImplementation(async () => calls.push("postLogout"));

      await new OfflineLogoutService(account, defaultApiClientOptions()).exec();
      expect(calls).toEqual(["resetAuthentication", "clearAlarm", "postLogout"]);
    });
  });
});
