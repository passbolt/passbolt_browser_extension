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
 * @since         6.0.0
 */

import MfaAuthenticationRequiredError from "../../error/mfaAuthenticationRequiredError";
import FindAndUpdateActiveSessionSessionStorageController from "./findAndUpdateActiveSessionSessionStorageController";
import UserActiveSessionEntity from "passbolt-styleguide/src/shared/models/entity/session/userActiveSessionEntity";
import AccountEntity from "../../model/entity/account/accountEntity";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import { defaultAccountDto } from "../../model/entity/account/accountEntity.test.data";
import {
  defaultUserActiveSessionDto,
  minimalUserActiveSessionDto,
} from "passbolt-styleguide/src/shared/models/entity/session/userActiveSessionEntity.test.data";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("FindAndUpdateActiveSessionSessionStorageController", () => {
  it("should return the auth status matching the unauthenticated state", async () => {
    expect.assertions(3);

    const account = new AccountEntity(defaultAccountDto());
    const controller = new FindAndUpdateActiveSessionSessionStorageController(
      null,
      null,
      defaultApiClientOptions(),
      account,
    );

    jest
      .spyOn(controller.findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage, "get")
      .mockImplementation(() => undefined);
    jest.spyOn(controller.findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage, "flush");
    jest
      .spyOn(controller.findAndUpdateActiveSessionSessionStorageService.findServerStatusService, "find")
      .mockImplementation(() => true);

    const authStatus = await controller.exec(true);

    expect(
      controller.findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage.get,
    ).toHaveBeenCalledTimes(1);
    expect(
      controller.findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage.flush,
    ).not.toHaveBeenCalled();
    expect(authStatus).toStrictEqual(
      new UserActiveSessionEntity(
        minimalUserActiveSessionDto({
          is_authenticated: false,
          is_mfa_required: false,
          is_server_reachable: true,
        }),
      ),
    );
  });

  it("expects the user to be fully authenticated", async () => {
    expect.assertions(3);

    const account = new AccountEntity(defaultAccountDto());
    const controller = new FindAndUpdateActiveSessionSessionStorageController(
      null,
      null,
      defaultApiClientOptions(),
      account,
    );

    jest
      .spyOn(controller.findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage, "get")
      .mockImplementation(() => minimalUserActiveSessionDto());
    jest.spyOn(controller.findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage, "flush");
    jest
      .spyOn(controller.findAndUpdateActiveSessionSessionStorageService.findServerStatusService, "find")
      .mockImplementation(() => true);
    jest
      .spyOn(controller.findAndUpdateActiveSessionSessionStorageService.authenticationStatusService, "isAuthenticated")
      .mockImplementation(() => true);

    const authStatus = await controller.exec();

    expect(
      controller.findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage.get,
    ).toHaveBeenCalledTimes(1);
    expect(
      controller.findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage.flush,
    ).not.toHaveBeenCalled();
    expect(authStatus).toStrictEqual(
      new UserActiveSessionEntity(
        minimalUserActiveSessionDto({
          is_authenticated: true,
          is_mfa_required: false,
          is_server_reachable: true,
        }),
      ),
    );
  });

  it("expects the user to require MFA authentication", async () => {
    expect.assertions(3);

    const account = new AccountEntity(defaultAccountDto());
    const controller = new FindAndUpdateActiveSessionSessionStorageController(
      null,
      null,
      defaultApiClientOptions(),
      account,
    );

    jest
      .spyOn(controller.findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage, "get")
      .mockImplementation(() => minimalUserActiveSessionDto());
    jest.spyOn(controller.findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage, "flush");
    jest
      .spyOn(controller.findAndUpdateActiveSessionSessionStorageService.findServerStatusService, "find")
      .mockImplementation(() => true);
    jest
      .spyOn(controller.findAndUpdateActiveSessionSessionStorageService.authenticationStatusService, "isAuthenticated")
      .mockImplementation(() => {
        throw new MfaAuthenticationRequiredError();
      });

    const authStatus = await controller.exec();

    expect(
      controller.findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage.get,
    ).toHaveBeenCalledTimes(1);
    expect(
      controller.findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage.flush,
    ).not.toHaveBeenCalled();
    expect(authStatus).toStrictEqual(
      new UserActiveSessionEntity(
        minimalUserActiveSessionDto({
          is_authenticated: true,
          is_mfa_required: true,
          is_server_reachable: true,
        }),
      ),
    );
  });

  it("should return the auth status from the local storage", async () => {
    expect.assertions(4);
    const expectedAuthStatus = defaultUserActiveSessionDto({
      is_authenticated: false,
      is_mfa_required: false,
    });
    const account = new AccountEntity(defaultAccountDto());

    const controller = new FindAndUpdateActiveSessionSessionStorageController(
      null,
      null,
      defaultApiClientOptions(),
      account,
    );

    jest
      .spyOn(controller.findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage, "get")
      .mockImplementation(() => expectedAuthStatus);
    jest.spyOn(controller.findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage, "flush");
    jest
      .spyOn(controller.findAndUpdateActiveSessionSessionStorageService.findServerStatusService, "find")
      .mockImplementation(() => true);
    jest
      .spyOn(controller.findAndUpdateActiveSessionSessionStorageService.authenticationStatusService, "isAuthenticated")
      .mockImplementation(() => false);

    const authStatus = await controller.exec();

    expect(
      controller.findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage.get,
    ).toHaveBeenCalledTimes(1);
    expect(
      controller.findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage.flush,
    ).not.toHaveBeenCalled();
    expect(
      controller.findAndUpdateActiveSessionSessionStorageService.authenticationStatusService.isAuthenticated,
    ).toHaveBeenCalledTimes(1);
    expect(authStatus.toDto()).toStrictEqual(expectedAuthStatus);
  });
});
