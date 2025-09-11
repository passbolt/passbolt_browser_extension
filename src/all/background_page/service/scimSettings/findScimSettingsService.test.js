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
 * @since         5.5.0
 */

import {enableFetchMocks} from "jest-fetch-mock";
import {mockApiResponse, mockApiResponseError} from "passbolt-styleguide/test/mocks/mockApiResponse";
import FindScimSettingsService from "./findScimSettingsService";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import {
  scimSettingsWithoutSecretTokenDto,
} from "../api/scimSettings/scimSettingsApiService.test.data";
import PassboltApiFetchError from "passbolt-styleguide/src/shared/lib/Error/PassboltApiFetchError";
import PassboltServiceUnavailableError from "passbolt-styleguide/src/shared/lib/Error/PassboltServiceUnavailableError";
import ScimSettingsEntity from "passbolt-styleguide/src/shared/models/entity/scimSettings/scimSettingsEntity";

describe("FindScimSettingsService", () => {
  let apiClientOptions;

  beforeEach(async() => {
    enableFetchMocks();
    fetch.resetMocks();
    apiClientOptions = defaultApiClientOptions();
  });

  describe('::get', () => {
    it("retrieves the SCIM settings entity when settings exist", async() => {
      expect.assertions(2);
      const apiResponse = scimSettingsWithoutSecretTokenDto();
      fetch.doMockOnceIf(/scim\/settings\.json/, () => mockApiResponse(apiResponse));

      const service = new FindScimSettingsService(apiClientOptions);
      const result = await service.get();

      // The result should be a ScimSettingsEntity instance
      expect(result).toBeInstanceOf(ScimSettingsEntity);
      expect(result.id).toBe(apiResponse.id);
    });

    it("returns null when SCIM settings are not defined", async() => {
      expect.assertions(1);
      fetch.doMockOnceIf(/scim\/settings\.json/, () => mockApiResponse({}));

      const service = new FindScimSettingsService(apiClientOptions);
      const result = await service.get();

      expect(result).toBeNull();
    });

    it("throws service unavailable error if an error occurred but not from the API", async() => {
      expect.assertions(1);
      fetch.doMockOnceIf(/scim\/settings\.json/, () => { throw new Error("Service unavailable"); });

      const service = new FindScimSettingsService(apiClientOptions);

      await expect(() => service.get()).rejects.toThrow(PassboltServiceUnavailableError);
    });

    it("throws API error if the API encountered an issue", async() => {
      expect.assertions(1);
      fetch.doMockOnceIf(/scim\/settings\.json/, () => mockApiResponseError(500, "Something wrong happened!"));

      const service = new FindScimSettingsService(apiClientOptions);

      await expect(() => service.get()).rejects.toThrow(PassboltApiFetchError);
    });
  });
});
