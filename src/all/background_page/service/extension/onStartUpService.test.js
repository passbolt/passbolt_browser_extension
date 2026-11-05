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
 * @since         4.8.0
 */

import OnStartUpService from "./onStartUpService";
import MockExtension from "../../../../../test/mocks/mockExtension";
import User from "../../model/user";
import LocalStorageService from "../localStorage/localStorageService";
import { BrowserExtensionIconService } from "../ui/browserExtensionIcon.service";
import GetActiveAccountService from "../account/getActiveAccountService";
import AccountEntity from "../../model/entity/account/accountEntity";
import { defaultAccountDto } from "../../model/entity/account/accountEntity.test.data";
import FindAndUpdateActiveSessionSessionStorageService from "../activeSession/findAndUpdateActiveSessionSessionStorageService";

// Reset the modules before each test.
beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

describe("OnStartUpService", () => {
  describe("OnStartUpService::exec", () => {
    it("Should exec start up process if the user is not valid", async () => {
      expect.assertions(2);
      // data mocked
      await MockExtension.withConfiguredAccount();
      // mock function
      jest.spyOn(User.getInstance(), "isValid").mockImplementation(() => false);
      jest.spyOn(LocalStorageService, "flush");
      jest.spyOn(BrowserExtensionIconService, "deactivate");
      // process
      await OnStartUpService.exec();
      // expectation
      expect(LocalStorageService.flush).toHaveBeenCalledTimes(1);
      expect(BrowserExtensionIconService.deactivate).toHaveBeenCalledTimes(0);
    });

    it("Should exec start up process if the user is valid", async () => {
      expect.assertions(3);
      // data mocked
      await MockExtension.withConfiguredAccount();
      // mock function
      jest.spyOn(User.getInstance(), "isValid").mockImplementation(() => true);
      jest.spyOn(LocalStorageService, "flush");
      jest.spyOn(BrowserExtensionIconService, "deactivate");
      jest.spyOn(GetActiveAccountService, "get").mockImplementation(() => new AccountEntity(defaultAccountDto()));
      jest.spyOn(FindAndUpdateActiveSessionSessionStorageService.prototype, "resetAuthentication");
      // process
      await OnStartUpService.exec();
      // expectation
      expect(LocalStorageService.flush).toHaveBeenCalledTimes(1);
      expect(BrowserExtensionIconService.deactivate).toHaveBeenCalledTimes(1);
      expect(FindAndUpdateActiveSessionSessionStorageService.prototype.resetAuthentication).toHaveBeenCalledTimes(1);
    });
  });
});
