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
import PostLogoutService from "./postLogoutService";
import StartLoopAuthSessionCheckService from "./startLoopAuthSessionCheckService";
import AccountEntity from "../../model/entity/account/accountEntity";
import { defaultAccountDto } from "../../model/entity/account/accountEntity.test.data";
import GetActiveAccountService from "../account/getActiveAccountService";
import UserActiveSessionEntity, {
  USER_ACTIVE_SESSION_ONLINE,
} from "passbolt-styleguide/src/shared/models/entity/session/userActiveSessionEntity";
import FindAndUpdateActiveSessionSessionStorageService from "../activeSession/findAndUpdateActiveSessionSessionStorageService";
import UpdateSessionTimestampsService from "../sessionTimestamps/updateSessionTimestampsService";

jest.useFakeTimers();

// Reset the modules before each test.
beforeEach(async () => {
  jest.resetModules();
  jest.clearAllMocks();
  jest.clearAllTimers();
  await browser.alarms.clearAll();
  const account = new AccountEntity(defaultAccountDto());
  jest.spyOn(GetActiveAccountService, "get").mockImplementation(() => account);
});

describe("StartLoopAuthSessionCheckService", () => {
  it("should trigger a check authentication and clear alarm on logout", async () => {
    expect.assertions(8);
    // Function mocked
    const spyClearAuthSessionCheck = jest.spyOn(StartLoopAuthSessionCheckService, "clearAlarm");
    const sessionEntity = new UserActiveSessionEntity({
      is_authenticated: true,
      is_mfa_required: false,
      is_server_reachable: true,
      type: USER_ACTIVE_SESSION_ONLINE,
    });
    const spyIsAuthenticated = jest
      .spyOn(FindAndUpdateActiveSessionSessionStorageService.prototype, "findAndUpdateAuthenticationStatus")
      .mockImplementation(() => Promise.resolve(sessionEntity));
    const spyUpdateLastSeenOnline = jest.spyOn(UpdateSessionTimestampsService.prototype, "updateLastSeenOnline");

    //mocking top-level alarm handler
    browser.alarms.onAlarm.addListener(
      async (alarm) => await StartLoopAuthSessionCheckService.handleAuthStatusCheckAlarm(alarm),
    );

    // Process
    await StartLoopAuthSessionCheckService.exec();
    // Expectation
    expect(spyIsAuthenticated).toHaveBeenCalledTimes(0);
    expect(spyClearAuthSessionCheck).toHaveBeenCalledTimes(0);
    await jest.advanceTimersByTime(60000);
    expect(spyIsAuthenticated).toHaveBeenCalledTimes(1);
    expect(spyClearAuthSessionCheck).toHaveBeenCalledTimes(0);

    await jest.advanceTimersByTime(60000);

    expect(spyIsAuthenticated).toHaveBeenCalledTimes(2);

    await PostLogoutService.exec();
    expect(spyIsAuthenticated).toHaveBeenCalledTimes(2);
    expect(spyClearAuthSessionCheck).toHaveBeenCalledTimes(1);
    expect(spyUpdateLastSeenOnline).toHaveBeenCalledTimes(2);
  });

  it("should send logout event and not update the last seen online date if not authenticated anymore", async () => {
    expect.assertions(5);
    // Function mocked
    const spyClearAuthSessionCheck = jest.spyOn(StartLoopAuthSessionCheckService, "clearAlarm");
    const sessionEntity = new UserActiveSessionEntity({
      is_authenticated: false,
      is_mfa_required: false,
      is_server_reachable: true,
      type: USER_ACTIVE_SESSION_ONLINE,
    });
    const spyIsAuthenticated = jest
      .spyOn(FindAndUpdateActiveSessionSessionStorageService.prototype, "findAndUpdateAuthenticationStatus")
      .mockImplementation(() => Promise.resolve(sessionEntity));
    const spyUpdateLastSeenOnline = jest.spyOn(UpdateSessionTimestampsService.prototype, "updateLastSeenOnline");
    const spyOnPostLogout = jest.spyOn(PostLogoutService, "exec").mockImplementation(async () => {});

    //mocking top-level alarm handler
    browser.alarms.onAlarm.addListener(
      async (alarm) => await StartLoopAuthSessionCheckService.handleAuthStatusCheckAlarm(alarm),
    );

    // Process
    await StartLoopAuthSessionCheckService.exec();
    // Expectation
    expect(spyIsAuthenticated).toHaveBeenCalledTimes(0);
    expect(spyClearAuthSessionCheck).toHaveBeenCalledTimes(0);

    await jest.advanceTimersByTime(60000);
    await Promise.resolve();

    expect(spyIsAuthenticated).toHaveBeenCalledTimes(1);
    expect(spyOnPostLogout).toHaveBeenCalledTimes(1);
    expect(spyUpdateLastSeenOnline).not.toHaveBeenCalled();
  });

  it("should not update the last seen online date if the server is not reachable", async () => {
    expect.assertions(3);
    // Function mocked
    const sessionEntity = new UserActiveSessionEntity({
      is_authenticated: true,
      is_mfa_required: false,
      is_server_reachable: false,
      type: USER_ACTIVE_SESSION_ONLINE,
    });
    const spyIsAuthenticated = jest
      .spyOn(FindAndUpdateActiveSessionSessionStorageService.prototype, "findAndUpdateAuthenticationStatus")
      .mockImplementation(() => Promise.resolve(sessionEntity));
    const spyUpdateLastSeenOnline = jest.spyOn(UpdateSessionTimestampsService.prototype, "updateLastSeenOnline");
    const spyOnPostLogout = jest.spyOn(PostLogoutService, "exec").mockImplementation(async () => {});

    // Process
    await StartLoopAuthSessionCheckService.handleAuthStatusCheckAlarm({
      name: StartLoopAuthSessionCheckService.ALARM_NAME,
    });

    // Expectation
    expect(spyIsAuthenticated).toHaveBeenCalledTimes(1);
    expect(spyOnPostLogout).not.toHaveBeenCalled();
    expect(spyUpdateLastSeenOnline).not.toHaveBeenCalled();
  });
});
