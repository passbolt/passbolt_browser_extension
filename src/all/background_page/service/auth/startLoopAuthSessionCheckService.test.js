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
import CheckAuthStatusService from "./checkAuthStatusService";
import PostLogoutService from "./postLogoutService";
import StartLoopAuthSessionCheckService from "./startLoopAuthSessionCheckService";

jest.useFakeTimers();

// Reset the modules before each test.
beforeEach(async() => {
  jest.resetModules();
  jest.clearAllMocks();
  jest.clearAllTimers();
  await browser.alarms.clearAll();
});

describe("StartLoopAuthSessionCheckService", () => {
  it("should trigger a check authentication and clear alarm on logout", async() => {
    expect.assertions(7);
    // Function mocked
    const spyClearAuthSessionCheck = jest.spyOn(StartLoopAuthSessionCheckService, "clearAlarm");
    const authStatus = {isAuthenticated: true, isMfaRequired: false};
    const spyIsAuthenticated = jest.spyOn(CheckAuthStatusService.prototype, "checkAuthStatus").mockImplementation(() => Promise.resolve(authStatus));

    //mocking top-level alarm handler
    browser.alarms.onAlarm.addListener(async alarm => await StartLoopAuthSessionCheckService.handleAuthStatusCheckAlarm(alarm));

    // Process
    await StartLoopAuthSessionCheckService.exec();

    // Expectation
    expect(spyIsAuthenticated).toHaveBeenCalledTimes(0);
    expect(spyClearAuthSessionCheck).toHaveBeenCalledTimes(0);
    jest.advanceTimersByTime(60000);
    expect(spyIsAuthenticated).toHaveBeenCalledTimes(1);
    expect(spyClearAuthSessionCheck).toHaveBeenCalledTimes(0);

    jest.advanceTimersByTime(60000);
    expect(spyIsAuthenticated).toHaveBeenCalledTimes(2);

    await PostLogoutService.exec();
    expect(spyIsAuthenticated).toHaveBeenCalledTimes(2);
    expect(spyClearAuthSessionCheck).toHaveBeenCalledTimes(1);
  });

  it("should send logout event if not authenticated anymore", async() => {
    expect.assertions(4);
    // Function mocked
    const spyClearAuthSessionCheck = jest.spyOn(StartLoopAuthSessionCheckService, "clearAlarm");
    const authStatus = {isAuthenticated: false, isMfaRequired: false};
    const spyIsAuthenticated = jest.spyOn(CheckAuthStatusService.prototype, "checkAuthStatus").mockImplementation(() => Promise.resolve(authStatus));
    const spyOnPostLogout = jest.spyOn(PostLogoutService, "exec").mockImplementation(async() => {});

    //mocking top-level alarm handler
    browser.alarms.onAlarm.addListener(async alarm => await StartLoopAuthSessionCheckService.handleAuthStatusCheckAlarm(alarm));

    // Process
    await StartLoopAuthSessionCheckService.exec();
    // Expectation
    expect(spyIsAuthenticated).toHaveBeenCalledTimes(0);
    expect(spyClearAuthSessionCheck).toHaveBeenCalledTimes(0);

    jest.advanceTimersByTime(60000);
    await Promise.resolve();

    expect(spyIsAuthenticated).toHaveBeenCalledTimes(1);
    expect(spyOnPostLogout).toHaveBeenCalledTimes(1);
  });
});
