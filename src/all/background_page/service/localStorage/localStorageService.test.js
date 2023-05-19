/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         4.0.0
 */

import LocalStorageService from "./localStorageService";
import browser from "../../sdk/polyfill/browserPolyfill";
import PostponedUserSettingInvitationService
  from "../api/invitation/postponedUserSettingInvitationService";
import GetLegacyAccountService from "../account/getLegacyAccountService";
import {v4 as uuidv4} from "uuid";
import HashString from "../../utils/format/hashString";

describe("LocalStorageService", () => {
  describe("LocalStorageService::flush", () => {
    it("Should flush all storage", async() => {
      expect.assertions(18);
      // mock data
      const account = {
        domain: "localhost",
        userId: uuidv4()
      };
      // spy on
      jest.spyOn(browser.storage.local, "remove");
      jest.spyOn(browser.storage.session, "remove");
      jest.spyOn(browser.alarms, "clear");
      jest.spyOn(PostponedUserSettingInvitationService, "reset");
      jest.spyOn(GetLegacyAccountService, "get").mockImplementation(() => account);
      // process
      await LocalStorageService.flush();
      // expectations
      expect(browser.storage.local.remove).toHaveBeenCalledTimes(9);
      expect(browser.storage.session.remove).toHaveBeenCalledTimes(2);
      expect(browser.alarms.clear).toHaveBeenCalledTimes(2);
      expect(browser.storage.local.remove).toHaveBeenCalledWith("resources");
      expect(browser.storage.local.remove).toHaveBeenCalledWith("resourceTypes");
      expect(browser.storage.local.remove).toHaveBeenCalledWith("folders");
      expect(browser.storage.local.remove).toHaveBeenCalledWith("auth_status");
      expect(browser.storage.local.remove).toHaveBeenCalledWith("users");
      expect(browser.storage.local.remove).toHaveBeenCalledWith("groups");
      expect(browser.storage.local.remove).toHaveBeenCalledWith("roles");
      expect(browser.storage.local.remove).toHaveBeenCalledWith("passwordGenerator");
      expect(PostponedUserSettingInvitationService.reset).toHaveBeenCalled();
      expect(browser.storage.session.remove).toHaveBeenCalledWith("passphrase");
      expect(browser.alarms.clear).toHaveBeenCalledWith("PassphraseStorageFlush");
      expect(browser.alarms.clear).toHaveBeenCalledWith("SessionKeepAlive");
      expect(browser.storage.session.remove).toHaveBeenCalledWith("temp_server_part_sso_kit");
      expect(GetLegacyAccountService.get).toHaveBeenCalled();
      expect(browser.storage.local.remove).toHaveBeenCalledWith(`rbac${HashString.exec(account.domain)}${account.userId}`);
    });
  });
});
