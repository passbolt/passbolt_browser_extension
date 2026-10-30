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
import GetSessionTimestampsService from "./getSessionTimestampsService";
import SessionTimestampsEntity from "passbolt-styleguide/src/shared/models/entity/sessionTimestamps/sessionTimestampsEntity";
import { defaultSessionTimestampsDto } from "passbolt-styleguide/src/shared/models/entity/sessionTimestamps/sessionTimestampsEntity.test.data";
import AccountEntity from "../../model/entity/account/accountEntity";
import { defaultAccountDto } from "../../model/entity/account/accountEntity.test.data";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GetSessionTimestampsService", () => {
  let getSessionTimestampsService, account;

  beforeEach(async () => {
    account = new AccountEntity(defaultAccountDto());
    getSessionTimestampsService = new GetSessionTimestampsService(account);
    await getSessionTimestampsService.sessionTimestampsLocalStorage.flush();
  });

  describe("::get", () => {
    it("should return the session timestamps stored in the local storage.", async () => {
      expect.assertions(2);
      const sessionTimestampsDto = defaultSessionTimestampsDto();
      await getSessionTimestampsService.sessionTimestampsLocalStorage.setData(
        new SessionTimestampsEntity(sessionTimestampsDto),
      );

      const result = await getSessionTimestampsService.get();

      expect(result).toBeInstanceOf(SessionTimestampsEntity);
      expect(result.toDto()).toEqual(sessionTimestampsDto);
    });

    it("should return null if no session timestamps are stored.", async () => {
      expect.assertions(1);
      const result = await getSessionTimestampsService.get();
      expect(result).toBeNull();
    });

    it("should throw if the stored session timestamps are not valid.", async () => {
      expect.assertions(1);
      jest
        .spyOn(getSessionTimestampsService.sessionTimestampsLocalStorage, "getData")
        .mockResolvedValue({ last_logged_in: "not a date" });

      await expect(() => getSessionTimestampsService.get()).rejects.toThrow();
    });
  });
});
