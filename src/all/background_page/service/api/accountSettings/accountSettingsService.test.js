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
import {defaultThemeCollectionDtos} from "../../../model/entity/theme/themesCollection.test.data";
import {accountSettingsService_midgarThemeDto} from "./accountSettingsService.test.data";

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

  describe("::findAll", () => {
    it("should return $expectedFindAllThemes with ids and names", async() => {
      expect.assertions(2);

      const expectedFindAllThemes = defaultThemeCollectionDtos();
      fetch.doMockOnceIf(new RegExp('/settings/themes'), async() => await mockApiResponse(expectedFindAllThemes));
      const receivedFindAllThemes = await service.findAllThemes();

      expect(receivedFindAllThemes.length).toBe(expectedFindAllThemes.length);
      expect(receivedFindAllThemes).toStrictEqual(expectedFindAllThemes);
    });
  });
});
