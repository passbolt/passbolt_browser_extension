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
import {defaultMetadataTypesSettingsV4Dto, defaultMetadataTypesSettingsV50FreshDto} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTypesSettingsEntity.test.data";
import {RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION_SLUG, RESOURCE_TYPE_V5_DEFAULT_SLUG, RESOURCE_TYPE_V5_STANDALONE_NOTE_SLUG} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypeSchemasDefinition";
import ImportResourcesFileEntity from "../../../entity/import/importResourcesFileEntity";
import BinaryConvert from "../../../../utils/format/binaryConvert";
import {SECRET_DATA_OBJECT_TYPE} from "passbolt-styleguide/src/shared/models/entity/secretData/secretDataEntity";

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

  it("parses resource of type password-with-description with all properties from csv row", () => {
    expect.assertions(2);

    const data = {
      "title": "Password 1",
      "username": "Username 1",
      "url": "https://url1.com",
      "password": "Secret 1",
      "note": "Description 1",
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
      name: data.title,
      username: data.username,
      uris: [data.url],
      resource_type_id: expectedResourceType.id,
      secret_clear: data.password,
      description: data.note,
    });

    const externalResourceEntity = CsvDashlaneRowParser.parse(data, importEntity, resourceTypesCollection, metadataTypesSettings);

    expect(externalResourceEntity).toBeInstanceOf(ExternalResourceEntity);
    expect(externalResourceEntity.toDto()).toEqual(expectedEntity.toDto());
  });

  it("parses resource of type default-v5 with all properties from csv row", () => {
    expect.assertions(2);

    const data = {
      "title": "Password 1",
      "username": "Username 1",
      "url": "https://url1.com",
      "password": "Secret 1",
      "note": "Description 1",
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
      name: data.title,
      username: data.username,
      uris: [data.url],
      resource_type_id: expectedResourceType.id,
      secret_clear: data.password,
      description: data.note,
    });

    const externalResourceEntity = CsvDashlaneRowParser.parse(data, importEntity, resourceTypesCollection, metadataTypesSettings);

    expect(externalResourceEntity).toBeInstanceOf(ExternalResourceEntity);
    expect(externalResourceEntity.toDto()).toEqual(expectedEntity.toDto());
  });

  it("parses resource of type standalone v5 notes with all properties from csv row", () => {
    expect.assertions(3);

    const data = {
      "title": "Password 1",
      "username": "Username 1",
      "url": "https://url1.com",
      "password": "",
      "note": "Description 1",
    };

    const importDto = {
      "ref": "import-ref",
      "file_type": "csv",
      "file": btoa(BinaryConvert.toBinary(data))
    };
    const importEntity = new ImportResourcesFileEntity(importDto);
    const resourceTypesCollection = new ResourceTypesCollection(resourceTypesCollectionDto());
    const metadataTypesSettings = new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV50FreshDto());
    const expectedResourceType = resourceTypesCollection.items.find(resourceType =>  resourceType.slug === RESOURCE_TYPE_V5_STANDALONE_NOTE_SLUG);
    const expectedEntity = new ExternalResourceEntity({
      name: data.title,
      username: data.username,
      uris: [data.url],
      resource_type_id: expectedResourceType.id,
      secret_clear: data.password,
      description: data.note,
      secret_object_type: SECRET_DATA_OBJECT_TYPE
    });

    const externalResourceEntity = CsvDashlaneRowParser.parse(data, importEntity, resourceTypesCollection, metadataTypesSettings);

    expect(externalResourceEntity).toBeInstanceOf(ExternalResourceEntity);
    expect(externalResourceEntity.toDto()).toEqual(expectedEntity.toDto());
    expect(externalResourceEntity.toSecretDto(expectedResourceType)).toEqual({description: 'Description 1', object_type: SECRET_DATA_OBJECT_TYPE});
  });
});

