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
 * @since         5.4.0
 */

import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import RedirectToAdminWorkspaceController from "./redirectToAdminWorkspaceController";

beforeEach(() => {
  jest.resetAllMocks();
});

describe("RedirectToAdminWorkspaceController", () => {
  describe("::exec", () => {
    it("should redirect to the administration workspace", async() => {
      expect.assertions(2);

      const worker = {
        tab: {
          id: 42,
        },
      };
      const account = new AccountEntity(defaultAccountDto());
      const expectedUrl = `${account.domain}/app/administration`;

      const controller = new RedirectToAdminWorkspaceController(worker, null, account);
      jest.spyOn(chrome.tabs, "update").mockImplementation(() => {});

      await controller.exec();

      expect(chrome.tabs.update).toHaveBeenCalledTimes(1);
      expect(chrome.tabs.update).toHaveBeenCalledWith(worker.tab.id, {url: expectedUrl});
    });
  });
});
