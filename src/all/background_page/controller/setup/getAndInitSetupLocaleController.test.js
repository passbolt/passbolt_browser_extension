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
 * @since         3.6.0
 */

import {enableFetchMocks} from "jest-fetch-mock";
import {defaultApiClientOptions} from "../../service/api/apiClient/apiClientOptions.test.data";
import GetAndInitSetupLocaleController from "./getAndInitSetupLocaleController";
import {mockApiResponse} from "../../../../../test/mocks/mockApiResponse";
import {anonymousOrganizationSettings} from "../../model/entity/organizationSettings/organizationSettingsEntity.test.data";
import {initialAccountSetupDto} from "../../model/entity/account/accountSetupEntity.test.data";
import AccountSetupEntity from "../../model/entity/account/accountSetupEntity";

// Reset the modules before each test.
beforeEach(() => {
  enableFetchMocks();
});

describe("GetAndInitSetupLocaleController", () => {
  describe("GetAndInitSetupLocaleController::exec", () => {
    it("Should get the locale defined on the account if one defined.", async() => {
      const account = new AccountSetupEntity(initialAccountSetupDto({locale: "fr-FR"}));
      const controller = new GetAndInitSetupLocaleController(null, null, defaultApiClientOptions(), account);

      // Mock API fetch organization settings
      const mockOrganizationSettings = anonymousOrganizationSettings();
      fetch.doMockOnce(() => mockApiResponse(mockOrganizationSettings));

      expect.assertions(1);
      const locale = await controller.exec();
      expect(locale.toDto()).toEqual({locale: "fr-FR"});
    });

    it("Should fallback on the browser locale if supported and no account locale defined.", async() => {
      const account = new AccountSetupEntity(initialAccountSetupDto());
      const controller = new GetAndInitSetupLocaleController(null, null, defaultApiClientOptions(), account);

      // Mock API fetch organization settings
      const mockOrganizationSettings = anonymousOrganizationSettings();
      fetch.doMockOnce(() => mockApiResponse(mockOrganizationSettings));
      // Mock the navigator locale
      const languageGetterMock = jest.spyOn(self.navigator, 'language', 'get');
      languageGetterMock.mockReturnValue("de-AT");

      expect.assertions(1);
      const locale = await controller.exec();
      expect(locale.toDto()).toEqual({locale: "de-DE"});
    });

    it("Should fallback on a similar browser locale if supported, browser locale not supported and no account locale defined.", async() => {
      const account = new AccountSetupEntity(initialAccountSetupDto());
      const controller = new GetAndInitSetupLocaleController(null, null, defaultApiClientOptions(), account);

      // Mock API fetch organization settings
      const mockOrganizationSettings = anonymousOrganizationSettings();
      fetch.doMockOnce(() => mockApiResponse(mockOrganizationSettings));
      // Mock the navigator locale
      const languageGetterMock = jest.spyOn(self.navigator, 'language', 'get');
      languageGetterMock.mockReturnValue("de-DE");

      expect.assertions(1);
      const locale = await controller.exec();
      expect(locale.toDto()).toEqual({locale: "de-DE"});
    });

    it("Should fallback on the organization locale if browser language is not supported and no account locale was defined.", async() => {
      const account = new AccountSetupEntity(initialAccountSetupDto());
      const controller = new GetAndInitSetupLocaleController(null, null, defaultApiClientOptions(), account);

      // Mock API fetch organization settings
      const mockOrganizationSettings = anonymousOrganizationSettings({app: {locale: "ja-JP"}});
      fetch.doMockOnce(() => mockApiResponse(mockOrganizationSettings));
      // Mock the navigator locale
      const languageGetterMock = jest.spyOn(self.navigator, 'language', 'get');
      languageGetterMock.mockReturnValue("ma-MA");

      expect.assertions(1);
      const locale = await controller.exec();
      expect(locale.toDto()).toEqual({locale: "ja-JP"});
    });

    it("Should fallback on English.", async() => {
      const account = new AccountSetupEntity(initialAccountSetupDto());
      const controller = new GetAndInitSetupLocaleController(null, null, defaultApiClientOptions(), account);

      // Mock API fetch organization settings
      const mockOrganizationSettings = anonymousOrganizationSettings({app: {locale: null}});
      fetch.doMockOnce(() => mockApiResponse(mockOrganizationSettings));
      // Mock the navigator locale
      const languageGetterMock = jest.spyOn(self.navigator, 'language', 'get');
      languageGetterMock.mockReturnValue("ma-MA");

      expect.assertions(1);
      const locale = await controller.exec();
      expect(locale.toDto()).toEqual({locale: "en-UK"});
    });
  });
});
