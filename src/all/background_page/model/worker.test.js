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
 * @since         4.0.0
 */
import browser from "../sdk/polyfill/browserPolyfill";
import {Worker as worker} from "./worker";
import Worker from "../sdk/worker";

jest.useFakeTimers();

// Reset the modules before each test.
beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
  jest.clearAllTimers();
});

describe("Worker model", () => {
  it("should wait for the worker exists", async() => {
    expect.assertions(10);
    const spy = jest.spyOn(worker, "waitExists");
    const spyOnAlarmClear = jest.spyOn(browser.alarms, "clear");
    const spyOnAlarmCreate = jest.spyOn(browser.alarms, "create");

    expect(spy).not.toHaveBeenCalled();

    worker.waitExists("QuickAccess", "100");
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spyOnAlarmCreate).toHaveBeenCalledTimes(1);
    expect(spyOnAlarmClear).toHaveBeenCalledTimes(0);

    jest.advanceTimersByTime(100);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spyOnAlarmCreate).toHaveBeenCalledTimes(2);
    expect(spyOnAlarmClear).toHaveBeenCalledTimes(1);

    const tab = {
      id: "100",
      url: "https://localhost"
    };
    const port = {
      onMessage: {
        addListener: jest.fn()
      }
    };
    worker.add("QuickAccess", new Worker(port, tab));
    jest.advanceTimersByTime(100);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spyOnAlarmCreate).toHaveBeenCalledTimes(2);
    expect(spyOnAlarmClear).toHaveBeenCalledTimes(2);
  });

  it("should raise an error if the worker not exists until timeout", async() => {
    expect.assertions(8);
    const spy = jest.spyOn(worker, "waitExists");
    const spyOnAlarmClear = jest.spyOn(browser.alarms, "clear");
    const spyOnAlarmCreate = jest.spyOn(browser.alarms, "create");

    expect(spy).not.toHaveBeenCalled();

    worker.waitExists("QuickAccess", "1").catch(error => {
      expect(error.message).toBe("Could not find worker ID QuickAccess for tab 1.");
    });

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spyOnAlarmCreate).toHaveBeenCalledTimes(1);
    expect(spyOnAlarmClear).toHaveBeenCalledTimes(0);

    jest.advanceTimersByTime(20000);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spyOnAlarmCreate).toHaveBeenCalledTimes(100);
    expect(spyOnAlarmClear).toHaveBeenCalledTimes(100);
  });
});
