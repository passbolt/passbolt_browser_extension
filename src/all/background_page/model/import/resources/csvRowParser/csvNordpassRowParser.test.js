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
import CsvNordpassRowParser from "./csvNordpassRowParser";
import ExternalResourceEntity from "../../../entity/resource/external/externalResourceEntity";
import ResourceTypesCollection from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection";
import {
  resourceTypesCollectionDto
} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection.test.data";
import MetadataTypesSettingsEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTypesSettingsEntity";
import {defaultMetadataTypesSettingsV4Dto, defaultMetadataTypesSettingsV50FreshDto} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTypesSettingsEntity.test.data";
import {RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION_SLUG, RESOURCE_TYPE_V5_DEFAULT_SLUG} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypeSchemasDefinition";
import BinaryConvert from "../../../../utils/format/binaryConvert";
import ImportResourcesFileEntity from "../../../entity/import/importResourcesFileEntity";

describe("CsvNordpassRowParser", () => {
  it("can parse LastPass csv", () => {
    expect.assertions(5);

    // minimum required fields
    let fields = ["name", "password"];
    expect(CsvNordpassRowParser.canParse(fields)).toEqual(2);
    // all fields
    fields = ["name", "username", "url", "password", "note", "folder"];
    expect(CsvNordpassRowParser.canParse(fields)).toEqual(6);
    // Missing one required field
    fields = ["name", "username", "url", "note", "folder"];
    expect(CsvNordpassRowParser.canParse(fields)).toEqual(0);
    // Duplicate field
    fields = ["name", "username", "url", "password", "note", "folder", "folder"];
    expect(CsvNordpassRowParser.canParse(fields)).toEqual(6);
    // additional fields not supported
    fields = ["name", "password", "Unsupported field"];
    expect(CsvNordpassRowParser.canParse(fields)).toEqual(2);
  });

  it("parses resource of type resource-with-description with all properties from csv row", () => {
    expect.assertions(2);

    const data = {
      "name": "Password 1",
      "username": "Username 1",
      "url": "https://url1.com",
      "password": "Secret 1",
      "note": "Description 1",
      "folder": "Folder 1"
    };
    const importDto = {
      "ref": "import-ref",
      "file_type": "csv",
      "file": btoa(BinaryConvert.toBinary(data))
    };
    const importEntity = new ImportResourcesFileEntity(importDto);
    const resourceTypesCollection = new ResourceTypesCollection(resourceTypesCollectionDto());
    const metadataTypesSettings = new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV4Dto());
    const expectedResourceType = resourceTypesCollection.items.find(resourceType =>  resourceType.slug === RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION_SLUG);
    const expectedEntity = new ExternalResourceEntity({
      name: data.name,
      username: data.username,
      uris: [data.url],
      resource_type_id: expectedResourceType.id,
      secret_clear: data.password,
      description: data.note,
      folder_parent_path: data.folder,
    });

    const externalResourceEntity = CsvNordpassRowParser.parse(data, importEntity, resourceTypesCollection, metadataTypesSettings);

    expect(externalResourceEntity).toBeInstanceOf(ExternalResourceEntity);
    expect(externalResourceEntity.toDto()).toEqual(expectedEntity.toDto());
  });

  it("parses resource of type default-v5 with all properties from csv row", () => {
    expect.assertions(2);

    const data = {
      "name": "Password 1",
      "username": "Username 1",
      "url": "https://url1.com",
      "password": "Secret 1",
      "note": "Description 1",
      "folder": "Folder 1"
    };
    const importDto = {
      "ref": "import-ref",
      "file_type": "csv",
      "file": btoa(BinaryConvert.toBinary(data))
    };
    const importEntity = new ImportResourcesFileEntity(importDto);
    const resourceTypesCollection = new ResourceTypesCollection(resourceTypesCollectionDto());
    const metadataTypesSettings = new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV50FreshDto());
    const expectedResourceType = resourceTypesCollection.items.find(resourceType =>  resourceType.slug === RESOURCE_TYPE_V5_DEFAULT_SLUG);
    const expectedEntity = new ExternalResourceEntity({
      name: data.name,
      username: data.username,
      uris: [data.url],
      resource_type_id: expectedResourceType.id,
      secret_clear: data.password,
      description: data.note,
      folder_parent_path: data.folder,
    });

    const externalResourceEntity = CsvNordpassRowParser.parse(data, importEntity, resourceTypesCollection, metadataTypesSettings);

    expect(externalResourceEntity).toBeInstanceOf(ExternalResourceEntity);
    expect(externalResourceEntity.toDto()).toEqual(expectedEntity.toDto());
  });
});
