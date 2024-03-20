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
 * @since         3.3.0
 */
import StartLoopAuthSessionCheckService from "./startLoopAuthSessionCheckService";

jest.useFakeTimers();

// Reset the modules before each test.
beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
  jest.clearAllTimers();
});

describe("StartLoopAuthSessionCheckService", () => {
  it("should trigger a check authentication and clear alarm on logout", async() => {
    expect.assertions(12);
    // Data mocked
    const startLoopAuthSessionCheckService = new StartLoopAuthSessionCheckService();
    // Function mocked
    const spyScheduleAuthSessionCheck = jest.spyOn(startLoopAuthSessionCheckService, "scheduleAuthSessionCheck");
    const spyClearAuthSessionCheck = jest.spyOn(startLoopAuthSessionCheckService, "clearAlarm");
    const authStatus = {isAuthenticated: true, isMfaRequired: false};
    const spyIsAuthenticated = jest.spyOn(startLoopAuthSessionCheckService.checkAuthStatusService, "checkAuthStatus").mockImplementation(() => Promise.resolve(authStatus));
    const spyAlarmRemoveListener = jest.spyOn(browser.alarms.onAlarm, "removeListener");

    expect(spyScheduleAuthSessionCheck).not.toHaveBeenCalled();

    // Process
    await startLoopAuthSessionCheckService.exec();
    // Expectation
    expect(spyScheduleAuthSessionCheck).toHaveBeenCalledTimes(1);
    expect(spyIsAuthenticated).toHaveBeenCalledTimes(0);
    expect(spyClearAuthSessionCheck).toHaveBeenCalledTimes(0);
    jest.advanceTimersByTime(60000);
    expect(spyScheduleAuthSessionCheck).toHaveBeenCalledTimes(1);
    expect(spyIsAuthenticated).toHaveBeenCalledTimes(1);
    expect(spyClearAuthSessionCheck).toHaveBeenCalledTimes(0);

    jest.advanceTimersByTime(60000);
    expect(spyIsAuthenticated).toHaveBeenCalledTimes(2);

    self.dispatchEvent(new Event('passbolt.auth.after-logout'));
    expect(spyScheduleAuthSessionCheck).toHaveBeenCalledTimes(1);
    expect(spyIsAuthenticated).toHaveBeenCalledTimes(2);
    expect(spyClearAuthSessionCheck).toHaveBeenCalledTimes(1);
    expect(spyAlarmRemoveListener).toHaveBeenCalledWith(startLoopAuthSessionCheckService.checkAuthStatus);
  });

  it("should send logout event if not authenticated anymore", async() => {
    expect.assertions(11);
    // Data mocked
    const startLoopAuthSessionCheckService = new StartLoopAuthSessionCheckService();
    // Function mocked
    const spyScheduleAuthSessionCheck = jest.spyOn(startLoopAuthSessionCheckService, "scheduleAuthSessionCheck");
    const spyClearAuthSessionCheck = jest.spyOn(startLoopAuthSessionCheckService, "clearAlarm");
    const spyDispatchEvent = jest.spyOn(self, "dispatchEvent");
    const authStatus = {isAuthenticated: false, isMfaRequired: false};
    const spyIsAuthenticated = jest.spyOn(startLoopAuthSessionCheckService.checkAuthStatusService, "checkAuthStatus").mockImplementation(() => Promise.resolve(authStatus));
    const spyAlarmRemoveListener = jest.spyOn(browser.alarms.onAlarm, "removeListener");
    // Process
    await startLoopAuthSessionCheckService.exec();
    // Expectation
    expect(spyScheduleAuthSessionCheck).toHaveBeenCalledTimes(1);
    expect(spyIsAuthenticated).toHaveBeenCalledTimes(0);
    expect(spyClearAuthSessionCheck).toHaveBeenCalledTimes(0);

    jest.advanceTimersByTime(60000);
    await Promise.resolve();
    expect(spyScheduleAuthSessionCheck).toHaveBeenCalledTimes(1);
    expect(spyIsAuthenticated).toHaveBeenCalledTimes(1);
    expect(spyClearAuthSessionCheck).toHaveBeenCalledTimes(1);

    expect(spyDispatchEvent).toHaveBeenCalledWith(new Event('passbolt.auth.after-logout'));
    expect(spyScheduleAuthSessionCheck).toHaveBeenCalledTimes(1);
    expect(spyIsAuthenticated).toHaveBeenCalledTimes(1);
    expect(spyClearAuthSessionCheck).toHaveBeenCalledTimes(1);
    expect(spyAlarmRemoveListener).toHaveBeenCalledWith(startLoopAuthSessionCheckService.checkAuthStatus);
  });
});
