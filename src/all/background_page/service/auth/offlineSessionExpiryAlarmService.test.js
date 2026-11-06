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
import OfflineSessionExpiryAlarmService from "./offlineSessionExpiryAlarmService";
import GetActiveAccountService from "../account/getActiveAccountService";
import BuildApiClientOptionsService from "../account/buildApiClientOptionsService";
import GetOrFindOfflineSettingsService from "../offline/getOrFindOfflineSettingsService";
import FindAndUpdateActiveSessionSessionStorageService from "../activeSession/findAndUpdateActiveSessionSessionStorageService";
import PassphraseStorageService from "../session_storage/passphraseStorageService";
import PostLogoutService from "./postLogoutService";
import toolbarService from "../toolbar/toolbarService";
import AccountEntity from "../../model/entity/account/accountEntity";
import { defaultAccountDto } from "../../model/entity/account/accountEntity.test.data";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import OfflineSettingsEntity from "passbolt-styleguide/src/shared/models/entity/offline/offlineSettingsEntity";
import { defaultOfflineSettingsDto } from "passbolt-styleguide/src/shared/models/entity/offline/offlineSettingsEntity.test.data";

jest.useFakeTimers();

let account;

beforeEach(async () => {
  jest.clearAllMocks();
  jest.clearAllTimers();
  await browser.alarms.clearAll();
  account = new AccountEntity(defaultAccountDto());
  jest.spyOn(BuildApiClientOptionsService, "buildFromAccount").mockReturnValue(defaultApiClientOptions());
});

afterEach(() => {
  // Restore spies so a mocked static (e.g. handleSessionExpiryAlarm) does not leak into the next test.
  jest.restoreAllMocks();
});

/**
 * Mock the offline settings returned by the GetOrFindOfflineSettingsService.
 * @param {object} dto The offline settings dto.
 * @returns {jest.SpyInstance}
 */
const mockOfflineSettings = (dto) =>
  jest.spyOn(GetOrFindOfflineSettingsService.prototype, "getOrFind").mockResolvedValue(new OfflineSettingsEntity(dto));

