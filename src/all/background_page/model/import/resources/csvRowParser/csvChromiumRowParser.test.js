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
 */
import MetadataTypesSettingsEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTypesSettingsEntity";
import ExternalResourceEntity from "../../../entity/resource/external/externalResourceEntity";
import CsvChromiumRowParser from "./csvChromiumRowParser";
import ResourceTypesCollection from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection";
import {
  resourceTypesCollectionDto
} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection.test.data";
import {defaultMetadataTypesSettingsV4Dto} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTypesSettingsEntity.test.data";

describe("CsvChromiumRowParser", () => {
  it("can parse Chromium based browsers csv", () => {
    expect.assertions(5);

    // minimum required fields
    let fields = ["name", "password"];
    expect(CsvChromiumRowParser.canParse(fields)).toEqual(2);
    // all fields
    fields = ["name", "username", "url", "password"];
    expect(CsvChromiumRowParser.canParse(fields)).toEqual(4);
    // Missing one required field
    fields = ["name", "username", "url"];
    expect(CsvChromiumRowParser.canParse(fields)).toEqual(0);
    // Duplicate field
    fields = ["name", "username", "url", "password", "password"];
    expect(CsvChromiumRowParser.canParse(fields)).toEqual(4);
    // additional fields not supported
    fields = ["name", "password", "Unsupported field"];
    expect(CsvChromiumRowParser.canParse(fields)).toEqual(2);
  });

  it("parses resource of type resource-with-description with all properties from csv row", () => {
    expect.assertions(2);

    const data = {
      "name": "Password 1",
      "username": "Username 1",
      "url": "https://url1.com",
      "password": "Secret 1",
    };

    const resourceTypesCollection = new ResourceTypesCollection(resourceTypesCollectionDto());
    const metadataTypesSettings = new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV4Dto());
    const expectedResourceType = resourceTypesCollection.items.find(resourceType =>  resourceType.slug === "password-and-description");
    const expectedEntity = new ExternalResourceEntity({
      name: data.name,
      username: data.username,
      uri: data.url,
      resource_type_id: expectedResourceType.id,
      secret_clear: data.password,
    });

    const externalResourceEntity = CsvChromiumRowParser.parse(data, resourceTypesCollection, metadataTypesSettings);

    expect(externalResourceEntity).toBeInstanceOf(ExternalResourceEntity);
    expect(externalResourceEntity.toDto()).toEqual(expectedEntity.toDto());
  });
});
