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
import {v4 as uuid} from "uuid";
import browser from "../../sdk/polyfill/browserPolyfill";
import {RESOURCE_GRID_USER_SETTING_STORAGE_KEY} from "../../service/local_storage/ressourceGridSettingLocalStorage";

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

describe("GetResourceColumnsSettingController", () => {
  describe("GetResourceColumnsSettingController::exec", () => {
    it("Should retrieve the resource columns settings empty if no setting exists in local storage.", async() => {
      const mockedAccount = {id: uuid()};
      const controller = new GetResourceGridUserSettingController(null, null, mockedAccount);
      const gridUserSetting = await controller.exec();

      expect.assertions(1);
      expect(gridUserSetting).toEqual(null);
    });

    it("Should retrieve the resource columns settings.", async() => {
      const mockedAccount = {id: uuid()};
      const columnsSetting = [{id: "name"}];
      const sorter = {propertyName: "name", asc: true};
      const gridUserSetting = {columns_setting: columnsSetting, sorter: sorter};
      jest.spyOn(browser.storage.local, "get").mockImplementationOnce(() => ({[`${RESOURCE_GRID_USER_SETTING_STORAGE_KEY}-${mockedAccount.id}`]: gridUserSetting}));
      const controller = new GetResourceGridUserSettingController(null, null, mockedAccount);
      const gridUserSettingEntity = await controller.exec();

      expect.assertions(1);
      const settingsDto = gridUserSettingEntity.toJSON();
      expect(settingsDto).toEqual(gridUserSetting);
    });

    it("Should retrieve the resource columns settings empty if an error occurred.", async() => {
      const mockedAccount = {id: uuid()};
      const columnsSetting = {};
      jest.spyOn(browser.storage.local, "get").mockImplementationOnce(() => ({[`${RESOURCE_GRID_USER_SETTING_STORAGE_KEY}-${mockedAccount.id}`]: columnsSetting}));
      const controller = new GetResourceGridUserSettingController(null, null, mockedAccount);
      const gridUserSetting = await controller.exec();

      expect.assertions(1);
      expect(gridUserSetting).toEqual(null);
    });
  });
});