describe("OfflineSessionExpiryAlarmService", () => {
  describe("::ALARM_NAME", () => {
    it("returns the offline session expiry alarm name", () => {
      expect.assertions(1);
      expect(OfflineSessionExpiryAlarmService.ALARM_NAME).toBe("OfflineSessionExpiry");
    });
  });

  describe("::resolveSessionDuration", () => {
    it("returns the remember-me duration when it is within the max", () => {
      expect.assertions(1);
      expect(OfflineSessionExpiryAlarmService.resolveSessionDuration(300, 3600)).toBe(300);
    });

    it("returns the max when the remember-me duration equals the max", () => {
      expect.assertions(1);
      expect(OfflineSessionExpiryAlarmService.resolveSessionDuration(3600, 3600)).toBe(3600);
    });

    it("clamps to the max when the remember-me duration exceeds the max", () => {
      expect.assertions(1);
      expect(OfflineSessionExpiryAlarmService.resolveSessionDuration(86400, 3600)).toBe(3600);
    });

    it("falls back to the max for 'until logout' (-1)", () => {
      expect.assertions(1);
      expect(OfflineSessionExpiryAlarmService.resolveSessionDuration(-1, 3600)).toBe(3600);
    });
  });

  describe("::scheduleSessionExpiry", () => {
    it("schedules a one-shot alarm at the remember-me duration when it is within the max", async () => {
      expect.assertions(4);
      mockOfflineSettings(defaultOfflineSettingsDto({ max_session_duration: 3600 }));
      const spyOnClear = jest.spyOn(OfflineSessionExpiryAlarmService, "clearAlarm");
      const spyOnCreate = jest.spyOn(browser.alarms, "create");

      await OfflineSessionExpiryAlarmService.scheduleSessionExpiry(account, 300);

      expect(spyOnClear).toHaveBeenCalledTimes(1);
      expect(spyOnCreate).toHaveBeenCalledWith("OfflineSessionExpiry", { when: Date.now() + 300 * 1000 });
      const alarms = await browser.alarms.getAll();
      expect(alarms.length).toBe(1);
      expect(alarms[0].name).toBe("OfflineSessionExpiry");
    });

    it("clamps the alarm to the admin max session duration when the remember-me duration exceeds it", async () => {
      expect.assertions(1);
      mockOfflineSettings(defaultOfflineSettingsDto({ max_session_duration: 3600 }));
      const spyOnCreate = jest.spyOn(browser.alarms, "create");

      await OfflineSessionExpiryAlarmService.scheduleSessionExpiry(account, 86400);

      expect(spyOnCreate).toHaveBeenCalledWith("OfflineSessionExpiry", { when: Date.now() + 3600 * 1000 });
    });

    it("fires the expiry handler once the alarm elapses", async () => {
      expect.assertions(2);
      mockOfflineSettings(defaultOfflineSettingsDto({ max_session_duration: 3600 }));
      const spyOnHandler = jest.spyOn(OfflineSessionExpiryAlarmService, "handleSessionExpiryAlarm").mockResolvedValue();
      browser.alarms.onAlarm.addListener((alarm) => OfflineSessionExpiryAlarmService.handleSessionExpiryAlarm(alarm));

      await OfflineSessionExpiryAlarmService.scheduleSessionExpiry(account, 300);
      expect(spyOnHandler).not.toHaveBeenCalled();

      await jest.advanceTimersByTime(300 * 1000);
      expect(spyOnHandler).toHaveBeenCalledWith(expect.objectContaining({ name: "OfflineSessionExpiry" }));
    });
  });

  describe("::handleSessionExpiryAlarm", () => {
    it("resets the session authentication, notifies the workers, resets the toolbar and flushes the passphrase", async () => {
      expect.assertions(4);
      jest.spyOn(GetActiveAccountService, "get").mockResolvedValue(account);
      const spyOnResetAuthentication = jest
        .spyOn(FindAndUpdateActiveSessionSessionStorageService.prototype, "resetAuthentication")
        .mockResolvedValue();
      const spyOnSendLogout = jest.spyOn(PostLogoutService, "sendLogoutEventForWorkers").mockResolvedValue();
      const spyOnToolbar = jest.spyOn(toolbarService, "handleUserLoggedOut").mockImplementation(() => {});
      const spyOnPassphraseFlush = jest.spyOn(PassphraseStorageService, "flush").mockResolvedValue();

      await OfflineSessionExpiryAlarmService.handleSessionExpiryAlarm({ name: "OfflineSessionExpiry" });

      expect(spyOnResetAuthentication).toHaveBeenCalledTimes(1);
      expect(spyOnSendLogout).toHaveBeenCalledTimes(1);
      expect(spyOnToolbar).toHaveBeenCalledTimes(1);
      expect(spyOnPassphraseFlush).toHaveBeenCalledTimes(1);
    });

    it("does nothing when no account is configured", async () => {
      expect.assertions(3);
      jest
        .spyOn(GetActiveAccountService, "get")
        .mockRejectedValue(new Error("No account associated with this extension."));
      const spyOnResetAuthentication = jest.spyOn(
        FindAndUpdateActiveSessionSessionStorageService.prototype,
        "resetAuthentication",
      );
      const spyOnSendLogout = jest.spyOn(PostLogoutService, "sendLogoutEventForWorkers");
      const spyOnToolbar = jest.spyOn(toolbarService, "handleUserLoggedOut");

      await OfflineSessionExpiryAlarmService.handleSessionExpiryAlarm({ name: "OfflineSessionExpiry" });

      expect(spyOnResetAuthentication).not.toHaveBeenCalled();
      expect(spyOnSendLogout).not.toHaveBeenCalled();
      expect(spyOnToolbar).not.toHaveBeenCalled();
    });

    it("ignores alarms that are not the offline session expiry alarm", async () => {
      expect.assertions(3);
      const spyOnGetAccount = jest.spyOn(GetActiveAccountService, "get");
      const spyOnSendLogout = jest.spyOn(PostLogoutService, "sendLogoutEventForWorkers");
      const spyOnToolbar = jest.spyOn(toolbarService, "handleUserLoggedOut");

      await OfflineSessionExpiryAlarmService.handleSessionExpiryAlarm({ name: "AnotherAlarm" });

      expect(spyOnGetAccount).not.toHaveBeenCalled();
      expect(spyOnSendLogout).not.toHaveBeenCalled();
      expect(spyOnToolbar).not.toHaveBeenCalled();
    });
  });

  describe("::clearAlarm", () => {
    it("clears the offline session expiry alarm", async () => {
      expect.assertions(2);
      mockOfflineSettings(defaultOfflineSettingsDto({ max_session_duration: 3600 }));
      await OfflineSessionExpiryAlarmService.scheduleSessionExpiry(account, 300);
      let alarms = await browser.alarms.getAll();
      expect(alarms.length).toBe(1);

      await OfflineSessionExpiryAlarmService.clearAlarm();
      alarms = await browser.alarms.getAll();
      expect(alarms.length).toBe(0);
    });
  });
});
