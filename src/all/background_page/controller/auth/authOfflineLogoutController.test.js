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
 * @since         5.16.0
 */
import { v4 as uuid } from "uuid";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import AuthOfflineLogoutController from "./authOfflineLogoutController";
import PostLogoutService from "../../service/auth/postLogoutService";
import FindAndUpdateActiveSessionSessionStorageService from "../../service/activeSession/findAndUpdateActiveSessionSessionStorageService";
import AccountEntity from "../../model/entity/account/accountEntity";
import { defaultAccountDto } from "../../model/entity/account/accountEntity.test.data";
import OfflineSessionExpiryAlarmService from "../../service/auth/offlineSessionExpiryAlarmService";

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(FindAndUpdateActiveSessionSessionStorageService.prototype, "resetAuthentication").mockResolvedValue();
});

describe("AuthOfflineLogoutController", () => {
  const account = new AccountEntity(defaultAccountDto());

  describe("AuthOfflineLogoutController::exec", () => {
    it("marks the active session as signed out then runs the post-logout cleanup", async () => {
      expect.assertions(3);
      const postLogoutSpy = jest.spyOn(PostLogoutService, "exec").mockResolvedValue();
      const clearOfflineAlarmSpy = jest.spyOn(OfflineSessionExpiryAlarmService, "clearAlarm").mockResolvedValue();

      const controller = new AuthOfflineLogoutController(null, null, defaultApiClientOptions(), account);
      await controller.exec();

      expect(FindAndUpdateActiveSessionSessionStorageService.prototype.resetAuthentication).toHaveBeenCalledTimes(1);
      expect(postLogoutSpy).toHaveBeenCalledTimes(1);
      expect(clearOfflineAlarmSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("AuthOfflineLogoutController::_exec", () => {
    it("emits SUCCESS once exec resolves", async () => {
      expect.assertions(1);
      jest.spyOn(PostLogoutService, "exec").mockResolvedValue();
      const requestId = uuid();
      const worker = { port: { emit: jest.fn() } };

      const controller = new AuthOfflineLogoutController(worker, requestId, defaultApiClientOptions(), account);
      await controller._exec();

      expect(worker.port.emit).toHaveBeenCalledWith(requestId, "SUCCESS");
    });

    it("emits ERROR when PostLogoutService throws", async () => {
      expect.assertions(1);
      const error = new Error("flush failed");
      jest.spyOn(PostLogoutService, "exec").mockRejectedValue(error);
      jest.spyOn(console, "error").mockImplementation(() => {});
      const requestId = uuid();
      const worker = { port: { emit: jest.fn() } };

      const controller = new AuthOfflineLogoutController(worker, requestId, defaultApiClientOptions(), account);
      await controller._exec();

      expect(worker.port.emit).toHaveBeenCalledWith(requestId, "ERROR", error);
    });
  });
});
