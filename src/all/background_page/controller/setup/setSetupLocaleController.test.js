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
import {anonymousOrganizationSettings} from "../../model/entity/organizationSettings/organizationSettingsEntity.test.data";
import {mockApiResponse} from "../../../../../test/mocks/mockApiResponse";
import SetSetupLocaleController from "./setSetupLocaleController";
import AccountSetupEntity from "../../model/entity/account/accountSetupEntity";
import {initialAccountSetupDto} from "../../model/entity/account/accountSetupEntity.test.data";

beforeEach(() => {
  enableFetchMocks();
});

describe("SetAccountLocaleController", () => {
  describe("SetAccountLocaleController::exec", () => {
    it("Should set the account locale and initialize i18next with it.", async() => {
      const account = new AccountSetupEntity(initialAccountSetupDto());
      const controller = new SetSetupLocaleController(null, null, defaultApiClientOptions(), account);

      // Mock API fetch organization settings
      const mockApiResult = anonymousOrganizationSettings();
      fetch.doMockOnce(() => mockApiResponse(mockApiResult));

      expect.assertions(1);
      const localeDto = {locale: "fr-FR"};
      await controller.exec(localeDto);
      expect(account.locale).toEqual(localeDto.locale);
    });

    it("Should not accept unsupported locale.", async() => {
      const account = new AccountSetupEntity(initialAccountSetupDto());
      const controller = new SetSetupLocaleController(null, null, defaultApiClientOptions(), account);

      // Mock API fetch organization settings
      const mockApiResult = anonymousOrganizationSettings();
      fetch.doMockOnce(() => mockApiResponse(mockApiResult));

      expect.assertions(1);
      const localeDto = {locale: "ma-MA"};
      const promise = controller.exec(localeDto);
      await expect(promise).rejects.toThrowError("Unsupported locale.");
    });
  });
});
