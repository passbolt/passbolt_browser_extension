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
      await PassphraseStorageService.flush();

      expect(spyOnFlush).toHaveBeenCalledTimes(1);
    });
  });

  describe("PassphraseStorageService::set", () => {
    it("Should register the given passphrase on the storage without time limit", async() => {
      expect.assertions(4);
      const spyOnStorageSet = jest.spyOn(browser.storage.session, "set");
      const spyOnAlarmClear = jest.spyOn(browser.alarms, "clear");
      await PassphraseStorageService.flush();

      const passphrase = "This is a very strong passphrase";
      await PassphraseStorageService.set(passphrase, -1);

      expect(spyOnStorageSet).toHaveBeenCalledTimes(1);
      expect(spyOnStorageSet).toHaveBeenCalledWith({passphrase: passphrase});

      //Called 2 times: at init and during the ::set
      expect(spyOnAlarmClear).toHaveBeenCalledTimes(2);
      expect(spyOnAlarmClear).toHaveBeenCalledWith("PassphraseStorageFlush");
    });

    it("Should register the given passphrase on the storage with a time limit", async() => {
      expect.assertions(11);
      const spyOnStorageSet = jest.spyOn(browser.storage.session, "set");
      const spyOnAlarmClear = jest.spyOn(browser.alarms, "clear");
      const spyOnAlarmCreate = jest.spyOn(browser.alarms, "create");
      const spyOnAlarmListeners = jest.spyOn(browser.alarms.onAlarm, "addListener");
      const spyOnFlush = jest.spyOn(PassphraseStorageService, "flush");

      browser.alarms.onAlarm.addListener(async alarm => await PassphraseStorageService.handleFlushEvent(alarm));

      await PassphraseStorageService.flush();
      expect(spyOnFlush).toHaveBeenCalledTimes(1);

      const emptyAlarmSet = await browser.alarms.getAll();
      expect(emptyAlarmSet.length).toBe(0);

      const passphrase = "This is a very strong passphrase";
      await PassphraseStorageService.set(passphrase, 30);

      expect(spyOnStorageSet).toHaveBeenCalledTimes(1);
      expect(spyOnStorageSet).toHaveBeenCalledWith({passphrase: passphrase});

      //Called 2 times: at init and during the ::set
      expect(spyOnAlarmClear).toHaveBeenCalledTimes(2);
      expect(spyOnAlarmClear).toHaveBeenCalledWith("PassphraseStorageFlush");

      expect(spyOnAlarmCreate).toHaveBeenCalledTimes(1);
      expect(spyOnAlarmListeners).toHaveBeenCalledTimes(1);

      const alarms = await browser.alarms.getAll();
      expect(alarms.length).toBe(1);
      expect(alarms[0].name).toBe("PassphraseStorageFlush");

      await jest.advanceTimersByTime(30 * 1000);

      //1 call by the init funciton and another from the alarm
      expect(spyOnFlush).toHaveBeenCalledTimes(2);
    });
  });

  describe("PassphraseStorageService::get", () => {
    it("should return the stored passphrase", async() => {
      expect.assertions(2);

      await PassphraseStorageService.flush();

      const emptyPassphrase = await PassphraseStorageService.get();
      expect(emptyPassphrase).toBeNull();

      const passphrase = "This is a very strong passphrase";
      await PassphraseStorageService.set(passphrase);

      const storedPassphrase = await PassphraseStorageService.get();
      expect(storedPassphrase).toBe(passphrase);
    });

    it("should return null after the delay is passed", async() => {
      expect.assertions(3);

      browser.alarms.onAlarm.addListener(async alarm => await PassphraseStorageService.handleFlushEvent(alarm));

      await PassphraseStorageService.flush();

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

      browser.alarms.onAlarm.addListener(async alarm => await PassphraseStorageService.handleFlushEvent(alarm));

      await PassphraseStorageService.flush();

      const passphrase = "This is a very strong passphrase";
      await PassphraseStorageService.set(passphrase, 30);

      expect(spyOnAlarmCreate).toHaveBeenCalledTimes(1);
      expect(spyOnAlarmListeners).toHaveBeenCalledTimes(1);

      const storedPassphrase = await PassphraseStorageService.get();
      expect(storedPassphrase).toBe(passphrase);

      //Clear is called with Init and Set
      const expectedClearCall = 2;
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

      await PassphraseStorageService.flush();

      const passphrase = "This is a very strong passphrase";
      await PassphraseStorageService.set(passphrase);

      const storedPassphrase = await PassphraseStorageService.get();
      expect(storedPassphrase).toBe(passphrase);

      await PassphraseStorageService.flush();

      const flushedPassphrase = await PassphraseStorageService.get();
      expect(flushedPassphrase).toBeNull();
    });

    it("should remove the passphrase from the storage and remove the timers and listeners", async() => {
      expect.assertions(6);
      const spyOnAlarmClear = jest.spyOn(browser.alarms, "clear");
      const spyOnAlarmCreate = jest.spyOn(browser.alarms, "create");
      const spyOnAlarmListeners = jest.spyOn(browser.alarms.onAlarm, "addListener");
      const spyOnAlarmRemoveListeners = jest.spyOn(browser.alarms.onAlarm, "removeListener");

      browser.alarms.onAlarm.addListener(async alarm => await PassphraseStorageService.handleFlushEvent(alarm));

      await PassphraseStorageService.flush();

      const passphrase = "This is a very strong passphrase";
      await PassphraseStorageService.set(passphrase, 30);

      expect(spyOnAlarmCreate).toHaveBeenCalledTimes(1);
      expect(spyOnAlarmListeners).toHaveBeenCalledTimes(1);

      const storedPassphrase = await PassphraseStorageService.get();
      expect(storedPassphrase).toBe(passphrase);

      await PassphraseStorageService.flush();

      const flushedPassphrase = await PassphraseStorageService.get();
      expect(flushedPassphrase).toBeNull();

      expect(spyOnAlarmClear).toHaveBeenCalledWith("PassphraseStorageFlush");
      expect(spyOnAlarmRemoveListeners).toHaveBeenCalledTimes(1);
    });
  });
});
