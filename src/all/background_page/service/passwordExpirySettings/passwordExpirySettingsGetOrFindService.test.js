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
 * @since         4.5.0
 */

import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import PasswordExpirySettingsGetOrFindService from "./passwordExpirySettingsGetOrFindService";
import BuildApiClientOptionsService from "../account/buildApiClientOptionsService";
import {enableFetchMocks} from "jest-fetch-mock";
import browser from "../../sdk/polyfill/browserPolyfill";

describe("PasswordExpirySettingsGetOrFindService", () => {
  beforeEach(() => {
    enableFetchMocks();
    fetch.resetMocks();
    jest.spyOn(browser.cookies, "get").mockImplementationOnce(() => ({value: "csrf-token"}));
    jest.resetModules();
  });

  describe("PasswordExpirySettingsGetOrFindService::exec", () => {
    it("should check if the lock is called", async() => {
      expect.assertions(1);
      // data
      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = await BuildApiClientOptionsService.buildFromAccount(account);
      const passwordExpirySettingsService = new PasswordExpirySettingsGetOrFindService(account, apiClientOptions);
      // mocked functions
      jest.spyOn(passwordExpirySettingsService.passwordExpirySettingsModel, "getOrFindOrDefault").mockImplementationOnce(jest.fn);
      jest.spyOn(navigator.locks, "request");
      // execution
      await passwordExpirySettingsService.exec();
      // expectations
      expect(navigator.locks.request).toHaveBeenCalledWith(passwordExpirySettingsService.storageKey, expect.anything(Function));
    });
  });
});
