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

import IsMfaRequiredController from "./isMfaRequiredController";
import AccountEntity from "../../model/entity/account/accountEntity";
import { defaultAccountDto } from "../../model/entity/account/accountEntity.test.data";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import UserActiveSessionEntity from "passbolt-styleguide/src/shared/models/entity/session/userActiveSessionEntity";
import { defaultUserActiveSessionDto } from "passbolt-styleguide/src/shared/models/entity/session/userActiveSessionEntity.test.data";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("IsMfaRequiredController", () => {
  it("should return true if the user needs to authenticate with MFA", async () => {
    expect.assertions(1);

    const account = new AccountEntity(defaultAccountDto());
    const controller = new IsMfaRequiredController(null, null, defaultApiClientOptions(), account);
    jest
      .spyOn(controller.findAndUpdateActiveSessionSessionStorageService, "findAndUpdateAuthenticationStatus")
      .mockImplementation(
        async () =>
          new UserActiveSessionEntity(
            defaultUserActiveSessionDto({
              is_authenticated: true,
              is_mfa_required: true,
            }),
          ),
      );

    const isMfaRequired = await controller.exec();
    expect(isMfaRequired).toBeTruthy();
  });

  it("should return false if the user does not need to authenticate with MFA", async () => {
    expect.assertions(1);

    const account = new AccountEntity(defaultAccountDto());
    const controller = new IsMfaRequiredController(null, null, defaultApiClientOptions(), account);
    jest
      .spyOn(controller.findAndUpdateActiveSessionSessionStorageService, "findAndUpdateAuthenticationStatus")
      .mockImplementation(
        async () =>
          new UserActiveSessionEntity(defaultUserActiveSessionDto({ is_authenticated: true, is_mfa_required: false })),
      );

    const isMfaRequired = await controller.exec();
    expect(isMfaRequired).toBeFalsy();
  });

  it("should return the MFA status part of the authentication status", async () => {
    expect.assertions(1);

    const account = new AccountEntity(defaultAccountDto());
    const controller = new IsMfaRequiredController(null, null, defaultApiClientOptions(), account);

    const authStatus = defaultUserActiveSessionDto({ is_authenticated: false, is_mfa_required: false });
    jest
      .spyOn(controller.findAndUpdateActiveSessionSessionStorageService, "findAndUpdateAuthenticationStatus")
      .mockImplementation(async () => new UserActiveSessionEntity(authStatus));

    const isMfaRequired = await controller.exec();
    expect(isMfaRequired).toStrictEqual(authStatus.is_mfa_required);
  });
});
