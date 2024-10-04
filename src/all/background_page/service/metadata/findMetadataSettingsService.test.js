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
 * @since         4.10.0
 */

import FindMetadataSettingsService from "./findMetadataSettingsService";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import MetadataTypesSettingsApiService from "../api/metadata/metadataTypesSettingsApiService";
import {
  defaultMetadataTypesSettingsV4Dto,
  defaultMetadataTypesSettingsV50FreshDto
} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTypesSettingsEntity.test.data";
import MetadataTypesSettingsEntity
  from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTypesSettingsEntity";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("FindMetadataSettingsService", () => {
  let findMetadataTypesSettingsService, apiClientOptions;

  beforeEach(async() => {
    apiClientOptions = defaultApiClientOptions();
    findMetadataTypesSettingsService = new FindMetadataSettingsService(apiClientOptions);
  });

  describe("::findTypesSettings", () => {
    it("retrieve the metadata types settings.", async() => {
      expect.assertions(2);
      const metadataTypesSettingsDto = defaultMetadataTypesSettingsV50FreshDto();
      jest.spyOn(MetadataTypesSettingsApiService.prototype, "findSettings").mockImplementation(() => metadataTypesSettingsDto);

      const entity = await findMetadataTypesSettingsService.findTypesSettings();

      expect(entity).toBeInstanceOf(MetadataTypesSettingsEntity);
      expect(entity.toDto()).toEqual(metadataTypesSettingsDto);
    });

    it("marshall the API data with local default", async() => {
      expect.assertions(2);
      jest.spyOn(MetadataTypesSettingsApiService.prototype, "findSettings").mockImplementation(() => {});

      const entity = await findMetadataTypesSettingsService.findTypesSettings();

      expect(entity).toBeInstanceOf(MetadataTypesSettingsEntity);
      // The value of the default are expected to evolve with passbolt transitioning to v5 types.
      expect(entity.toDto()).toEqual(defaultMetadataTypesSettingsV4Dto());
    });
  });
});
