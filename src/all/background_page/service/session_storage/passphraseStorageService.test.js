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
import PassphraseStorageService from "./passphraseStorageService";
import browser from "../../sdk/polyfill/browserPolyfill";

jest.useFakeTimers();

beforeEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});

describe("PassphraseStorageService", () => {
  describe("PassphraseStorageService::init", () => {
    it("should flush the storage during initialization", async() => {
      expect.assertions(1);
      const spyOnFlush = jest.spyOn(PassphraseStorageService, "flush");
      await PassphraseStorageService.init();

      expect(spyOnFlush).toHaveBeenCalledTimes(1);
    });
  });

  describe("PassphraseStorageService::set", () => {
    it("Should register the given passphrase on the storage without time limit", async() => {
      expect.assertions(6);
      const spyOnStorageSet = jest.spyOn(browser.storage.session, "set");
      const spyOnAlarmClear = jest.spyOn(browser.alarms, "clear");
      const spyOnAlarmCreate = jest.spyOn(browser.alarms, "create");
      await PassphraseStorageService.init();

      const passphrase = "This is a very strong passphrase";
      await PassphraseStorageService.set(passphrase);

      expect(spyOnStorageSet).toHaveBeenCalledTimes(1);
      expect(spyOnStorageSet).toHaveBeenCalledWith({passphrase: passphrase});

      //Called 2 times at init + 2 times during the ::set
      expect(spyOnAlarmClear).toHaveBeenCalledTimes(2 + 2);
      expect(spyOnAlarmClear).toHaveBeenCalledWith("PassphraseStorageFlush");

      //Only keep alive session is called and not passphrase storage flush
      expect(spyOnAlarmCreate).toHaveBeenCalledTimes(1);
      expect(spyOnAlarmCreate).toHaveBeenCalledWith("SessionKeepAlive", {
        delayInMinutes: 15,
        periodInMinutes: 15
      });
    });

    it("Should register the given passphrase on the storage with a time limit", async() => {
      expect.assertions(13);
      const spyOnStorageSet = jest.spyOn(browser.storage.session, "set");
      const spyOnAlarmClear = jest.spyOn(browser.alarms, "clear");
      const spyOnAlarmCreate = jest.spyOn(browser.alarms, "create");
      const spyOnAlarmListeners = jest.spyOn(browser.alarms.onAlarm, "addListener");
      const spyOnFlush = jest.spyOn(PassphraseStorageService, "flush");
      const spyOnKeepAliveSession = jest.spyOn(PassphraseStorageService, "_handleKeepSeesionAlive");

      await PassphraseStorageService.init();
      expect(spyOnFlush).toHaveBeenCalledTimes(1);

      const emptyAlarmSet = await browser.alarms.getAll();
      expect(emptyAlarmSet.length).toBe(0);

      const passphrase = "This is a very strong passphrase";
      await PassphraseStorageService.set(passphrase, 30);

      expect(spyOnStorageSet).toHaveBeenCalledTimes(1);
      expect(spyOnStorageSet).toHaveBeenCalledWith({passphrase: passphrase});

      //Called 2 times at init + 2 times during the ::set
      expect(spyOnAlarmClear).toHaveBeenCalledTimes(4);
      expect(spyOnAlarmClear).toHaveBeenCalledWith("PassphraseStorageFlush");

      expect(spyOnAlarmCreate).toHaveBeenCalledTimes(2);
      expect(spyOnAlarmListeners).toHaveBeenCalledTimes(2);

      const alarms = await browser.alarms.getAll();
      expect(alarms.length).toBe(2);
      expect(alarms[0].name).toBe("PassphraseStorageFlush");
      expect(alarms[1].name).toBe("SessionKeepAlive");

      await jest.advanceTimersByTime(30 * 1000);

      //1 call by the init funciton and another from the alarm
      expect(spyOnFlush).toHaveBeenCalledTimes(2);

      //The keep alive session shoudn't have been called has the passphrase been flushed before
      await jest.advanceTimersByTime(15 * 60 * 1000);
      expect(spyOnKeepAliveSession).not.toHaveBeenCalled();
    });
  });

  describe("PassphraseStorageService::get", () => {
    it("should return the stored passphrase", async() => {
      expect.assertions(2);

      await PassphraseStorageService.init();

      const emptyPassphrase = await PassphraseStorageService.get();
      expect(emptyPassphrase).toBeNull();

      const passphrase = "This is a very strong passphrase";
      await PassphraseStorageService.set(passphrase);

      const storedPassphrase = await PassphraseStorageService.get();
      expect(storedPassphrase).toBe(passphrase);
    });

    it("should return null after the delay is passed", async() => {
      expect.assertions(3);

      await PassphraseStorageService.init();

      const emptyPassphrase = await PassphraseStorageService.get();
      expect(emptyPassphrase).toBeNull();

      const passphrase = "This is a very strong passphrase";
      await PassphraseStorageService.set(passphrase, 30);

      const storedPassphrase = await PassphraseStorageService.get();
      expect(storedPassphrase).toBe(passphrase);

      await jest.advanceTimersByTime(30 * 1000);

      const flushedPassphrase = await PassphraseStorageService.get();
      expect(flushedPassphrase).toBeNull();
    });
  });

  describe("PassphraseStorageService::flushPassphrase", () => {
    it("should remove the registered passphrase without changing the alarms", async() => {
      expect.assertions(6);
      const spyOnAlarmClear = jest.spyOn(browser.alarms, "clear");
      const spyOnAlarmCreate = jest.spyOn(browser.alarms, "create");
      const spyOnAlarmListeners = jest.spyOn(browser.alarms.onAlarm, "addListener");

      await PassphraseStorageService.init();

      const passphrase = "This is a very strong passphrase";
      await PassphraseStorageService.set(passphrase, 30);

      expect(spyOnAlarmCreate).toHaveBeenCalledTimes(2);
      expect(spyOnAlarmListeners).toHaveBeenCalledTimes(2);

      const storedPassphrase = await PassphraseStorageService.get();
      expect(storedPassphrase).toBe(passphrase);

      //Clear is called with Init and Set
      const expectedClearCall = 4;
      expect(spyOnAlarmClear).toHaveBeenCalledTimes(expectedClearCall);

      await PassphraseStorageService.flushPassphrase();

      const flushedPassphrase = await PassphraseStorageService.get();
      expect(flushedPassphrase).toBeNull();

      //On ::flush, the clear is called but not with ::flushPassphrase
      expect(spyOnAlarmClear).toHaveBeenCalledTimes(expectedClearCall);
    });
  });

  describe("PassphraseStorageService::flush", () => {
    it("should remove the passphrase from the storage", async() => {
      expect.assertions(2);

      await PassphraseStorageService.init();

      const passphrase = "This is a very strong passphrase";
      await PassphraseStorageService.set(passphrase);

      const storedPassphrase = await PassphraseStorageService.get();
      expect(storedPassphrase).toBe(passphrase);

      await PassphraseStorageService.flush();

      const flushedPassphrase = await PassphraseStorageService.get();
      expect(flushedPassphrase).toBeNull();
    });

    it("should remove the passphrase from the storage and remove the timers and listeners", async() => {
      expect.assertions(7);
      const spyOnAlarmClear = jest.spyOn(browser.alarms, "clear");
      const spyOnAlarmCreate = jest.spyOn(browser.alarms, "create");
      const spyOnAlarmListeners = jest.spyOn(browser.alarms.onAlarm, "addListener");
      const spyOnAlarmRemoveListeners = jest.spyOn(browser.alarms.onAlarm, "removeListener");

      await PassphraseStorageService.init();

      const passphrase = "This is a very strong passphrase";
      await PassphraseStorageService.set(passphrase, 30);

      expect(spyOnAlarmCreate).toHaveBeenCalledTimes(2);
      expect(spyOnAlarmListeners).toHaveBeenCalledTimes(2);

      const storedPassphrase = await PassphraseStorageService.get();
      expect(storedPassphrase).toBe(passphrase);

      await PassphraseStorageService.flush();

      const flushedPassphrase = await PassphraseStorageService.get();
      expect(flushedPassphrase).toBeNull();

      expect(spyOnAlarmClear).toHaveBeenCalledWith("PassphraseStorageFlush");
      expect(spyOnAlarmClear).toHaveBeenCalledWith("SessionKeepAlive");
      expect(spyOnAlarmRemoveListeners).toHaveBeenCalledTimes(2);
    });
  });

  describe("PassphraseStorageService::stopSessionKeepAlive", () => {
    it("should clear the 'keep session alive' alarm", async() => {
      expect.assertions(1);
      const spyOnAlarmClear = jest.spyOn(browser.alarms, "clear");

      await PassphraseStorageService.init();

      await PassphraseStorageService.stopSessionKeepAlive();
      expect(spyOnAlarmClear).toHaveBeenCalledWith("SessionKeepAlive");
    });

    it("should clear the 'keep session alive' alarm and remove listeners if any", async() => {
      expect.assertions(2);
      const spyOnAlarmClear = jest.spyOn(browser.alarms, "clear");
      const spyOnAlarmRemoveListeners = jest.spyOn(browser.alarms.onAlarm, "removeListener");

      await PassphraseStorageService.init();

      const passphrase = "This is a very strong passphrase";
      await PassphraseStorageService.set(passphrase, 30);

      await PassphraseStorageService.stopSessionKeepAlive();

      expect(spyOnAlarmClear).toHaveBeenCalledWith("SessionKeepAlive");
      expect(spyOnAlarmRemoveListeners).toHaveBeenCalledTimes(1);
    });
  });
});
