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

import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import AccountEntity from "../../model/entity/account/accountEntity";
import GetAndInitializeAccountLocaleController from "./getAndInitializeAccountLocaleController";
import {enableFetchMocks} from "jest-fetch-mock";
import {defaultApiClientOptions} from "../../service/api/apiClient/apiClientOptions.test.data";
import {anonymousOrganizationSettings} from "../../model/entity/organizationSettings/organizationSettingsEntity.test.data";
import {mockApiResponse} from "../../../../../test/mocks/mockApiResponse";

beforeEach(() => {
  enableFetchMocks();
});

describe("GetAndInitializeAccountLocaleController", () => {
  describe("GetAndInitializeAccountLocaleController::exec", () => {
    it("Should retrieve the account locale and initialize i18next with it.", async() => {
      const storedAccountDto = defaultAccountDto();
      const storedAccount = new AccountEntity(storedAccountDto);
      const controller = new GetAndInitializeAccountLocaleController(null, null, defaultApiClientOptions(), storedAccount);

      // Mock API fetch organization settings
      const mockApiResult = anonymousOrganizationSettings();
      fetch.doMockOnce(() => mockApiResponse(mockApiResult));

      expect.assertions(1);
      const locale = await controller.exec();
      const expectedLocaleDto = {locale: "de-DE", label: "Deutsch"};
      expect(locale.toDto()).toEqual(expectedLocaleDto);
    });

    it("Should retrieve the organization locale if no account locale defined and initialize i18next with it.", async() => {
      const storedAccountDto = defaultAccountDto({locale: null});
      const storedAccount = new AccountEntity(storedAccountDto);
      const controller = new GetAndInitializeAccountLocaleController(null, null, defaultApiClientOptions(), storedAccount);

      // Mock API fetch organization settings
      const mockApiResult = anonymousOrganizationSettings();
      fetch.doMockOnce(() => mockApiResponse(mockApiResult));

      expect.assertions(1);
      const locale = await controller.exec();
      const expectedLocaleDto = {locale: "en-UK", label: "English"};
      expect(locale.toDto()).toEqual(expectedLocaleDto);
    });


    it("Should fallback on default extension locale if nothing found.", async() => {
      const storedAccountDto = defaultAccountDto({locale: null});
      const storedAccount = new AccountEntity(storedAccountDto);
      const controller = new GetAndInitializeAccountLocaleController(null, null, defaultApiClientOptions(), storedAccount);

      // Mock API fetch organization settings
      const mockApiResult = anonymousOrganizationSettings({app: {locale: null}});
      fetch.doMockOnce(() => mockApiResponse(mockApiResult));

      expect.assertions(1);
      const locale = await controller.exec();
      const expectedLocaleDto = {locale: "en-UK", label: "English"};
      expect(locale.toDto()).toEqual(expectedLocaleDto);
    });
  });
});
