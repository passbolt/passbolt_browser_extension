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
import AuthenticationStatusService from "../authenticationStatusService";
import AuthStatusLocalStorage from "../local_storage/authStatusLocalStorage";
import CheckAuthStatusService from "./checkAuthStatusService";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("CheckAuthStatusService", () => {
  it("expects the user not to be authenticated", async() => {
    expect.assertions(3);
    jest.spyOn(AuthStatusLocalStorage, "get").mockImplementation(() => undefined);
    jest.spyOn(AuthStatusLocalStorage, "flush");
    jest.spyOn(AuthenticationStatusService, "isAuthenticated").mockImplementation(() => false);

    const service = new CheckAuthStatusService();
    const authStatus = await service.checkAuthStatus();

    expect(AuthStatusLocalStorage.get).toHaveBeenCalledTimes(1);
    expect(AuthStatusLocalStorage.flush).not.toHaveBeenCalled();
    expect(authStatus).toStrictEqual({
      isAuthenticated: false,
      isMfaRequired: false,
    });
  });

  it("expects the user to be fully authenticated", async() => {
    expect.assertions(3);
    jest.spyOn(AuthStatusLocalStorage, "get").mockImplementation(() => undefined);
    jest.spyOn(AuthStatusLocalStorage, "flush");
    jest.spyOn(AuthenticationStatusService, "isAuthenticated").mockImplementation(() => true);

    const service = new CheckAuthStatusService();
    const authStatus = await service.checkAuthStatus();

    expect(AuthStatusLocalStorage.get).toHaveBeenCalledTimes(1);
    expect(AuthStatusLocalStorage.flush).not.toHaveBeenCalled();
    expect(authStatus).toStrictEqual({
      isAuthenticated: true,
      isMfaRequired: false,
    });
  });

  it("expects the user to require MFA authentication", async() => {
    expect.assertions(3);
    jest.spyOn(AuthStatusLocalStorage, "get").mockImplementation(() => undefined);
    jest.spyOn(AuthStatusLocalStorage, "flush");
    jest.spyOn(AuthenticationStatusService, "isAuthenticated").mockImplementation(() => { throw new MfaAuthenticationRequiredError(); });

    const service = new CheckAuthStatusService();
    const authStatus = await service.checkAuthStatus();

    expect(AuthStatusLocalStorage.get).toHaveBeenCalledTimes(1);
    expect(AuthStatusLocalStorage.flush).not.toHaveBeenCalled();
    expect(authStatus).toStrictEqual({
      isAuthenticated: true,
      isMfaRequired: true,
    });
  });

  it("should ask for an API call to find the authentication status", async() => {
    expect.assertions(3);
    jest.spyOn(AuthStatusLocalStorage, "get").mockImplementation(() => undefined);
    jest.spyOn(AuthStatusLocalStorage, "flush");
    jest.spyOn(AuthenticationStatusService, "isAuthenticated").mockImplementation(() => true);

    const service = new CheckAuthStatusService();
    const authStatus = await service.checkAuthStatus(true);

    expect(AuthStatusLocalStorage.get).not.toHaveBeenCalled();
    expect(AuthStatusLocalStorage.flush).not.toHaveBeenCalled();
    expect(authStatus).toStrictEqual({
      isAuthenticated: true,
      isMfaRequired: false,
    });
  });

  it("should return the authentication status from the cache", async() => {
    expect.assertions(3);
    const localStorageData = {
      isAuthenticated: false,
      isMfaRequired: false,
    };
    jest.spyOn(AuthStatusLocalStorage, "get").mockImplementation(() => localStorageData);
    jest.spyOn(AuthStatusLocalStorage, "flush");

    const service = new CheckAuthStatusService();
    const authStatus = await service.checkAuthStatus(false);

    expect(AuthStatusLocalStorage.get).toHaveBeenCalledTimes(1);
    expect(AuthStatusLocalStorage.flush).not.toHaveBeenCalled();
    expect(authStatus).toStrictEqual(localStorageData);
  });

  it("should return the authentication status from the API if the cache is empty", async() => {
    expect.assertions(3);
    jest.spyOn(AuthStatusLocalStorage, "get").mockImplementation(() => null);
    jest.spyOn(AuthStatusLocalStorage, "flush");
    jest.spyOn(AuthenticationStatusService, "isAuthenticated").mockImplementation(() => false);

    const service = new CheckAuthStatusService();
    const authStatus = await service.checkAuthStatus(false);

    expect(AuthStatusLocalStorage.get).toHaveBeenCalledTimes(1);
    expect(AuthStatusLocalStorage.flush).not.toHaveBeenCalled();
    expect(authStatus).toStrictEqual({isAuthenticated: false, isMfaRequired: false});
  });
});
