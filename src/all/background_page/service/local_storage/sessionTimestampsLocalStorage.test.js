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

import SessionTimestampsLocalStorage from "./sessionTimestampsLocalStorage";
import { defaultSessionTimestampsDto } from "passbolt-styleguide/src/shared/models/entity/sessionTimestamps/sessionTimestampsEntity.test.data";
import SessionTimestampsEntity from "passbolt-styleguide/src/shared/models/entity/sessionTimestamps/sessionTimestampsEntity";
import AccountEntity from "../../model/entity/account/accountEntity";
import { defaultAccountDto } from "../../model/entity/account/accountEntity.test.data";

describe("SessionTimestampsLocalStorage", () => {
  // mock data
  const account = new AccountEntity(defaultAccountDto());

  describe("SessionTimestampsLocalStorage::get", () => {
    it("Should return undefined if nothing stored in the storage", async () => {
      expect.assertions(1);
      const sessionTimestampsLocalStorage = new SessionTimestampsLocalStorage(account);
      const result = await sessionTimestampsLocalStorage.getData();
      expect(result).toEqual(undefined);
    });

    it("Should return content stored in the local storage", async () => {
      const sessionTimestamps = defaultSessionTimestampsDto();
      expect.assertions(1);
      const sessionTimestampsLocalStorage = new SessionTimestampsLocalStorage(account);
      browser.storage.local.set({ [sessionTimestampsLocalStorage.storageDataKey]: sessionTimestamps });
      const result = await sessionTimestampsLocalStorage.getData();
      expect(result).toEqual(sessionTimestamps);
    });
  });

  describe("SessionTimestampsLocalStorage::setData", () => {
    it("Should setData the session timestamps in the local storage", async () => {
      expect.assertions(1);
      const sessionTimestampsLocalStorage = new SessionTimestampsLocalStorage(account);
      const sessionTimestamps = new SessionTimestampsEntity(defaultSessionTimestampsDto());
      await sessionTimestampsLocalStorage.setData(sessionTimestamps);
      const result = await sessionTimestampsLocalStorage.getData();
      expect(result).toEqual(sessionTimestamps.toDto());
    });
  });

  describe("SessionTimestampsLocalStorage::flush", () => {
    it("Should flush the session timestamps from the local storage", async () => {
      expect.assertions(1);
      const sessionTimestampsLocalStorage = new SessionTimestampsLocalStorage(account);
      await sessionTimestampsLocalStorage.flush();
      const result = await sessionTimestampsLocalStorage.getData();
      expect(result).toEqual(undefined);
    });
  });
});
