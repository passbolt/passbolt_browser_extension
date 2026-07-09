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
 * @since         4.7.0
 */

import MfaAuthenticationRequiredError from "../../error/mfaAuthenticationRequiredError";
import CheckAuthStatusService from "./checkAuthStatusService";
import AccountEntity from "../../model/entity/account/accountEntity";
import { defaultAccountDto } from "../../model/entity/account/accountEntity.test.data";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import OnlineSessionEntity from "passbolt-styleguide/src/shared/models/entity/session/onlineSessionEntity";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("CheckAuthStatusService", () => {
  it("expects the user not to be authenticated", async () => {
    expect.assertions(3);

    const account = new AccountEntity(defaultAccountDto());
    const service = new CheckAuthStatusService(account, defaultApiClientOptions());
    jest.spyOn(service.activeSessionLocalStorage, "get").mockImplementation(() => undefined);
    jest.spyOn(service.activeSessionLocalStorage, "flush");
    jest.spyOn(service.authenticationStatusService, "isAuthenticated").mockImplementation(() => false);
    const authStatus = await service.checkAuthStatus();

    expect(service.activeSessionLocalStorage.get).toHaveBeenCalledTimes(1);
    expect(service.activeSessionLocalStorage.flush).not.toHaveBeenCalled();
    expect(authStatus).toStrictEqual(
      new OnlineSessionEntity({
        is_authenticated: false,
        is_mfa_authenticated: true,
      }),
    );
  });

  it("expects the user to be fully authenticated", async () => {
    expect.assertions(3);

    const account = new AccountEntity(defaultAccountDto());
    const service = new CheckAuthStatusService(account, defaultApiClientOptions());
    jest.spyOn(service.activeSessionLocalStorage, "get").mockImplementation(() => undefined);
    jest.spyOn(service.activeSessionLocalStorage, "flush");
    jest.spyOn(service.authenticationStatusService, "isAuthenticated").mockImplementation(() => true);
    const authStatus = await service.checkAuthStatus();

    expect(service.activeSessionLocalStorage.get).toHaveBeenCalledTimes(1);
    expect(service.activeSessionLocalStorage.flush).not.toHaveBeenCalled();
    expect(authStatus).toStrictEqual(
      new OnlineSessionEntity({
        is_authenticated: true,
        is_mfa_authenticated: true,
      }),
    );
  });

  it("expects the user to require MFA authentication", async () => {
    expect.assertions(3);

    const account = new AccountEntity(defaultAccountDto());
    const service = new CheckAuthStatusService(account, defaultApiClientOptions());
    jest.spyOn(service.activeSessionLocalStorage, "get").mockImplementation(() => undefined);
    jest.spyOn(service.activeSessionLocalStorage, "flush");
    jest.spyOn(service.authenticationStatusService, "isAuthenticated").mockImplementation(() => {
      throw new MfaAuthenticationRequiredError();
    });
    const authStatus = await service.checkAuthStatus();

    expect(service.activeSessionLocalStorage.get).toHaveBeenCalledTimes(1);
    expect(service.activeSessionLocalStorage.flush).not.toHaveBeenCalled();
    expect(authStatus).toStrictEqual(
      new OnlineSessionEntity({
        is_authenticated: true,
        is_mfa_authenticated: false,
      }),
    );
  });

  it("should ask for an API call to find the authentication status", async () => {
    expect.assertions(4);

    const account = new AccountEntity(defaultAccountDto());
    const service = new CheckAuthStatusService(account, defaultApiClientOptions());
    jest.spyOn(service.activeSessionLocalStorage, "get").mockImplementation(() => undefined);
    jest.spyOn(service.activeSessionLocalStorage, "set");
    jest.spyOn(service.activeSessionLocalStorage, "flush");
    jest.spyOn(service.authenticationStatusService, "isAuthenticated").mockImplementation(() => true);
    const authStatus = await service.checkAuthStatus(true);

    expect(service.activeSessionLocalStorage.get).toHaveBeenCalled();
    expect(service.activeSessionLocalStorage.set).toHaveBeenCalled();
    expect(service.activeSessionLocalStorage.flush).not.toHaveBeenCalled();
    expect(authStatus).toStrictEqual(
      new OnlineSessionEntity({
        is_authenticated: true,
        is_mfa_authenticated: true,
      }),
    );
  });

  it("should return the authentication status from the cache", async () => {
    expect.assertions(3);
    const localStorageData = new OnlineSessionEntity({
      is_authenticated: false,
      is_mfa_authenticated: true,
    });

    const account = new AccountEntity(defaultAccountDto());
    const service = new CheckAuthStatusService(account, defaultApiClientOptions());
    jest.spyOn(service.activeSessionLocalStorage, "get").mockImplementation(() => localStorageData);
    jest.spyOn(service.activeSessionLocalStorage, "flush");
    const authStatus = await service.checkAuthStatus(false);

    expect(service.activeSessionLocalStorage.get).toHaveBeenCalledTimes(1);
    expect(service.activeSessionLocalStorage.flush).not.toHaveBeenCalled();
    expect(authStatus).toStrictEqual(localStorageData);
  });

  it("should return the authentication status from the API if the cache is empty", async () => {
    expect.assertions(3);

    const account = new AccountEntity(defaultAccountDto());
    const service = new CheckAuthStatusService(account, defaultApiClientOptions());
    jest.spyOn(service.activeSessionLocalStorage, "get").mockImplementation(() => null);
    jest.spyOn(service.activeSessionLocalStorage, "flush");
    jest.spyOn(service.authenticationStatusService, "isAuthenticated").mockImplementation(() => false);
    const authStatus = await service.checkAuthStatus(false);

    expect(service.activeSessionLocalStorage.get).toHaveBeenCalledTimes(1);
    expect(service.activeSessionLocalStorage.flush).not.toHaveBeenCalled();
    expect(authStatus).toStrictEqual(new OnlineSessionEntity({ is_authenticated: false, is_mfa_authenticated: true }));
  });
});
