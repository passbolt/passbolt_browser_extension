/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *a
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 */
import CsvSafariRowParser from "./csvSafariRowParser";
import ExternalResourceEntity from "../../../entity/resource/external/externalResourceEntity";
import ResourceTypesCollection from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection";
import {
  resourceTypesCollectionDto
} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection.test.data";
import MetadataTypesSettingsEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTypesSettingsEntity";
import {defaultMetadataTypesSettingsV4Dto} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTypesSettingsEntity.test.data";

describe("CsvSafariRowParser", () => {
  it("can parse Safari csv", () => {
    expect.assertions(5);

    // minimum required fields
    let fields = ["Title", "Password"];
    expect(CsvSafariRowParser.canParse(fields)).toEqual(2);
    // all fields
    fields = ["Title", "Username", "URL", "Password", "Notes"];
    expect(CsvSafariRowParser.canParse(fields)).toEqual(5);
    // Missing one required field
    fields = ["Title", "Username", "URL", "Notes"];
    expect(CsvSafariRowParser.canParse(fields)).toEqual(0);
    // Duplicate field
    fields = ["Title", "Username", "URL", "Password", "Notes", "Notes"];
    expect(CsvSafariRowParser.canParse(fields)).toEqual(5);
    // additional fields not supported
    fields = ["Title", "Password", "Unsupported field"];
    expect(CsvSafariRowParser.canParse(fields)).toEqual(2);
  });

  it("parses resource of type resource-with-description with all properties from csv row", () => {
    expect.assertions(2);

    const data = {
      "Title": "Password 1",
      "Username": "Username 1",
      "URL": "https://url1.com",
      "Password": "Secret 1",
      "Notes": "Description 1",
    };
    const resourceTypesCollection = new ResourceTypesCollection(resourceTypesCollectionDto());
    const metadataTypesSettings = new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV4Dto());
    const expectedResourceType = resourceTypesCollection.items.find(resourceType =>  resourceType.slug === "password-and-description");
    const expectedEntity = new ExternalResourceEntity({
      name: data.Title,
      username: data.Username,
      uri: data.URL,
      resource_type_id: expectedResourceType.id,
      secret_clear: data.Password,
      description: data.Notes,
    });

    const externalResourceEntity = CsvSafariRowParser.parse(data, resourceTypesCollection, metadataTypesSettings);

    expect(externalResourceEntity).toBeInstanceOf(ExternalResourceEntity);
    expect(externalResourceEntity.toDto()).toEqual(expectedEntity.toDto());
  });
});
