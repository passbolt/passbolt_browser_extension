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

import {userLoggedInAuthStatus, userLoggedOutAuthStatus, userRequireMfaAuthStatus} from "./authCheckStatus.test.data";
import AuthIsAuthenticatedController from "./authIsAuthenticatedController";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("AuthIsAuthenticatedController", () => {
  it("should return true if the user is authenticated", async() => {
    expect.assertions(1);

    const controller = new AuthIsAuthenticatedController();
    jest.spyOn(controller.checkAuthStatusService, "checkAuthStatus").mockImplementation(async() => userLoggedInAuthStatus());

    const isAuthenticated = await controller.exec();
    expect(isAuthenticated).toStrictEqual(true);
  });

  it("should return true if the user requires MFA authenticate", async() => {
    expect.assertions(1);

    const controller = new AuthIsAuthenticatedController();
    jest.spyOn(controller.checkAuthStatusService, "checkAuthStatus").mockImplementation(async() => userRequireMfaAuthStatus());

    const isAuthenticated = await controller.exec();
    expect(isAuthenticated).toStrictEqual(true);
  });

  it("should return the isAuthenticated part of the AuthStatus", async() => {
    expect.assertions(1);

    const controller = new AuthIsAuthenticatedController();

    const authStatus = userLoggedOutAuthStatus();
    jest.spyOn(controller.checkAuthStatusService, "checkAuthStatus").mockImplementation(async() => authStatus);

    const isAuthenticated = await controller.exec();
    expect(isAuthenticated).toStrictEqual(authStatus.isAuthenticated);
  });
});
