/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.8.0
 */

import MockExtension from "../../../../../test/mocks/mockExtension";
import UserService from "../api/user/userService";
import KeepSessionAliveService from "./keepSessionAliveService";
import PassphraseStorageService from "./passphraseStorageService";

beforeEach(async() => {
  await browser.alarms.clearAll();
  jest.resetAllMocks();
});

describe("KeepSessionAliveService", () => {
  describe("KeepSessionAliveService::set", () => {
    it("should start the alarm if none has been set already", async() => {
      expect.assertions(3);
      const spyOnAlarmGet = jest.spyOn(browser.alarms, "get").mockImplementation(() => {});
      const spyOnAlarmCreate = jest.spyOn(browser.alarms, "create").mockImplementation(() => {});

      await KeepSessionAliveService.start();

      expect(spyOnAlarmGet).toHaveBeenCalledTimes(1);
      expect(spyOnAlarmCreate).toHaveBeenCalledTimes(1);
      expect(spyOnAlarmCreate).toHaveBeenCalledWith("SessionKeepAlive", {
        delayInMinutes: 15,
        periodInMinutes: 15
      });
    });

    it("should not start the alarm if one already exist", async() => {
      expect.assertions(1);
      jest.spyOn(browser.alarms, "get").mockImplementation(() => ({}));
      const spyOnAlarmCreate = jest.spyOn(browser.alarms, "create").mockImplementation(() => {});

      await KeepSessionAliveService.start();

      expect(spyOnAlarmCreate).toHaveBeenCalledTimes(0);
    });
  });

  describe("KeepSessionAliveService::isStarted", () => {
    it("should return true if the alarm is started", async() => {
      expect.assertions(1);
      jest.spyOn(browser.alarms, "get").mockImplementation(() => ({}));
      const isSessionKept = await KeepSessionAliveService.isStarted();
      expect(isSessionKept).toStrictEqual(true);
    });

    it("should return false if the alarm has been cleared out", async() => {
      expect.assertions(1);
      await KeepSessionAliveService.start();
      await browser.alarms.clearAll();
      const isSessionKept = await KeepSessionAliveService.isStarted();
      expect(isSessionKept).toStrictEqual(false);
    });

    it("should return false if the alarm has never been set", async() => {
      expect.assertions(1);
      const isSessionKept = await KeepSessionAliveService.isStarted();
      expect(isSessionKept).toStrictEqual(false);
    });
  });

  describe("KeepSessionAliveService::stop", () => {
    it("should clear the alarms and remove listeners if any", async() => {
      expect.assertions(2);

      const spyOnAlarmClear = jest.spyOn(browser.alarms, "clear");

      await KeepSessionAliveService.stop();

      expect(spyOnAlarmClear).toHaveBeenCalledTimes(1);
      expect(spyOnAlarmClear).toHaveBeenCalledWith("SessionKeepAlive");
    });

    it("should clear the alarms and not remove the listeners if there is none", async() => {
      expect.assertions(2);

      const spyOnAlarmClear = jest.spyOn(browser.alarms, "clear");

      await KeepSessionAliveService.stop();

      expect(spyOnAlarmClear).toHaveBeenCalledTimes(1);
      expect(spyOnAlarmClear).toHaveBeenCalledWith("SessionKeepAlive");
    });
  });

  describe("KeepSessionAliveService::handleKeepSessionAlive", () => {
    it("should not handle alarms that is not SessionKeepAlive", async() => {
      expect.assertions(1);
      const spyOnPassphraseStorage = jest.spyOn(PassphraseStorageService, "get");

      await KeepSessionAliveService.handleKeepSessionAlive({
        name: "Not-SessionKeepAlive",
      });

      expect(spyOnPassphraseStorage).not.toHaveBeenCalled();
    });

    it("should not try to keep session alive if no passphrase is found in memory", async() => {
      expect.assertions(1);
      const spyOnPassphraseStorage = jest.spyOn(PassphraseStorageService, "get");
      spyOnPassphraseStorage.mockImplementation(async() => null);

      await KeepSessionAliveService.handleKeepSessionAlive({
        name: "SessionKeepAlive",
      });

      expect(spyOnPassphraseStorage).toHaveBeenCalledTimes(1);
    });

    it("should keep the session alive if a passphrase is found in memory", async() => {
      expect.assertions(2);
      await MockExtension.withConfiguredAccount();
      const spyOnPassphraseStorage = jest.spyOn(PassphraseStorageService, "get").mockImplementation(async() => "what a passphrase!");
      const spyOnUserService = jest.spyOn(UserService.prototype, "keepSessionAlive").mockImplementation(() => true);

      await KeepSessionAliveService.handleKeepSessionAlive({
        name: "SessionKeepAlive",
      });

      expect(spyOnPassphraseStorage).toHaveBeenCalledTimes(1);
      expect(spyOnUserService).toHaveBeenCalledTimes(1);
    });
  });
});
