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
 * @since         5.1.1
 */

import {enableFetchMocks} from "jest-fetch-mock";
import {mockApiResponse} from '../../../../../../test/mocks/mockApiResponse';
import UserKeyPoliciesSettingsApiService from "./userKeyPoliciesSettingsApiService";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import {defaultUserKeyPoliciesSettingsDto} from "passbolt-styleguide/src/shared/models/entity/userKeyPolicies/UserKeyPoliciesSettingsEntity.test.data";
import {v4 as uuidV4} from "uuid";

beforeEach(async() => {
  jest.clearAllMocks();
  enableFetchMocks();
});

describe("UserGpgKeyPolicieesSettingsApiService", () => {
  describe('::findSettingsAsGuest', () => {
    it("retrieves the settings from API", async() => {
      expect.assertions(1);

      const apiResponse = defaultUserKeyPoliciesSettingsDto();
      fetch.doMockOnceIf(/setup\/user-key-policies\/settings/, () => mockApiResponse(apiResponse));

      const apiClientOptions = defaultApiClientOptions();
      const service = new UserKeyPoliciesSettingsApiService(apiClientOptions);

      const userId = uuidV4();
      const authenticationToken = uuidV4();
      const resultDto = await service.findSettingsAsGuest(userId, authenticationToken);

      expect(resultDto).toStrictEqual(apiResponse);
    });

    it("throws an error if the userId is not a valid UUID", async() => {
      expect.assertions(1);

      const apiClientOptions = defaultApiClientOptions();
      const service = new UserKeyPoliciesSettingsApiService(apiClientOptions);

      const userId = "test";
      const authenticationToken = uuidV4();

      await expect(() => service.findSettingsAsGuest(userId, authenticationToken)).rejects.toThrow();
    });

    it("throws an error if the authenticationToken is not a valid UUID", async() => {
      expect.assertions(1);

      const apiClientOptions = defaultApiClientOptions();
      const service = new UserKeyPoliciesSettingsApiService(apiClientOptions);

      const userId = uuidV4();
      const authenticationToken = "test";

      await expect(() => service.findSettingsAsGuest(userId, authenticationToken)).rejects.toThrow();
    });
  });
});
