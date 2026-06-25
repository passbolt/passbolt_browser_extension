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
import AuthCheckStatusController from "./authCheckStatusController";
import OnlineSessionEntity from "passbolt-styleguide/src/shared/models/entity/session/onlineSessionEntity";
import AccountEntity from "../../model/entity/account/accountEntity";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import { defaultAccountDto } from "../../model/entity/account/accountEntity.test.data";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("AuthCheckStatusController", () => {
  it("should return the auth status matching the unauthanticated state", async () => {
    expect.assertions(3);

    const account = new AccountEntity(defaultAccountDto());
    const controller = new AuthCheckStatusController(null, null, defaultApiClientOptions(), account);

    jest.spyOn(controller.checkAuthStatusService.activeSessionLocalStorage, "get").mockImplementation(() => undefined);
    jest.spyOn(controller.checkAuthStatusService.activeSessionLocalStorage, "flush");
    jest
      .spyOn(controller.checkAuthStatusService.authenticationStatusService, "isAuthenticated")
      .mockImplementation(() => false);

    const authStatus = await controller.exec(true);

    expect(controller.checkAuthStatusService.activeSessionLocalStorage.get).toHaveBeenCalledTimes(1);
    expect(controller.checkAuthStatusService.activeSessionLocalStorage.flush).not.toHaveBeenCalled();
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
    const controller = new AuthCheckStatusController(null, null, defaultApiClientOptions(), account);

    jest.spyOn(controller.checkAuthStatusService.activeSessionLocalStorage, "get").mockImplementation(() => undefined);
    jest.spyOn(controller.checkAuthStatusService.activeSessionLocalStorage, "flush");
    jest
      .spyOn(controller.checkAuthStatusService.authenticationStatusService, "isAuthenticated")
      .mockImplementation(() => true);

    const authStatus = await controller.exec(true);

    expect(controller.checkAuthStatusService.activeSessionLocalStorage.get).toHaveBeenCalledTimes(1);
    expect(controller.checkAuthStatusService.activeSessionLocalStorage.flush).not.toHaveBeenCalled();
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
    const controller = new AuthCheckStatusController(null, null, defaultApiClientOptions(), account);

    jest.spyOn(controller.checkAuthStatusService.activeSessionLocalStorage, "get").mockImplementation(() => undefined);
    jest.spyOn(controller.checkAuthStatusService.activeSessionLocalStorage, "flush");
    jest
      .spyOn(controller.checkAuthStatusService.authenticationStatusService, "isAuthenticated")
      .mockImplementation(() => {
        throw new MfaAuthenticationRequiredError();
      });

    const authStatus = await controller.exec(true);

    expect(controller.checkAuthStatusService.activeSessionLocalStorage.get).toHaveBeenCalledTimes(1);
    expect(controller.checkAuthStatusService.activeSessionLocalStorage.flush).not.toHaveBeenCalled();
    expect(authStatus).toStrictEqual(
      new OnlineSessionEntity({
        is_authenticated: true,
        is_mfa_authenticated: false,
      }),
    );
  });

  it("should return the auth status from the local storage", async () => {
    expect.assertions(4);
    const expectedAuthStatus = {
      is_authenticated: false,
      is_mfa_authenticated: true,
    };
    const account = new AccountEntity(defaultAccountDto());

    const controller = new AuthCheckStatusController(null, null, defaultApiClientOptions(), account);

    jest
      .spyOn(controller.checkAuthStatusService.activeSessionLocalStorage, "get")
      .mockImplementation(() => expectedAuthStatus);
    jest.spyOn(controller.checkAuthStatusService.activeSessionLocalStorage, "flush");
    jest
      .spyOn(controller.checkAuthStatusService.authenticationStatusService, "isAuthenticated")
      .mockImplementation(() => true);

    const authStatus = await controller.exec(false);

    expect(controller.checkAuthStatusService.activeSessionLocalStorage.get).toHaveBeenCalledTimes(1);
    expect(controller.checkAuthStatusService.activeSessionLocalStorage.flush).not.toHaveBeenCalled();
    expect(controller.checkAuthStatusService.authenticationStatusService.isAuthenticated).not.toHaveBeenCalled();
    expect(authStatus.toDto()).toStrictEqual(expectedAuthStatus);
  });
});
