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
 * @since         5.0.0
 */

import {RESOURCE_GRID_USER_SETTING_STORAGE_KEY} from "../../service/local_storage/ressourceGridSettingLocalStorage";
import ResetResourceGridUserSettingController from "./resetResourceGridUserSettingController";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

describe("ResetResourceColumnsSettingController", () => {
  describe("::exec", () => {
    it("Should flush the resource columns settings in the local storage.", async() => {
      expect.assertions(1);
      const account = new AccountEntity(defaultAccountDto());
      jest.spyOn(browser.storage.local, "remove");
      const controller = new ResetResourceGridUserSettingController(null, null, account);
      await controller.exec();

      expect(browser.storage.local.remove).toHaveBeenCalledWith(`${RESOURCE_GRID_USER_SETTING_STORAGE_KEY}-${account.id}`);
    });
  });
});
