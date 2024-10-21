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
import CsvDashlaneRowParser from "./csvDashlaneRowParser";
import ExternalResourceEntity from "../../../entity/resource/external/externalResourceEntity";
import ResourceTypesCollection from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection";
import {
  resourceTypesCollectionDto
} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection.test.data";
import MetadataTypesSettingsEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTypesSettingsEntity";
import {defaultMetadataTypesSettingsV4Dto} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTypesSettingsEntity.test.data";

describe("CsvDashlaneRowParser", () => {
  it("can parse LastPass csv", () => {
    expect.assertions(5);

    // minimum required fields
    let fields = ["title", "password"];
    expect(CsvDashlaneRowParser.canParse(fields)).toEqual(2);
    // all fields
    fields = ["title", "username", "url", "password", "note"];
    expect(CsvDashlaneRowParser.canParse(fields)).toEqual(5);
    // Missing one required field
    fields = ["title", "username", "url", "note"];
    expect(CsvDashlaneRowParser.canParse(fields)).toEqual(0);
    // Duplicate field
    fields = ["title", "username", "url", "password", "note", "note"];
    expect(CsvDashlaneRowParser.canParse(fields)).toEqual(5);
    // additional fields not supported
    fields = ["title", "password", "Unsupported field"];
    expect(CsvDashlaneRowParser.canParse(fields)).toEqual(2);
  });

  it("parses legacy resource from csv row with all available properties <V4>", () => {
    expect.assertions(2);

    const data = {
      "title": "Password 1",
      "username": "Username 1",
      "url": "https://url1.com",
      "password": "Secret 1",
      "note": "Description 1",
    };
    const resourceTypesCollection = new ResourceTypesCollection(resourceTypesCollectionDto());
    const metadataTypesSettings = new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV4Dto());
    const expectedResourceType = resourceTypesCollection.items.find(resourceType =>  resourceType.slug === "password-and-description");
    const expectedEntity = new ExternalResourceEntity({
      name: data.title,
      username: data.username,
      uri: data.url,
      resource_type_id: expectedResourceType.id,
      secret_clear: data.password,
      description: data.note,
    });

    const externalResourceEntity = CsvDashlaneRowParser.parse(data, resourceTypesCollection, metadataTypesSettings);

    expect(externalResourceEntity).toBeInstanceOf(ExternalResourceEntity);
    expect(externalResourceEntity.toDto()).toEqual(expectedEntity.toDto());
  });
});
