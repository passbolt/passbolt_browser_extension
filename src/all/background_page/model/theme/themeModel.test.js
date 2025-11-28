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
 * @since         5.8.0
 */

import {enableFetchMocks} from "jest-fetch-mock";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import ThemeModel from "./themeModel";
import {defaultThemeCollectionDtos} from "../../model/entity/theme/themesCollection.test.data";
import {mockApiResponse} from "../../../../../test/mocks/mockApiResponse";
import ThemesCollection from "../entity/theme/themesCollection";
import {Config} from "../config";
import {midgarThemeDto} from "../entity/theme/themeEntity.test.data";

describe("themeModel", () => {
  let themeModelObj;

  beforeEach(() => {
    enableFetchMocks();
    jest.clearAllMocks();
    const defaultOptions = defaultApiClientOptions();
    themeModelObj = new ThemeModel(defaultOptions);
  });

  describe("::constructor", () => {
    it("should create themeModel object", () => {
      expect.assertions(1);
      expect(themeModelObj).toBeInstanceOf(ThemeModel);
    });
  });

  describe("::findAll", () => {
    it("should return a ThemesCollection Object", async() => {
      expect.assertions(2);

      const themesCollectionDto = defaultThemeCollectionDtos();
      fetch.doMockOnceIf(new RegExp('/settings/themes'), async() => await mockApiResponse(themesCollectionDto));
      const received = await themeModelObj.findAll();

      expect(received).toBeInstanceOf(ThemesCollection);
      expect(received.toDto()).toStrictEqual(themesCollectionDto);
    });
  });

  describe("::change", () => {
    it("should call accountSettingService.updateTheme and update user.settings.theme configuration", async() => {
      expect.assertions(3);

      const themeDto = midgarThemeDto();
      const themeName = themeDto.name;

      jest.spyOn(themeModelObj.accountSettingsService, "updateTheme");
      jest.spyOn(Config, "write");

      fetch.doMockOnceIf(new RegExp('/settings/themes'), async() => await mockApiResponse(themeDto)); //in actual the theme is passed with value and not name

      await themeModelObj.change(themeDto); // here the function retrives it name with name

      expect(themeModelObj.accountSettingsService.updateTheme).toHaveBeenCalledTimes(1);
      expect(themeModelObj.accountSettingsService.updateTheme).toHaveBeenCalledWith(themeName);
      expect(Config.write).toHaveBeenCalledWith('user.settings.theme', themeName);
    });
  });
});
