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
import EnableScimSettingsService from "./enableScimSettingsService";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import {
  defaultScimSettingsDto,
  scimSettingsWithoutSecretTokenDto,
} from "../api/scimSettings/scimSettingsApiService.test.data";
import PassboltApiFetchError from "passbolt-styleguide/src/shared/lib/Error/PassboltApiFetchError";
import PassboltServiceUnavailableError from "passbolt-styleguide/src/shared/lib/Error/PassboltServiceUnavailableError";
import ScimSettingsEntity from "passbolt-styleguide/src/shared/models/entity/scimSettings/scimSettingsEntity";

describe("EnableScimSettingsService", () => {
  let apiClientOptions;

  beforeEach(async() => {
    enableFetchMocks();
    fetch.resetMocks();
    apiClientOptions = defaultApiClientOptions();
  });

  describe('::enable', () => {
    it("successfully creates SCIM settings", async() => {
      expect.assertions(2);

      const apiResponse = scimSettingsWithoutSecretTokenDto();
      fetch.doMockOnceIf(/scim\/settings\.json/, () => mockApiResponse(apiResponse));
      const expected = {
        ...apiResponse,
        secret_token: ScimSettingsEntity.EMPTY_SECRET_VALUE
      };

      const service = new EnableScimSettingsService(apiClientOptions);
      const scimSetting = new ScimSettingsEntity(new defaultScimSettingsDto());
      const result = await service.enable(scimSetting);

      // The result should be a ScimSettingsEntity instance with the correct ID
      expect(result).toBeInstanceOf(ScimSettingsEntity);
      expect(result).toEqual(new ScimSettingsEntity(expected));
    });

    it("throws an error for invalid input type", async() => {
      expect.assertions(1);
      const service = new EnableScimSettingsService(apiClientOptions);

      await expect(() => service.enable({})).rejects.toThrow(TypeError);
    });

    it("throws service unavailable error if an error occurred but not from the API", async() => {
      expect.assertions(1);
      fetch.doMockOnceIf(/scim\/settings\.json/, () => { throw new Error("Service unavailable"); });

      const service = new EnableScimSettingsService(apiClientOptions);
      const scimSetting = new ScimSettingsEntity(defaultScimSettingsDto());

      await expect(() => service.enable(scimSetting)).rejects.toThrow(PassboltServiceUnavailableError);
    });

    it("throws API error if the API encountered an issue", async() => {
      expect.assertions(1);
      fetch.doMockOnceIf(/scim\/settings\.json/, () => mockApiResponseError(500, "Something wrong happened!"));

      const service = new EnableScimSettingsService(apiClientOptions);
      const scimSetting = new ScimSettingsEntity(defaultScimSettingsDto());

      await expect(() => service.enable(scimSetting)).rejects.toThrow(PassboltApiFetchError);
    });
  });
});
