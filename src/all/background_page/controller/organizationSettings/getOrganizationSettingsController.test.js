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
import {mockApiResponse} from "../../../tests/mocks/mockApiResponse";
import {defaultApiClientOptions} from "../../service/api/apiClient/apiClientOptions.test.data";
import {anonymousOrganizationSettings} from "../../model/entity/organizationSettings/organizationSettingsEntity.test.data";
import {GetOrganizationSettingsController} from "./getOrganizationSettingsController";

beforeEach(() => {
  enableFetchMocks();
});

describe("GetOrganizationSettingsController", () => {
  describe("GetOrganizationSettingsController::exec", () => {
    it("Should retrieve the organization settings.", async() => {
      // Mock API fetch account recovery organization policy response.
      const mockApiResult = anonymousOrganizationSettings();
      fetch.doMock(() => mockApiResponse(mockApiResult));

      const controller = new GetOrganizationSettingsController(null, null, defaultApiClientOptions());
      const organizationSettings = await controller.exec();

      expect.assertions(1);
      const settingsDto = organizationSettings.toDto();
      await expect(settingsDto).toEqual(mockApiResult);
    });
  });
});
