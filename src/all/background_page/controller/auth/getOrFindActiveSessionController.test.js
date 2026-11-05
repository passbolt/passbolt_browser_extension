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

import GetOrFindActiveSessionController from "./getOrFindActiveSessionController";
import UserActiveSessionEntity from "passbolt-styleguide/src/shared/models/entity/session/userActiveSessionEntity";
import AccountEntity from "../../model/entity/account/accountEntity";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import { defaultAccountDto } from "../../model/entity/account/accountEntity.test.data";
import { minimalUserActiveSessionDto } from "passbolt-styleguide/src/shared/models/entity/session/userActiveSessionEntity.test.data";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GetOrFindActiveSessionController", () => {
  it("Should call findAndUpdateActiveSessionSessionStorageService if there is no active session in the local storage", async () => {
    expect.assertions(3);

    const account = new AccountEntity(defaultAccountDto());
    const controller = new GetOrFindActiveSessionController(null, null, defaultApiClientOptions(), account);

    jest
      .spyOn(controller.getOrFindActiveSessionService.activeSessionSessionStorage, "get")
      .mockImplementation(() => undefined);
    jest.spyOn(controller.getOrFindActiveSessionService.activeSessionSessionStorage, "flush");
    jest
      .spyOn(
        controller.getOrFindActiveSessionService.findAndUpdateActiveSessionSessionStorageService,
        "findAndUpdateAuthenticationStatus",
      )
      .mockImplementation(
        () =>
          new UserActiveSessionEntity(
            minimalUserActiveSessionDto({ is_authenticated: false, is_server_reachable: true, is_mfa_required: false }),
          ),
      );

    const authStatus = await controller.exec();

    expect(controller.getOrFindActiveSessionService.activeSessionSessionStorage.get).toHaveBeenCalledTimes(1);
    expect(controller.getOrFindActiveSessionService.activeSessionSessionStorage.flush).not.toHaveBeenCalled();
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

  it("Should get the active session from the local storage", async () => {
    expect.assertions(4);

    const account = new AccountEntity(defaultAccountDto());
    const controller = new GetOrFindActiveSessionController(null, null, defaultApiClientOptions(), account);

    jest
      .spyOn(controller.getOrFindActiveSessionService.activeSessionSessionStorage, "get")
      .mockImplementation(() => minimalUserActiveSessionDto({ is_mfa_required: false, is_server_reachable: true }));
    jest.spyOn(controller.getOrFindActiveSessionService.activeSessionSessionStorage, "flush");
    jest.spyOn(
      controller.getOrFindActiveSessionService.findAndUpdateActiveSessionSessionStorageService,
      "findAndUpdateAuthenticationStatus",
    );

    const authStatus = await controller.exec();

    expect(controller.getOrFindActiveSessionService.activeSessionSessionStorage.get).toHaveBeenCalledTimes(1);
    expect(controller.getOrFindActiveSessionService.activeSessionSessionStorage.flush).not.toHaveBeenCalled();
    expect(
      controller.getOrFindActiveSessionService.findAndUpdateActiveSessionSessionStorageService
        .findAndUpdateAuthenticationStatus,
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

    await controller.getOrFindActiveSessionService.activeSessionSessionStorage.flush();
  });

  it("should call findAndUpdateActiveSessionSessionStorageService if there is any error during the entity validation", async () => {
    expect.assertions(4);
    const expectedAuthStatus = minimalUserActiveSessionDto({
      is_authenticated: false,
      is_mfa_required: false,
      is_server_reachable: true,
    });
    const account = new AccountEntity(defaultAccountDto());

    const controller = new GetOrFindActiveSessionController(null, null, defaultApiClientOptions(), account);

    jest
      .spyOn(controller.getOrFindActiveSessionService.activeSessionSessionStorage, "get")
      .mockImplementation(() => {});
    jest.spyOn(controller.getOrFindActiveSessionService.activeSessionSessionStorage, "flush");
    jest
      .spyOn(
        controller.getOrFindActiveSessionService.findAndUpdateActiveSessionSessionStorageService,
        "findAndUpdateAuthenticationStatus",
      )
      .mockImplementation(
        () =>
          new UserActiveSessionEntity(
            minimalUserActiveSessionDto({ is_authenticated: false, is_server_reachable: true, is_mfa_required: false }),
          ),
      );

    const authStatus = await controller.exec();

    expect(controller.getOrFindActiveSessionService.activeSessionSessionStorage.get).toHaveBeenCalledTimes(1);
    expect(controller.getOrFindActiveSessionService.activeSessionSessionStorage.flush).not.toHaveBeenCalled();
    expect(
      controller.getOrFindActiveSessionService.findAndUpdateActiveSessionSessionStorageService
        .findAndUpdateAuthenticationStatus,
    ).toHaveBeenCalledTimes(1);
    expect(authStatus.toDto()).toStrictEqual(expectedAuthStatus);
  });
});
