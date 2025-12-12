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

import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import AccountSettingsService from "./accountSettingsService";
import {enableFetchMocks} from "jest-fetch-mock";
import {mockApiResponse} from "../../../../../../test/mocks/mockApiResponse";
import {accountSettingsService_midgarThemeDto, accountSettingsService_themesDto, accountSettingsService_localeDto} from "./accountSettingsService.test.data";

describe("accountSettingsService", () => {
  let service;
  beforeEach(() => {
    enableFetchMocks();
    jest.clearAllMocks();
    const apiClientOptions = defaultApiClientOptions();
    service = new AccountSettingsService(apiClientOptions);
  });

  describe("::updateTheme", () => {
    it("should update the theme value to $expectedUpdateThemeName", async() => {
      expect.assertions(1);

      const expectedUpdateThemeName = "midgar";
      fetch.doMockOnceIf(new RegExp('/settings/themes'), async() => await mockApiResponse(accountSettingsService_midgarThemeDto()));
      const receivedUpdateThemeName = await service.updateTheme(expectedUpdateThemeName);

      expect(receivedUpdateThemeName.value).toBe(expectedUpdateThemeName);
    });
  });

  describe("::findAllThemes", () => {
    it("should return all available themes", async() => {
      expect.assertions(1);

      const expectedThemes = accountSettingsService_themesDto();
      fetch.doMockOnceIf(new RegExp('/settings/themes'), async() => await mockApiResponse(expectedThemes));
      const result = await service.findAllThemes();

      expect(result).toEqual(expectedThemes);
    });
  });

  describe("::updateLocale", () => {
    it("should update the locale value", async() => {
      expect.assertions(1);

      const expectedLocale = "en-UK";
      fetch.doMockOnceIf(new RegExp('/settings/locales'), async() => await mockApiResponse(accountSettingsService_localeDto()));
      const result = await service.updateLocale(expectedLocale);

      expect(result.value).toBe(expectedLocale);
    });
  });
});
