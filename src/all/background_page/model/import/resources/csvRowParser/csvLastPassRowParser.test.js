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
import CsvLastPassRowParser from "./csvLastPassRowParser";
import ExternalResourceEntity from "../../../entity/resource/external/externalResourceEntity";
import ResourceTypesCollection from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection";
import MetadataTypesSettingsEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTypesSettingsEntity";
import {defaultMetadataTypesSettingsV4Dto, defaultMetadataTypesSettingsV50FreshDto} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTypesSettingsEntity.test.data";
import {resourceTypesCollectionDto} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection.test.data";
import {RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION_SLUG, RESOURCE_TYPE_V5_DEFAULT_SLUG, RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP_SLUG, RESOURCE_TYPE_V5_DEFAULT_TOTP_SLUG, RESOURCE_TYPE_V5_STANDALONE_NOTE_SLUG} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypeSchemasDefinition";
import ImportResourcesFileEntity from "../../../entity/import/importResourcesFileEntity";
import BinaryConvert from "../../../../utils/format/binaryConvert";
import {SECRET_DATA_OBJECT_TYPE} from "passbolt-styleguide/src/shared/models/entity/secretData/secretDataEntity";

describe("CsvLastPassRowParser", () => {
  it("can parse LastPass csv", () => {
    expect.assertions(5);

    // minimum required fields
    let fields = ["name", "password"];
    expect(CsvLastPassRowParser.canParse(fields)).toEqual(2);
    // all fields
    fields = ["name", "username", "url", "password", "extra", "grouping"];
    expect(CsvLastPassRowParser.canParse(fields)).toEqual(6);
    // Missing one required field
    fields = ["name", "username", "url", "extra", "grouping"];
    expect(CsvLastPassRowParser.canParse(fields)).toEqual(0);
    // Duplicate field
    fields = ["name", "username", "url", "password", "extra", "grouping", "grouping"];
    expect(CsvLastPassRowParser.canParse(fields)).toEqual(6);
    // additional fields not supported
    fields = ["name", "password", "Unsupported field"];
    expect(CsvLastPassRowParser.canParse(fields)).toEqual(2);
  });

  it("parses resource of type resource-with-description with all properties from csv row", () => {
    expect.assertions(2);

    const data = {
      "name": "Password 1",
      "username": "Username 1",
      "url": "https://url1.com",
      "password": "Secret 1",
      "extra": "Description 1",
      "grouping": "Folder 1"
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
      description: data.extra,
      folder_parent_path: data.grouping,
    });

    const externalResourceEntity = CsvLastPassRowParser.parse(data, importEntity, resourceTypesCollection, metadataTypesSettings);

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
      "extra": "Description 1",
      "grouping": "Folder 1"
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
      description: data.extra,
      folder_parent_path: data.grouping,
    });

    const externalResourceEntity = CsvLastPassRowParser.parse(data, importEntity, resourceTypesCollection, metadataTypesSettings);

    expect(externalResourceEntity).toBeInstanceOf(ExternalResourceEntity);
    expect(externalResourceEntity.toDto()).toEqual(expectedEntity.toDto());
  });

  it("parses resource with TOTP secret key from LastPass CSV", () => {
    expect.assertions(2);

    const data = {
      "name": "Test site",
      "username": "user1",
      "url": "https://sitename",
      "password": "password1",
      "totp": "TMMNBXF73KLJGMZF",
      "extra": "",
      "grouping": "(none)",
      "fav": "0"
    };

    const importDto = {
      "ref": "import-ref",
      "file_type": "csv",
      "file": btoa(BinaryConvert.toBinary(data))
    };
    const importEntity = new ImportResourcesFileEntity(importDto);
    const resourceTypesCollection = new ResourceTypesCollection(resourceTypesCollectionDto());
    const metadataTypesSettings = new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV4Dto());
    const expectedResourceType = resourceTypesCollection.items.find(resourceType =>  resourceType.slug === RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP_SLUG);
    const expectedEntity = new ExternalResourceEntity({
      name: data.name,
      username: data.username,
      uris: [data.url],
      resource_type_id: expectedResourceType.id,
      secret_clear: data.password,
      folder_parent_path: data.grouping,
      totp: {
        secret_key: "TMMNBXF73KLJGMZF",
        algorithm: "SHA1",
        digits: 6,
        period: 30
      }
    });

    const externalResourceEntity = CsvLastPassRowParser.parse(data, importEntity, resourceTypesCollection, metadataTypesSettings);

    expect(externalResourceEntity).toBeInstanceOf(ExternalResourceEntity);
    expect(externalResourceEntity.toDto()).toEqual(expectedEntity.toDto());
  });

  it("parses resource with TOTP secret key for v5 default with TOTP", () => {
    expect.assertions(2);

    const data = {
      "name": "Test site",
      "username": "user1",
      "url": "https://sitename",
      "password": "password1",
      "totp": "TMMNBXF73KLJGMZF",
      "extra": "",
      "grouping": "(none)",
      "fav": "0"
    };

    const importDto = {
      "ref": "import-ref",
      "file_type": "csv",
      "file": btoa(BinaryConvert.toBinary(data))
    };
    const importEntity = new ImportResourcesFileEntity(importDto);
    const resourceTypesCollection = new ResourceTypesCollection(resourceTypesCollectionDto());
    const metadataTypesSettings = new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV50FreshDto());
    const expectedResourceType = resourceTypesCollection.items.find(resourceType =>  resourceType.slug === RESOURCE_TYPE_V5_DEFAULT_TOTP_SLUG);
    const expectedEntity = new ExternalResourceEntity({
      name: data.name,
      username: data.username,
      uris: [data.url],
      resource_type_id: expectedResourceType.id,
      secret_clear: data.password,
      folder_parent_path: data.grouping,
      totp: {
        secret_key: "TMMNBXF73KLJGMZF",
        algorithm: "SHA1",
        digits: 6,
        period: 30
      }
    });

    const externalResourceEntity = CsvLastPassRowParser.parse(data, importEntity, resourceTypesCollection, metadataTypesSettings);

    expect(externalResourceEntity).toBeInstanceOf(ExternalResourceEntity);
    expect(externalResourceEntity.toDto()).toEqual(expectedEntity.toDto());
  });
  it("parses resource of type standalone v5 notes with all properties from csv row", () => {
    expect.assertions(3);

    const data = {
      "name": "Test site",
      "username": "user1",
      "url": "https://sitename",
      "password": "",
      "totp": "",
      "extra": "notes",
      "grouping": "(none)",
      "fav": "0"
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
      name: data.name,
      username: data.username,
      uris: [data.url],
      resource_type_id: expectedResourceType.id,
      secret_clear: data.password,
      folder_parent_path: data.grouping,
      description: "notes",
    });

    const externalResourceEntity = CsvLastPassRowParser.parse(data, importEntity, resourceTypesCollection, metadataTypesSettings);

    expect(externalResourceEntity).toBeInstanceOf(ExternalResourceEntity);
    expect(externalResourceEntity.toDto()).toEqual(expectedEntity.toDto());
    expect(externalResourceEntity.toSecretDto(expectedResourceType)).toEqual({description: 'notes', object_type: SECRET_DATA_OBJECT_TYPE});
  });
});
