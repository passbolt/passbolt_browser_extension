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
 * @since         4.3.0
 */

import GetResourceGridUserSettingController from "./getResourceGridUserSettingController";
import {RESOURCE_GRID_USER_SETTING_STORAGE_KEY} from "../../service/local_storage/ressourceGridSettingLocalStorage";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

describe("GetResourceColumnsSettingController", () => {
  describe("GetResourceColumnsSettingController::exec", () => {
    it("Should retrieve the resource columns settings empty if no setting exists in local storage.", async() => {
      const account = new AccountEntity(defaultAccountDto());
      const controller = new GetResourceGridUserSettingController(null, null, account);
      const gridUserSetting = await controller.exec();

      expect.assertions(1);
      expect(gridUserSetting).toEqual(null);
    });

    it("Should retrieve the resource columns settings.", async() => {
      const account = new AccountEntity(defaultAccountDto());
      const columnsSetting = [{id: "name", label: "name"}];
      const sorter = {propertyName: "name", asc: true};
      const gridUserSetting = {columns_setting: columnsSetting, sorter: sorter};
      jest.spyOn(browser.storage.local, "get").mockImplementationOnce(() => ({[`${RESOURCE_GRID_USER_SETTING_STORAGE_KEY}-${account.id}`]: gridUserSetting}));
      const controller = new GetResourceGridUserSettingController(null, null, account);
      const gridUserSettingEntity = await controller.exec();

      expect.assertions(1);
      const settingsDto = gridUserSettingEntity.toJSON();
      expect(settingsDto).toEqual(gridUserSetting);
    });

    it("Should retrieve the resource columns settings empty if an error occurred.", async() => {
      const account = new AccountEntity(defaultAccountDto());
      const columnsSetting = {};
      jest.spyOn(browser.storage.local, "get").mockImplementationOnce(() => ({[`${RESOURCE_GRID_USER_SETTING_STORAGE_KEY}-${account.id}`]: columnsSetting}));
      const controller = new GetResourceGridUserSettingController(null, null, account);
      const gridUserSetting = await controller.exec();

      expect.assertions(1);
      expect(gridUserSetting).toEqual(null);
    });
  });
});
