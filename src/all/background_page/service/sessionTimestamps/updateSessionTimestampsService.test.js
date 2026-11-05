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
 * @since         5.18.0
 */
import UpdateSessionTimestampsService from "./updateSessionTimestampsService";
import SessionTimestampsEntity from "passbolt-styleguide/src/shared/models/entity/sessionTimestamps/sessionTimestampsEntity";
import { defaultSessionTimestampsDto } from "passbolt-styleguide/src/shared/models/entity/sessionTimestamps/sessionTimestampsEntity.test.data";
import AccountEntity from "../../model/entity/account/accountEntity";
import { defaultAccountDto } from "../../model/entity/account/accountEntity.test.data";

beforeEach(() => {
  jest.clearAllMocks();
  jest.useRealTimers();
});

describe("UpdateSessionTimestampsService", () => {
  let updateSessionTimestampsService, account;
  const date = new Date("2025-08-05T10:00:00.000Z");

  beforeEach(async () => {
    account = new AccountEntity(defaultAccountDto());
    updateSessionTimestampsService = new UpdateSessionTimestampsService(account);
    await updateSessionTimestampsService.sessionTimestampsLocalStorage.flush();
  });

  /**
   * Store the given session timestamps in the local storage.
   * @param {object} sessionTimestampsDto
   * @returns {Promise<void>}
   */
  const storeSessionTimestamps = async (sessionTimestampsDto) => {
    await updateSessionTimestampsService.sessionTimestampsLocalStorage.setData(
      new SessionTimestampsEntity(sessionTimestampsDto),
    );
  };

  /**
   * Mock the stored session timestamps read by the service as not valid.
   * @returns {void}
   */
  const mockInvalidStoredSessionTimestamps = () => {
    jest
      .spyOn(updateSessionTimestampsService.getSessionTimestampsService.sessionTimestampsLocalStorage, "getData")
      .mockResolvedValue({ last_logged_in: "not a date" });
    jest.spyOn(console, "error").mockImplementation(() => {});
  };

  describe("::updateOnOnlineLogin", () => {
    it("should create the session timestamps with both dates set to the given date if none are stored.", async () => {
      expect.assertions(1);
      await updateSessionTimestampsService.updateOnOnlineLogin(date);

      const result = await updateSessionTimestampsService.sessionTimestampsLocalStorage.getData();
      expect(result).toEqual({
        last_logged_in: date.toISOString(),
        last_seen_online: date.toISOString(),
      });
    });

    it("should replace the stored session timestamps.", async () => {
      expect.assertions(1);
      await storeSessionTimestamps(defaultSessionTimestampsDto());

      await updateSessionTimestampsService.updateOnOnlineLogin(date);

      const result = await updateSessionTimestampsService.sessionTimestampsLocalStorage.getData();
      expect(result).toEqual({
        last_logged_in: date.toISOString(),
        last_seen_online: date.toISOString(),
      });
    });

    it("should use the current date by default.", async () => {
      expect.assertions(1);
      jest.useFakeTimers();
      jest.setSystemTime(date.getTime());

      await updateSessionTimestampsService.updateOnOnlineLogin();

      const result = await updateSessionTimestampsService.sessionTimestampsLocalStorage.getData();
      expect(result).toEqual({
        last_logged_in: date.toISOString(),
        last_seen_online: date.toISOString(),
      });
    });

    it("should throw if the date is not a Date.", async () => {
      expect.assertions(2);
      const spyOnSetData = jest.spyOn(updateSessionTimestampsService.sessionTimestampsLocalStorage, "setData");

      await expect(() => updateSessionTimestampsService.updateOnOnlineLogin(date.toISOString())).rejects.toThrow(
        TypeError,
      );
      expect(spyOnSetData).not.toHaveBeenCalled();
    });
  });

  describe("::updateOnOfflineLogin", () => {
    it("should update the last logged in date and keep the last seen online date.", async () => {
      expect.assertions(1);
      const sessionTimestampsDto = defaultSessionTimestampsDto();
      await storeSessionTimestamps(sessionTimestampsDto);

      await updateSessionTimestampsService.updateOnOfflineLogin(date);

      const result = await updateSessionTimestampsService.sessionTimestampsLocalStorage.getData();
      expect(result).toEqual({
        last_logged_in: date.toISOString(),
        last_seen_online: sessionTimestampsDto.last_seen_online,
      });
    });

    it("should use the current date by default.", async () => {
      expect.assertions(1);
      await storeSessionTimestamps(defaultSessionTimestampsDto());
      jest.useFakeTimers();
      jest.setSystemTime(date.getTime());

      await updateSessionTimestampsService.updateOnOfflineLogin();

      const result = await updateSessionTimestampsService.sessionTimestampsLocalStorage.getData();
      expect(result.last_logged_in).toEqual(date.toISOString());
    });

    it("should do nothing if no session timestamps are stored.", async () => {
      expect.assertions(2);
      const spyOnSetData = jest.spyOn(updateSessionTimestampsService.sessionTimestampsLocalStorage, "setData");

      await updateSessionTimestampsService.updateOnOfflineLogin(date);

      const result = await updateSessionTimestampsService.sessionTimestampsLocalStorage.getData();
      expect(result).toBeUndefined();
      expect(spyOnSetData).not.toHaveBeenCalled();
    });

    it("should do nothing if the stored session timestamps are not valid.", async () => {
      expect.assertions(1);
      mockInvalidStoredSessionTimestamps();
      const spyOnSetData = jest.spyOn(updateSessionTimestampsService.sessionTimestampsLocalStorage, "setData");

      await updateSessionTimestampsService.updateOnOfflineLogin(date);

      expect(spyOnSetData).not.toHaveBeenCalled();
    });

    it("should throw if the date is not a Date.", async () => {
      expect.assertions(1);
      await expect(() => updateSessionTimestampsService.updateOnOfflineLogin(date.toISOString())).rejects.toThrow(
        TypeError,
      );
    });
  });

  describe("::updateLastSeenOnline", () => {
    it("should update the last seen online date and keep the last logged in date.", async () => {
      expect.assertions(1);
      const sessionTimestampsDto = defaultSessionTimestampsDto();
      await storeSessionTimestamps(sessionTimestampsDto);

      await updateSessionTimestampsService.updateLastSeenOnline(date);

      const result = await updateSessionTimestampsService.sessionTimestampsLocalStorage.getData();
      expect(result).toEqual({
        last_logged_in: sessionTimestampsDto.last_logged_in,
        last_seen_online: date.toISOString(),
      });
    });

    it("should do nothing if no session timestamps are stored.", async () => {
      expect.assertions(2);
      const spyOnSetData = jest.spyOn(updateSessionTimestampsService.sessionTimestampsLocalStorage, "setData");

      await updateSessionTimestampsService.updateLastSeenOnline(date);

      const result = await updateSessionTimestampsService.sessionTimestampsLocalStorage.getData();
      expect(result).toBeUndefined();
      expect(spyOnSetData).not.toHaveBeenCalled();
    });

    it("should do nothing if the stored session timestamps are not valid.", async () => {
      expect.assertions(1);
      mockInvalidStoredSessionTimestamps();
      const spyOnSetData = jest.spyOn(updateSessionTimestampsService.sessionTimestampsLocalStorage, "setData");

      await updateSessionTimestampsService.updateLastSeenOnline(date);

      expect(spyOnSetData).not.toHaveBeenCalled();
    });

    it("should throw if the date is not a Date.", async () => {
      expect.assertions(1);
      await expect(() => updateSessionTimestampsService.updateLastSeenOnline(undefined)).rejects.toThrow(TypeError);
    });

    it("should not lose an update when called concurrently with the offline sign-in.", async () => {
      expect.assertions(1);
      await storeSessionTimestamps(defaultSessionTimestampsDto());
      const lastSeenOnlineDate = new Date("2025-08-06T10:00:00.000Z");

      await Promise.all([
        updateSessionTimestampsService.updateOnOfflineLogin(date),
        updateSessionTimestampsService.updateLastSeenOnline(lastSeenOnlineDate),
      ]);

      const result = await updateSessionTimestampsService.sessionTimestampsLocalStorage.getData();
      expect(result).toEqual({
        last_logged_in: date.toISOString(),
        last_seen_online: lastSeenOnlineDate.toISOString(),
      });
    });
  });
});
