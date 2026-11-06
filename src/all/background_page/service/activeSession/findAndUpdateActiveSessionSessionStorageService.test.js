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

import AccountEntity from "../../model/entity/account/accountEntity";
import { defaultAccountDto } from "../../model/entity/account/accountEntity.test.data";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import FindAndUpdateActiveSessionSessionStorageService from "./findAndUpdateActiveSessionSessionStorageService";
import UserActiveSessionEntity, {
  USER_ACTIVE_SESSION_OFFLINE,
  USER_ACTIVE_SESSION_ONLINE,
} from "passbolt-styleguide/src/shared/models/entity/session/userActiveSessionEntity";
import MfaAuthenticationRequiredError from "../../error/mfaAuthenticationRequiredError";
import SessionTimestampsEntity from "passbolt-styleguide/src/shared/models/entity/sessionTimestamps/sessionTimestampsEntity";
import { defaultSessionTimestampsDto } from "passbolt-styleguide/src/shared/models/entity/sessionTimestamps/sessionTimestampsEntity.test.data";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("FindAndUpdateActiveSessionSessionStorageService", () => {
  let findAndUpdateActiveSessionSessionStorageService, account, apiClientOptions;

  beforeEach(async () => {
    account = new AccountEntity(defaultAccountDto());
    apiClientOptions = defaultApiClientOptions();
    findAndUpdateActiveSessionSessionStorageService = new FindAndUpdateActiveSessionSessionStorageService(
      account,
      apiClientOptions,
    );
    // flush account related storage before each.
    await findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage.flush();
    await findAndUpdateActiveSessionSessionStorageService.updateSessionTimestampsService.sessionTimestampsLocalStorage.flush();
  });

  /**
   * Get the stored session timestamps.
   * @returns {Promise<object|undefined>}
   */
  const getStoredSessionTimestamps = () =>
    findAndUpdateActiveSessionSessionStorageService.updateSessionTimestampsService.sessionTimestampsLocalStorage.getData();

  /**
   * Store session timestamps of a previous session.
   * @returns {Promise<void>}
   */
  const setPreviousSessionTimestamps = () =>
    findAndUpdateActiveSessionSessionStorageService.updateSessionTimestampsService.sessionTimestampsLocalStorage.setData(
      new SessionTimestampsEntity(
        defaultSessionTimestampsDto({
          last_seen_online: "2025-08-06T10:05:46+00:00",
          last_logged_in: "2025-08-06T09:00:00+00:00",
        }),
      ),
    );

  describe("::findAndUpdateAuthenticationStatus", () => {
    it("If no active session create a new one and store it into the local storage.", async () => {
      expect.assertions(3);
      const userActiveSession = {
        is_authenticated: false,
        is_mfa_required: false,
        is_server_reachable: true,
        type: USER_ACTIVE_SESSION_ONLINE,
      };
      jest
        .spyOn(findAndUpdateActiveSessionSessionStorageService.findServerStatusService, "find")
        .mockImplementation(() => true);
      jest.spyOn(findAndUpdateActiveSessionSessionStorageService.authenticationStatusService, "isAuthenticated");

      const entity = await findAndUpdateActiveSessionSessionStorageService.findAndUpdateAuthenticationStatus();

      expect(entity.toDto()).toEqual(userActiveSession);
      const storageValue = await findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage.get();
      expect(storageValue).toEqual(userActiveSession);
      expect(
        findAndUpdateActiveSessionSessionStorageService.authenticationStatusService.isAuthenticated,
      ).not.toHaveBeenCalled();
    });

    it("User having an online authenticated active session and server become not reachable, update is_server_reachable to false and store it into the local storage.", async () => {
      expect.assertions(4);
      const userActiveSession = {
        is_authenticated: true,
        is_mfa_required: false,
        is_server_reachable: true,
        type: USER_ACTIVE_SESSION_ONLINE,
      };
      jest
        .spyOn(findAndUpdateActiveSessionSessionStorageService.findServerStatusService, "find")
        .mockImplementation(() => false);
      jest
        .spyOn(findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage, "get")
        .mockImplementationOnce(() => userActiveSession);
      jest.spyOn(findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage, "set");
      jest.spyOn(findAndUpdateActiveSessionSessionStorageService.authenticationStatusService, "isAuthenticated");

      const entity = await findAndUpdateActiveSessionSessionStorageService.findAndUpdateAuthenticationStatus();

      const expectedEntity = new UserActiveSessionEntity(userActiveSession);
      expectedEntity.isServerReachable = false;
      expect(entity).toEqual(expectedEntity);
      const storageValue = await findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage.get();
      expect(storageValue).toEqual(expectedEntity.toDto());
      expect(
        findAndUpdateActiveSessionSessionStorageService.authenticationStatusService.isAuthenticated,
      ).not.toHaveBeenCalled();
      expect(findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage.set).toHaveBeenCalledWith(
        expectedEntity,
      );
    });

    it("User having online authenticated active session, update is mfa authenticated to true and store it into the local storage.", async () => {
      expect.assertions(4);
      const userActiveSession = {
        is_authenticated: true,
        is_mfa_required: false,
        is_server_reachable: true,
        type: USER_ACTIVE_SESSION_ONLINE,
      };
      jest
        .spyOn(findAndUpdateActiveSessionSessionStorageService.findServerStatusService, "find")
        .mockImplementation(() => true);
      jest
        .spyOn(findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage, "get")
        .mockImplementationOnce(() => userActiveSession);
      jest.spyOn(findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage, "set");
      jest
        .spyOn(findAndUpdateActiveSessionSessionStorageService.authenticationStatusService, "isAuthenticated")
        .mockImplementationOnce(() => true);

      const entity = await findAndUpdateActiveSessionSessionStorageService.findAndUpdateAuthenticationStatus();

      const expectedEntity = new UserActiveSessionEntity(userActiveSession);
      expectedEntity.isMfaRequired = false;
      expect(entity).toEqual(expectedEntity);
      const storageValue = await findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage.get();
      expect(storageValue).toEqual(expectedEntity.toDto());
      expect(
        findAndUpdateActiveSessionSessionStorageService.authenticationStatusService.isAuthenticated,
      ).toHaveBeenCalledTimes(1);
      expect(findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage.set).toHaveBeenCalledWith(
        expectedEntity,
      );
    });

    it("User having online authenticated active session, update is authenticated to false and store it into the local storage.", async () => {
      expect.assertions(4);
      const userActiveSession = {
        is_authenticated: true,
        is_mfa_required: false,
        is_server_reachable: true,
        type: USER_ACTIVE_SESSION_ONLINE,
      };
      jest
        .spyOn(findAndUpdateActiveSessionSessionStorageService.findServerStatusService, "find")
        .mockImplementation(() => true);
      jest
        .spyOn(findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage, "get")
        .mockImplementationOnce(() => userActiveSession);
      jest.spyOn(findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage, "set");
      jest
        .spyOn(findAndUpdateActiveSessionSessionStorageService.authenticationStatusService, "isAuthenticated")
        .mockImplementationOnce(() => false);

      const entity = await findAndUpdateActiveSessionSessionStorageService.findAndUpdateAuthenticationStatus();

      const expectedEntity = new UserActiveSessionEntity(userActiveSession);
      expectedEntity.isAuthenticated = false;
      expect(entity).toEqual(expectedEntity);
      const storageValue = await findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage.get();
      expect(storageValue).toEqual(expectedEntity.toDto());
      expect(
        findAndUpdateActiveSessionSessionStorageService.authenticationStatusService.isAuthenticated,
      ).toHaveBeenCalledTimes(1);
      expect(findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage.set).toHaveBeenCalledWith(
        expectedEntity,
      );
    });

    it("User having online authenticated active session, update is mfa authenticated to false and store it into the local storage.", async () => {
      expect.assertions(4);
      const userActiveSession = {
        is_authenticated: true,
        is_mfa_required: false,
        is_server_reachable: true,
        type: USER_ACTIVE_SESSION_ONLINE,
      };
      jest
        .spyOn(findAndUpdateActiveSessionSessionStorageService.findServerStatusService, "find")
        .mockImplementation(() => true);
      jest
        .spyOn(findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage, "get")
        .mockImplementationOnce(() => userActiveSession);
      jest.spyOn(findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage, "set");
      jest
        .spyOn(findAndUpdateActiveSessionSessionStorageService.authenticationStatusService, "isAuthenticated")
        .mockImplementationOnce(() => {
          throw new MfaAuthenticationRequiredError();
        });

      const entity = await findAndUpdateActiveSessionSessionStorageService.findAndUpdateAuthenticationStatus();

      const expectedEntity = new UserActiveSessionEntity(userActiveSession);
      expectedEntity.isMfaRequired = true;
      expect(entity).toEqual(expectedEntity);
      const storageValue = await findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage.get();
      expect(storageValue).toEqual(expectedEntity.toDto());
      expect(
        findAndUpdateActiveSessionSessionStorageService.authenticationStatusService.isAuthenticated,
      ).toHaveBeenCalledTimes(1);
      expect(findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage.set).toHaveBeenCalledWith(
        expectedEntity,
      );
    });

    it("User having offline authenticated active session and server become reachable, update is_server_reachable to true and store it into the local storage.", async () => {
      expect.assertions(4);
      const userActiveSession = {
        is_authenticated: true,
        is_mfa_required: false,
        is_server_reachable: false,
        type: USER_ACTIVE_SESSION_OFFLINE,
      };
      jest
        .spyOn(findAndUpdateActiveSessionSessionStorageService.findServerStatusService, "find")
        .mockImplementation(() => true);
      jest
        .spyOn(findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage, "get")
        .mockImplementationOnce(() => userActiveSession);
      jest.spyOn(findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage, "set");
      jest.spyOn(findAndUpdateActiveSessionSessionStorageService.authenticationStatusService, "isAuthenticated");

      const entity = await findAndUpdateActiveSessionSessionStorageService.findAndUpdateAuthenticationStatus();

      const expectedEntity = new UserActiveSessionEntity(userActiveSession);
      expectedEntity.isServerReachable = true;
      expect(entity).toEqual(expectedEntity);
      const storageValue = await findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage.get();
      expect(storageValue).toEqual(expectedEntity.toDto());
      expect(
        findAndUpdateActiveSessionSessionStorageService.authenticationStatusService.isAuthenticated,
      ).not.toHaveBeenCalled();
      expect(findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage.set).toHaveBeenCalledWith(
        expectedEntity,
      );
    });

    it("User having offline authenticated active session and server is still not reachable, update the local storage with same values.", async () => {
      expect.assertions(4);
      const userActiveSession = {
        is_authenticated: true,
        is_mfa_required: false,
        is_server_reachable: false,
        type: USER_ACTIVE_SESSION_OFFLINE,
      };
      jest
        .spyOn(findAndUpdateActiveSessionSessionStorageService.findServerStatusService, "find")
        .mockImplementation(() => false);
      jest
        .spyOn(findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage, "get")
        .mockImplementationOnce(() => userActiveSession);
      jest.spyOn(findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage, "set");
      jest.spyOn(findAndUpdateActiveSessionSessionStorageService.authenticationStatusService, "isAuthenticated");

      const entity = await findAndUpdateActiveSessionSessionStorageService.findAndUpdateAuthenticationStatus();

      const expectedEntity = new UserActiveSessionEntity(userActiveSession);
      expect(entity).toEqual(expectedEntity);
      const storageValue = await findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage.get();
      expect(storageValue).toEqual(expectedEntity.toDto());
      expect(
        findAndUpdateActiveSessionSessionStorageService.authenticationStatusService.isAuthenticated,
      ).not.toHaveBeenCalled();
      expect(findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage.set).toHaveBeenCalledWith(
        expectedEntity,
      );
    });

    it("User having online not authenticated active session and server become not reachable, active session become offline and store it into the local storage.", async () => {
      expect.assertions(4);
      const userActiveSession = {
        is_authenticated: false,
        is_mfa_required: false,
        is_server_reachable: true,
        type: USER_ACTIVE_SESSION_ONLINE,
      };
      jest
        .spyOn(findAndUpdateActiveSessionSessionStorageService.findServerStatusService, "find")
        .mockImplementation(() => false);
      jest
        .spyOn(findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage, "get")
        .mockImplementationOnce(() => userActiveSession);
      jest.spyOn(findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage, "set");
      jest.spyOn(findAndUpdateActiveSessionSessionStorageService.authenticationStatusService, "isAuthenticated");

      const entity = await findAndUpdateActiveSessionSessionStorageService.findAndUpdateAuthenticationStatus();

      const expectedEntity = new UserActiveSessionEntity(userActiveSession);
      expectedEntity.isServerReachable = false;
      expectedEntity.type = USER_ACTIVE_SESSION_OFFLINE;
      expect(entity).toEqual(expectedEntity);
      const storageValue = await findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage.get();
      expect(storageValue).toEqual(expectedEntity.toDto());
      expect(
        findAndUpdateActiveSessionSessionStorageService.authenticationStatusService.isAuthenticated,
      ).not.toHaveBeenCalled();
      expect(findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage.set).toHaveBeenCalledWith(
        expectedEntity,
      );
    });

    it("User having online not authenticated active session and server is still reachable, update the local storage with same values.", async () => {
      expect.assertions(4);
      const userActiveSession = {
        is_authenticated: false,
        is_mfa_required: false,
        is_server_reachable: true,
        type: USER_ACTIVE_SESSION_ONLINE,
      };
      jest
        .spyOn(findAndUpdateActiveSessionSessionStorageService.findServerStatusService, "find")
        .mockImplementation(() => true);
      jest
        .spyOn(findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage, "get")
        .mockImplementationOnce(() => userActiveSession);
      jest.spyOn(findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage, "set");
      jest
        .spyOn(findAndUpdateActiveSessionSessionStorageService.authenticationStatusService, "isAuthenticated")
        .mockImplementationOnce(() => false);

      const entity = await findAndUpdateActiveSessionSessionStorageService.findAndUpdateAuthenticationStatus();

      const expectedEntity = new UserActiveSessionEntity(userActiveSession);
      expect(entity).toEqual(expectedEntity);
      const storageValue = await findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage.get();
      expect(storageValue).toEqual(expectedEntity.toDto());
      expect(
        findAndUpdateActiveSessionSessionStorageService.authenticationStatusService.isAuthenticated,
      ).toHaveBeenCalledTimes(1);
      expect(findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage.set).toHaveBeenCalledWith(
        expectedEntity,
      );
    });
  });

  describe("::resetAuthentication", () => {
    it("resets authentication in place, without touching the session timestamps", async () => {
      expect.assertions(4);
      await setPreviousSessionTimestamps();
      const existing = {
        is_authenticated: true,
        is_mfa_required: true,
        is_server_reachable: false,
        type: USER_ACTIVE_SESSION_OFFLINE,
      };
      jest
        .spyOn(findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage, "get")
        .mockImplementationOnce(() => existing);

      await findAndUpdateActiveSessionSessionStorageService.resetAuthentication();

      const storageValue = await findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage.get();
      expect(storageValue.is_authenticated).toBe(false);
      expect(storageValue.is_mfa_required).toBe(false);
      expect(storageValue.type).toBe(USER_ACTIVE_SESSION_OFFLINE);
      expect(await getStoredSessionTimestamps()).toStrictEqual({
        last_seen_online: "2025-08-06T10:05:46+00:00",
        last_logged_in: "2025-08-06T09:00:00+00:00",
      });
    });

    it("does nothing when there is no active session", async () => {
      expect.assertions(2);
      jest.spyOn(findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage, "set");

      const entity = await findAndUpdateActiveSessionSessionStorageService.resetAuthentication();

      expect(entity).toBeNull();
      expect(findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage.set).not.toHaveBeenCalled();
    });

    it("fails safe to an unauthenticated session when the reset errors", async () => {
      expect.assertions(2);
      const corrupt = { is_authenticated: "not-a-boolean", type: USER_ACTIVE_SESSION_ONLINE };
      jest
        .spyOn(findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage, "get")
        .mockImplementationOnce(() => corrupt);
      jest
        .spyOn(findAndUpdateActiveSessionSessionStorageService.findServerStatusService, "find")
        .mockImplementation(() => false);

      await findAndUpdateActiveSessionSessionStorageService.resetAuthentication();

      const storageValue = await findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage.get();
      expect(storageValue.is_authenticated).toBe(false);
      expect(storageValue.type).toBe(USER_ACTIVE_SESSION_OFFLINE);
    });
  });

  describe("::authenticateOnline", () => {
    it("creates an online authenticated session stamped with the login date when none exists", async () => {
      expect.assertions(5);
      jest.spyOn(findAndUpdateActiveSessionSessionStorageService.findServerStatusService, "find");
      jest.spyOn(findAndUpdateActiveSessionSessionStorageService.authenticationStatusService, "isAuthenticated");

      await findAndUpdateActiveSessionSessionStorageService.authenticateOnline();

      const storageValue = await findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage.get();
      expect(storageValue.is_authenticated).toBe(true);
      expect(storageValue.type).toBe(USER_ACTIVE_SESSION_ONLINE);
      const sessionTimestamps = await getStoredSessionTimestamps();
      expect(typeof sessionTimestamps.last_logged_in).toBe("string");
      expect(sessionTimestamps.last_seen_online).toBe(sessionTimestamps.last_logged_in);
      expect(findAndUpdateActiveSessionSessionStorageService.findServerStatusService.find).not.toHaveBeenCalled();
    });

    it("asserts online authenticated and refreshes the login and last seen online dates", async () => {
      expect.assertions(7);
      await setPreviousSessionTimestamps();
      const existing = {
        is_authenticated: false,
        is_mfa_required: false,
        is_server_reachable: false,
        type: USER_ACTIVE_SESSION_OFFLINE,
      };
      jest
        .spyOn(findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage, "get")
        .mockImplementationOnce(() => existing);
      jest.spyOn(findAndUpdateActiveSessionSessionStorageService.authenticationStatusService, "isAuthenticated");

      await findAndUpdateActiveSessionSessionStorageService.authenticateOnline();

      const storageValue = await findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage.get();
      expect(storageValue.is_authenticated).toBe(true);
      expect(storageValue.type).toBe(USER_ACTIVE_SESSION_ONLINE);
      // The login date and last seen online date are refreshed to the current date, not kept from the previous session.
      const sessionTimestamps = await getStoredSessionTimestamps();
      expect(sessionTimestamps.last_logged_in).not.toBe("2025-08-06T09:00:00+00:00");
      expect(typeof sessionTimestamps.last_logged_in).toBe("string");
      expect(sessionTimestamps.last_seen_online).not.toBe("2025-08-06T10:05:46+00:00");
      expect(typeof sessionTimestamps.last_seen_online).toBe("string");
      expect(
        findAndUpdateActiveSessionSessionStorageService.authenticationStatusService.isAuthenticated,
      ).not.toHaveBeenCalled();
    });

    it("fails safe to a minimal authenticated online session when the write errors, so the user stays signed in", async () => {
      expect.assertions(3);
      const corrupt = {
        is_authenticated: false,
        type: USER_ACTIVE_SESSION_OFFLINE,
        is_server_reachable: "not-a-boolean",
      };
      jest
        .spyOn(findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage, "get")
        .mockImplementationOnce(() => corrupt);

      await findAndUpdateActiveSessionSessionStorageService.authenticateOnline();

      const storageValue = await findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage.get();
      expect(storageValue.is_authenticated).toBe(true);
      expect(storageValue.type).toBe(USER_ACTIVE_SESSION_ONLINE);
      expect(typeof (await getStoredSessionTimestamps()).last_logged_in).toBe("string");
    });
  });

  describe("::authenticateOffline", () => {
    it("creates an offline authenticated session without creating session timestamps when none exists", async () => {
      expect.assertions(4);
      jest.spyOn(findAndUpdateActiveSessionSessionStorageService.findServerStatusService, "find");
      jest.spyOn(findAndUpdateActiveSessionSessionStorageService.authenticationStatusService, "isAuthenticated");

      await findAndUpdateActiveSessionSessionStorageService.authenticateOffline();

      const storageValue = await findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage.get();
      expect(storageValue.is_authenticated).toBe(true);
      expect(storageValue.type).toBe(USER_ACTIVE_SESSION_OFFLINE);
      // Session timestamps are only created at an online sign-in.
      expect(await getStoredSessionTimestamps()).toBeUndefined();
      expect(findAndUpdateActiveSessionSessionStorageService.findServerStatusService.find).not.toHaveBeenCalled();
    });

    it("asserts offline authenticated and refreshes the login date while preserving the last seen online date", async () => {
      expect.assertions(7);
      await setPreviousSessionTimestamps();
      const existing = {
        is_authenticated: false,
        is_mfa_required: false,
        is_server_reachable: false,
        type: USER_ACTIVE_SESSION_ONLINE,
      };
      jest
        .spyOn(findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage, "get")
        .mockImplementationOnce(() => existing);
      jest.spyOn(findAndUpdateActiveSessionSessionStorageService.authenticationStatusService, "isAuthenticated");

      await findAndUpdateActiveSessionSessionStorageService.authenticateOffline();

      const storageValue = await findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage.get();
      expect(storageValue.is_authenticated).toBe(true);
      expect(storageValue.type).toBe(USER_ACTIVE_SESSION_OFFLINE);
      expect(storageValue.is_server_reachable).toBe(false);
      const sessionTimestamps = await getStoredSessionTimestamps();
      expect(sessionTimestamps.last_seen_online).toBe("2025-08-06T10:05:46+00:00");
      expect(sessionTimestamps.last_logged_in).not.toBe("2025-08-06T09:00:00+00:00");
      expect(typeof sessionTimestamps.last_logged_in).toBe("string");
      expect(
        findAndUpdateActiveSessionSessionStorageService.authenticationStatusService.isAuthenticated,
      ).not.toHaveBeenCalled();
    });

    it("fails safe to a minimal authenticated offline session when the write errors, so the user stays signed in offline", async () => {
      expect.assertions(3);
      await setPreviousSessionTimestamps();
      const corrupt = {
        is_authenticated: false,
        type: USER_ACTIVE_SESSION_ONLINE,
        is_server_reachable: "not-a-boolean",
      };
      jest
        .spyOn(findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage, "get")
        .mockImplementationOnce(() => corrupt);
      jest
        .spyOn(findAndUpdateActiveSessionSessionStorageService.findServerStatusService, "find")
        .mockImplementation(() => false);

      await findAndUpdateActiveSessionSessionStorageService.authenticateOffline();

      const storageValue = await findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage.get();
      expect(storageValue.is_authenticated).toBe(true);
      expect(storageValue.type).toBe(USER_ACTIVE_SESSION_OFFLINE);
      expect(typeof (await getStoredSessionTimestamps()).last_logged_in).toBe("string");
    });
  });

  it("User having offline not authenticated active session and server become reachable, active session become online and store it into the local storage.", async () => {
    expect.assertions(4);
    const userActiveSession = {
      is_authenticated: false,
      is_mfa_required: false,
      is_server_reachable: false,
      type: USER_ACTIVE_SESSION_OFFLINE,
    };
    jest
      .spyOn(findAndUpdateActiveSessionSessionStorageService.findServerStatusService, "find")
      .mockImplementation(() => true);
    jest
      .spyOn(findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage, "get")
      .mockImplementationOnce(() => userActiveSession);
    jest.spyOn(findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage, "set");
    jest
      .spyOn(findAndUpdateActiveSessionSessionStorageService.authenticationStatusService, "isAuthenticated")
      .mockImplementationOnce(() => false);

    const entity = await findAndUpdateActiveSessionSessionStorageService.findAndUpdateAuthenticationStatus();

    const expectedEntity = new UserActiveSessionEntity(userActiveSession);
    expectedEntity.isServerReachable = true;
    expectedEntity.type = USER_ACTIVE_SESSION_ONLINE;
    expect(entity).toEqual(expectedEntity);
    const storageValue = await findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage.get();
    expect(storageValue).toEqual(expectedEntity.toDto());
    expect(
      findAndUpdateActiveSessionSessionStorageService.authenticationStatusService.isAuthenticated,
    ).toHaveBeenCalledTimes(1);
    expect(findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage.set).toHaveBeenCalledWith(
      expectedEntity,
    );
  });

  it("User having offline not authenticated active session and server is still not reachable, update the local storage with same values.", async () => {
    expect.assertions(4);
    const userActiveSession = {
      is_authenticated: false,
      is_mfa_required: false,
      is_server_reachable: false,
      type: USER_ACTIVE_SESSION_OFFLINE,
    };
    jest
      .spyOn(findAndUpdateActiveSessionSessionStorageService.findServerStatusService, "find")
      .mockImplementation(() => false);
    jest
      .spyOn(findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage, "get")
      .mockImplementationOnce(() => userActiveSession);
    jest.spyOn(findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage, "set");
    jest.spyOn(findAndUpdateActiveSessionSessionStorageService.authenticationStatusService, "isAuthenticated");

    const entity = await findAndUpdateActiveSessionSessionStorageService.findAndUpdateAuthenticationStatus();

    const expectedEntity = new UserActiveSessionEntity(userActiveSession);
    expect(entity).toEqual(expectedEntity);
    const storageValue = await findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage.get();
    expect(storageValue).toEqual(expectedEntity.toDto());
    expect(
      findAndUpdateActiveSessionSessionStorageService.authenticationStatusService.isAuthenticated,
    ).not.toHaveBeenCalled();
    expect(findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage.set).toHaveBeenCalledWith(
      expectedEntity,
    );
  });

  it("If active session is not valid and server is still not reachable, create offline active session and store it into the local storage.", async () => {
    expect.assertions(4);
    const userActiveSession = {
      is_authenticated: "false",
      is_server_reachable: true,
      type: USER_ACTIVE_SESSION_ONLINE,
    };
    jest
      .spyOn(findAndUpdateActiveSessionSessionStorageService.findServerStatusService, "find")
      .mockImplementation(() => false);
    jest
      .spyOn(findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage, "get")
      .mockImplementationOnce(() => userActiveSession);
    jest.spyOn(findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage, "set");
    jest.spyOn(findAndUpdateActiveSessionSessionStorageService.authenticationStatusService, "isAuthenticated");

    const entity = await findAndUpdateActiveSessionSessionStorageService.findAndUpdateAuthenticationStatus();

    const expectedEntity = new UserActiveSessionEntity({
      is_authenticated: false,
      is_mfa_required: false,
      is_server_reachable: false,
      type: USER_ACTIVE_SESSION_OFFLINE,
    });
    expect(entity).toEqual(expectedEntity);
    const storageValue = await findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage.get();
    expect(storageValue).toEqual(expectedEntity.toDto());
    expect(
      findAndUpdateActiveSessionSessionStorageService.authenticationStatusService.isAuthenticated,
    ).not.toHaveBeenCalled();
    expect(findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage.set).toHaveBeenCalledWith(
      expectedEntity,
    );
  });

  it("If active session is not valid and server is reachable, create online active session and store it into the local storage.", async () => {
    expect.assertions(4);
    const userActiveSession = {
      is_authenticated: "false",
      is_server_reachable: true,
      is_mfa_required: false,
      type: USER_ACTIVE_SESSION_ONLINE,
    };
    jest
      .spyOn(findAndUpdateActiveSessionSessionStorageService.findServerStatusService, "find")
      .mockImplementation(() => true);
    jest
      .spyOn(findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage, "get")
      .mockImplementationOnce(() => userActiveSession);
    jest.spyOn(findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage, "set");
    jest
      .spyOn(findAndUpdateActiveSessionSessionStorageService.authenticationStatusService, "isAuthenticated")
      .mockImplementationOnce(() => true);

    const entity = await findAndUpdateActiveSessionSessionStorageService.findAndUpdateAuthenticationStatus();

    const expectedEntity = new UserActiveSessionEntity({
      is_authenticated: true,
      is_mfa_required: false,
      is_server_reachable: true,
      type: USER_ACTIVE_SESSION_ONLINE,
    });
    expect(entity).toEqual(expectedEntity);
    const storageValue = await findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage.get();
    expect(storageValue).toEqual(expectedEntity.toDto());
    expect(
      findAndUpdateActiveSessionSessionStorageService.authenticationStatusService.isAuthenticated,
    ).toHaveBeenCalledTimes(1);
    expect(findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage.set).toHaveBeenCalledWith(
      expectedEntity,
    );
  });

  it("User having online authenticated active session, server is reachable with an error when isAuthenticated is fetched, do not update is_server_reachable and store it into the local storage.", async () => {
    expect.assertions(4);
    const userActiveSession = {
      is_authenticated: true,
      is_mfa_required: false,
      is_server_reachable: true,
      type: USER_ACTIVE_SESSION_ONLINE,
    };
    jest
      .spyOn(findAndUpdateActiveSessionSessionStorageService.findServerStatusService, "find")
      .mockImplementation(() => true);
    jest
      .spyOn(findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage, "get")
      .mockImplementationOnce(() => userActiveSession);
    jest.spyOn(findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage, "set");
    jest
      .spyOn(findAndUpdateActiveSessionSessionStorageService.authenticationStatusService, "isAuthenticated")
      .mockImplementationOnce(() => {
        throw new Error();
      });

    const entity = await findAndUpdateActiveSessionSessionStorageService.findAndUpdateAuthenticationStatus();

    const expectedEntity = new UserActiveSessionEntity(userActiveSession);
    expect(entity).toEqual(expectedEntity);
    const storageValue = await findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage.get();
    expect(storageValue).toEqual(expectedEntity.toDto());
    expect(
      findAndUpdateActiveSessionSessionStorageService.authenticationStatusService.isAuthenticated,
    ).toHaveBeenCalledTimes(1);
    expect(findAndUpdateActiveSessionSessionStorageService.activeSessionSessionStorage.set).toHaveBeenCalledWith(
      expectedEntity,
    );
  });
});
