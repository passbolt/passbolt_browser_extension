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
  defaultMetadataTypesSettingsV50FreshDto
} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTypesSettingsEntity.test.data";
import MetadataTypesSettingsEntity
, {
  RESOURCE_TYPE_VERSION_4,
  RESOURCE_TYPE_VERSION_5
} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTypesSettingsEntity";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";

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
      expect.assertions(13);
      jest.spyOn(MetadataTypesSettingsApiService.prototype, "findSettings").mockImplementation(() => defaultMetadataTypesSettingsV50FreshDto());

      const entity = await findMetadataTypesSettingsService.findTypesSettings();

      expect(entity).toBeInstanceOf(MetadataTypesSettingsEntity);
      expect(entity._props.default_resource_types).toEqual(RESOURCE_TYPE_VERSION_5);
      expect(entity._props.default_folder_type).toEqual(RESOURCE_TYPE_VERSION_4);
      expect(entity._props.default_tag_type).toEqual(RESOURCE_TYPE_VERSION_4);
      expect(entity._props.default_comment_type).toEqual(RESOURCE_TYPE_VERSION_4);
      expect(entity._props.allow_creation_of_v5_resources).toBeTruthy();
      expect(entity._props.allow_creation_of_v5_folders).toBeFalsy();
      expect(entity._props.allow_creation_of_v5_tags).toBeFalsy();
      expect(entity._props.allow_creation_of_v5_comments).toBeFalsy();
      expect(entity._props.allow_creation_of_v4_resources).toBeFalsy();
      expect(entity._props.allow_creation_of_v4_folders).toBeTruthy();
      expect(entity._props.allow_creation_of_v4_tags).toBeTruthy();
      expect(entity._props.allow_creation_of_v4_comments).toBeTruthy();
    });

    it("throws an error if the API return invalid data", async() => {
      expect.assertions(1);
      jest.spyOn(MetadataTypesSettingsApiService.prototype, "findSettings").mockImplementation(() => {});

      await expect(() => findMetadataTypesSettingsService.findTypesSettings()).rejects.toThrow(EntityValidationError);
    });
  });
});
