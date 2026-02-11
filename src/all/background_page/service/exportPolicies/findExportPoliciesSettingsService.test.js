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
import FindExportPoliciesSettingsService from "./findExportPoliciesSettingsService";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import ExportPoliciesSettingsEntity from "passbolt-styleguide/src/shared/models/entity/exportSettings/ExportPoliciesSettingsEntity";
import { defaultExportPoliciesSettingsDto } from "passbolt-styleguide/src/shared/models/entity/exportSettings/ExportPoliciesSettingsEntity.test.data";
import { mockApiResponse, mockApiResponseError } from "../../../../../test/mocks/mockApiResponse";

beforeEach(() => {
  jest.clearAllMocks();
  enableFetchMocks();
});

describe("FindExportPoliciesSettingsService", () => {
  describe("::find", () => {
    it("should retrieve the export policies settings.", async () => {
      expect.assertions(2);

      const expectedSettings = defaultExportPoliciesSettingsDto();
      const apiClientOptions = defaultApiClientOptions();
      const service = new FindExportPoliciesSettingsService(apiClientOptions);

      fetch.doMockOnceIf(/\/export-policies\/settings\.json/, () => mockApiResponse(expectedSettings));

      const exportPoliciesSettingsEntity = await service.find();

      expect(exportPoliciesSettingsEntity).toBeInstanceOf(ExportPoliciesSettingsEntity);
      expect(exportPoliciesSettingsEntity.toDto()).toStrictEqual(expectedSettings);
    });

    it("should consider default settings if the API sends back a 404", async () => {
      expect.assertions(2);

      const apiClientOptions = defaultApiClientOptions();
      const service = new FindExportPoliciesSettingsService(apiClientOptions);

      fetch.doMockOnceIf(/\/export-policies\/settings\.json/, () =>
        mockApiResponseError(404, "Endpoint does not exists"),
      );

      const exportPoliciesSettingsEntity = await service.find();

      expect(exportPoliciesSettingsEntity).toBeInstanceOf(ExportPoliciesSettingsEntity);
      expect(exportPoliciesSettingsEntity.source).toStrictEqual("default");
    });

    it("should not intercept the error from the API if something goes wrong and it is not a 404", async () => {
      expect.assertions(1);

      const apiClientOptions = defaultApiClientOptions();
      const service = new FindExportPoliciesSettingsService(apiClientOptions);

      fetch.doMockOnce(/\/export-policies\/settings\.json/, () => mockApiResponseError(500, "Something went wrong!"));

      await expect(() => service.find()).rejects.toThrowError();
    });
  });
});
