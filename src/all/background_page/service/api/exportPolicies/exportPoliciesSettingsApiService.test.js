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
 * @since         v5.10.0
 */

import { enableFetchMocks } from "jest-fetch-mock";
import { mockApiResponse, mockApiResponseError } from "../../../../../../test/mocks/mockApiResponse";
import PassboltApiFetchError from "passbolt-styleguide/src/shared/lib/Error/PassboltApiFetchError";
import PassboltServiceUnavailableError from "passbolt-styleguide/src/shared/lib/Error/PassboltServiceUnavailableError";
import ExportPoliciesSettingsApiService from "./exportPoliciesSettingsApiService";
import PassboltResponseEntity from "passbolt-styleguide/src/shared/models/entity/apiService/PassboltResponseEntity";
import { defaultExportPoliciesSettingsDto } from "passbolt-styleguide/src/shared/models/entity/exportSettings/ExportPoliciesSettingsEntity.test.data";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";

describe("ExportPoliciesSettingsApiService", () => {
  let apiClientOptions;

  beforeEach(async () => {
    enableFetchMocks();
    fetch.resetMocks();
    apiClientOptions = defaultApiClientOptions();
  });

  describe("::find", () => {
    it("should return the dto served by the API", async () => {
      expect.assertions(2);
      const expectedDto = defaultExportPoliciesSettingsDto();
      fetch.doMockOnceIf(/export-policies\/settings\.json/, () => mockApiResponse(expectedDto));

      const service = new ExportPoliciesSettingsApiService(apiClientOptions);
      const result = await service.find();

      expect(result).toBeInstanceOf(PassboltResponseEntity);
      expect(result.body).toStrictEqual(expectedDto);
    });

    it("should throw an error if the API returns an error response", async () => {
      expect.assertions(1);
      fetch.doMockOnceIf(/export-policies\/settings\.json/, () => mockApiResponseError(500, "Something went wrong!"));

      const service = new ExportPoliciesSettingsApiService(apiClientOptions);
      await expect(() => service.find()).rejects.toThrow(PassboltApiFetchError);
    });

    it("should throw an error if something happens on the API", async () => {
      expect.assertions(1);
      fetch.doMockOnceIf(/export-policies\/settings\.json/, () => {
        throw new Error("Something went wrong");
      });

      const service = new ExportPoliciesSettingsApiService(apiClientOptions);

      await expect(() => service.find()).rejects.toThrow(PassboltServiceUnavailableError);
    });
  });
});
