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
import AuthIsMfaRequiredController from "./authIsMfaRequiredController";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("AuthIsMfaRequiredController", () => {
  it("should return true if the user needs to authenticate with MFA", async() => {
    expect.assertions(1);

    const controller = new AuthIsMfaRequiredController();
    jest.spyOn(controller.checkAuthStatusService, "checkAuthStatus").mockImplementation(async() => userRequireMfaAuthStatus());

    const isMfaRequired = await controller.exec();
    expect(isMfaRequired).toStrictEqual(true);
  });

  it("should return false if the user does not need to authenticate with MFA", async() => {
    expect.assertions(1);

    const controller = new AuthIsMfaRequiredController();
    jest.spyOn(controller.checkAuthStatusService, "checkAuthStatus").mockImplementation(async() => userLoggedInAuthStatus());

    const isMfaRequired = await controller.exec();
    expect(isMfaRequired).toStrictEqual(false);
  });

  it("should return the MFA status part of the authentication status", async() => {
    expect.assertions(1);

    const controller = new AuthIsMfaRequiredController();

    const authStatus = userLoggedOutAuthStatus();
    jest.spyOn(controller.checkAuthStatusService, "checkAuthStatus").mockImplementation(async() => authStatus);

    const isMfaRequired = await controller.exec();
    expect(isMfaRequired).toStrictEqual(authStatus.isMfaRequired);
  });
});
