/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.7.0
 */

import PublicWebsiteSignInController from "./publicWebsiteSignInController";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";

beforeEach(() => {
  jest.resetModules();
  global.chrome.tabs = {
    update: jest.fn(),
  };
});

describe("PublicWebsiteSignInController", () => {
  // Mock the chrome locale
  jest.spyOn(chrome.tabs, 'update');

  describe("PublicWebsiteSignInController::redirectToPassboltDomainUrl", () => {
    it("Should redirect to the passbolt domain url.", async() => {
      const worker = {
        tab: {
          id: 1
        }
      };
      const account = new AccountEntity(defaultAccountDto());
      const controller = new PublicWebsiteSignInController(worker, "requestId", account);
      controller.exec();

      expect.assertions(1);
      expect(chrome.tabs.update).toHaveBeenCalledWith(1, {"url": "https://passbolt.local"});
    });
  });
});
