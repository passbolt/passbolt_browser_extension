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
 * @since         5.3.2
 */
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import CopyToClipboardService from "./copyToClipboardService";
import "../../../../../test/mocks/mockNavigatorClipboard";
import "../../../../../test/mocks/mockAlarms";

beforeEach(async() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  await browser.alarms.clearAll();
});

describe("CopyToClipboardService", () => {
  describe("::copyTemporarily", () => {
    it("should copy the given data into the clipboard and set an alarm", async() => {
      expect.assertions(5);

      const account = new AccountEntity(defaultAccountDto());
      const service = new CopyToClipboardService(account);

      //ensures the test is not blocked by an unmocked promise
      jest.spyOn(browser.alarms, "create").mockImplementation(() => {});
      jest.spyOn(browser.alarms, "clear").mockImplementation(() => {});

      const data = "data";
      await service.copyTemporarily(data);

      expect(await navigator.clipboard.readText()).toStrictEqual(data);
      expect(browser.alarms.create).toHaveBeenCalledTimes(1);
      expect(browser.alarms.create).toHaveBeenCalledWith(CopyToClipboardService.ALARM_NAME, {when: Date.now() + 30_000});
      expect(browser.alarms.clear).toHaveBeenCalledTimes(1);
      expect(browser.alarms.clear).toHaveBeenCalledWith(CopyToClipboardService.ALARM_NAME);
    });

    it("should throw an error if the data is not a string", async() => {
      expect.assertions(1);

      const account = new AccountEntity(defaultAccountDto());
      const service = new CopyToClipboardService(account);

      await expect(() => service.copyTemporarily(42)).rejects.toThrowError();
    });
  });

  describe("::copy", () => {
    it("should copy the given data into the clipboard and unset any flush alarm", async() => {
      expect.assertions(3);

      const account = new AccountEntity(defaultAccountDto());
      const service = new CopyToClipboardService(account);

      //ensures the test is not blocked by an unmocked promise
      jest.spyOn(browser.alarms, "clear").mockImplementation(() => {});

      const data = "data";
      await service.copy(data);

      expect(await navigator.clipboard.readText()).toStrictEqual(data);
      expect(browser.alarms.clear).toHaveBeenCalledTimes(1);
      expect(browser.alarms.clear).toHaveBeenCalledWith(CopyToClipboardService.ALARM_NAME);
    });

    it("should throw an error if the data is not a string", async() => {
      expect.assertions(1);

      const account = new AccountEntity(defaultAccountDto());
      const service = new CopyToClipboardService(account);

      await expect(() => service.copy(42)).rejects.toThrowError();
    });
  });

  describe("::flushTemporaryContent", () => {
    it("should flush the data in the clipboard", async() => {
      expect.assertions(1);

      const account = new AccountEntity(defaultAccountDto());
      const service = new CopyToClipboardService(account);

      await service.copyTemporarily("data");
      await service.flushTemporaryContent();

      expect(await navigator.clipboard.readText()).toStrictEqual("\x00");
    });
  });

  describe("::flushTemporaryContentIfAny", () => {
    it("should flush the data in the clipboard if an alarm has been set", async() => {
      expect.assertions(3);

      const account = new AccountEntity(defaultAccountDto());
      const service = new CopyToClipboardService(account);

      jest.spyOn(browser.alarms, "get").mockImplementation(async() => ({test: 42}));
      jest.spyOn(navigator.clipboard, "writeText").mockImplementation(async() => {});

      await service.copyTemporarily("data");
      await service.flushTemporaryContentIfAny();

      expect(await navigator.clipboard.writeText).toHaveBeenCalledTimes(2);
      expect(await navigator.clipboard.writeText).toHaveBeenCalledWith("data");
      expect(await navigator.clipboard.writeText).toHaveBeenCalledWith("\x00");
    });

    it("should not flush the data in the clipboard if not alarm has been set", async() => {
      expect.assertions(2);

      const account = new AccountEntity(defaultAccountDto());
      const service = new CopyToClipboardService(account);
      const clipboardContent = "data";

      jest.spyOn(browser.alarms, "get").mockImplementation(() => null);
      jest.spyOn(navigator.clipboard, "writeText").mockImplementation(async() => {});

      await service.copy(clipboardContent);
      await service.flushTemporaryContentIfAny();

      expect(await navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
      expect(await navigator.clipboard.writeText).toHaveBeenCalledWith(clipboardContent);
    });
  });

  describe("::clearAlarm", () => {
    it("should remove the alarm if any", async() => {
      expect.assertions(1);

      jest.spyOn(browser.alarms, "clear").mockImplementation(() => {});

      const account = new AccountEntity(defaultAccountDto());
      const service = new CopyToClipboardService(account);

      await service.clearAlarm();

      expect(browser.alarms.clear).toHaveBeenCalledTimes(1);
    });
  });

  describe("::handleClipboardTemporaryContentFlushEvent", () => {
    it("should call to flush the clipboard if the alarm triggers", async() => {
      expect.assertions(1);

      jest.spyOn(CopyToClipboardService.prototype, "flushTemporaryContent").mockImplementation(() => {});

      const alarm = {name: "ClipboardTemporaryContentFlush"};
      await CopyToClipboardService.handleClipboardTemporaryContentFlushEvent(alarm);

      expect(CopyToClipboardService.prototype.flushTemporaryContent).toHaveBeenCalledTimes(1);
    });

    it("should do nothing if the alarm is not the right one", async() => {
      expect.assertions(1);

      jest.spyOn(CopyToClipboardService.prototype, "flushTemporaryContent").mockImplementation(() => {});

      const alarm = {name: "other-alarm"};
      await CopyToClipboardService.handleClipboardTemporaryContentFlushEvent(alarm);

      expect(CopyToClipboardService.prototype.flushTemporaryContent).not.toHaveBeenCalled();
    });
  });
});
