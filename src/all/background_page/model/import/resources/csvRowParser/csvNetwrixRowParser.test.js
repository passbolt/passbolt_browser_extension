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
 * @since         5.18.0
 */
import CsvNetwrixRowParser from "./csvNetwrixRowParser";
import ExternalResourceEntity from "../../../entity/resource/external/externalResourceEntity";
import ResourceTypesCollection from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection";
import { resourceTypesCollectionDto } from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection.test.data";
import {
  defaultMetadataTypesSettingsV4Dto,
  defaultMetadataTypesSettingsV50FreshDto,
} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTypesSettingsEntity.test.data";
import MetadataTypesSettingsEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTypesSettingsEntity";
import {
  RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION_SLUG,
  RESOURCE_TYPE_V5_DEFAULT_SLUG,
} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypeSchemasDefinition";
import ImportResourcesFileEntity from "../../../entity/import/importResourcesFileEntity";
import BinaryConvert from "../../../../utils/format/binaryConvert";

describe("CsvNetwrixRowParser", () => {
  const buildImportEntity = (data) =>
    new ImportResourcesFileEntity({ ref: "import-ref", file_type: "csv", file: btoa(BinaryConvert.toBinary(data)) });

  it("can parse netwrix csv", () => {
    expect.assertions(4);

    // minimum required fields
    let fields = ["Description", "Password"];
    expect(CsvNetwrixRowParser.canParse(fields)).toEqual(2);
    // all fields
    fields = ["DataTags", "Description", "User name", "Password", "Internet address", "Email address"];
    expect(CsvNetwrixRowParser.canParse(fields)).toEqual(4);
    // Missing one required field
    fields = ["DataTags", "User name", "Password", "Internet address", "Email address"];
    expect(CsvNetwrixRowParser.canParse(fields)).toEqual(0);
    // additional fields not supported
    fields = ["Description", "Password", "Unsupported field"];
    expect(CsvNetwrixRowParser.canParse(fields)).toEqual(2);
  });

  it("parses resource of type password-and-description with all properties from csv row", () => {
    expect.assertions(2);

    const data = {
      DataTags: "Tag1|Tag2|Tag3",
      Description: "Google",
      "User name": "Hans.Mustermann",
      Password: "Secret 1",
      "Internet address": "https://www.google.de",
      "Email address": "hans@mustermann.de",
    };
    const importEntity = buildImportEntity(data);
    const resourceTypesCollection = new ResourceTypesCollection(resourceTypesCollectionDto());
    const metadataTypesSettings = new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV4Dto());
    const expectedResourceType = resourceTypesCollection.items.find(
      (resourceType) => resourceType.slug === RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION_SLUG,
    );
    const expectedEntity = new ExternalResourceEntity({
      name: "Google",
      username: "Hans.Mustermann",
      uris: ["https://www.google.de"],
      resource_type_id: expectedResourceType.id,
      secret_clear: "Secret 1",
    });

    const externalResourceEntity = CsvNetwrixRowParser.parse(
      data,
      importEntity,
      resourceTypesCollection,
      metadataTypesSettings,
    );

    expect(externalResourceEntity).toBeInstanceOf(ExternalResourceEntity);
    expect(externalResourceEntity.toDto()).toEqual(expectedEntity.toDto());
  });

  it("parses resource of type default-v5 with all properties from csv row", () => {
    expect.assertions(2);

    const data = {
      DataTags: "",
      Description: "Google",
      "User name": "Hans.Mustermann",
      Password: "Secret 1",
      "Internet address": "https://www.google.de",
      "Email address": "hans@mustermann.de",
    };
    const importEntity = buildImportEntity(data);
    const resourceTypesCollection = new ResourceTypesCollection(resourceTypesCollectionDto());
    const metadataTypesSettings = new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV50FreshDto());
    const expectedResourceType = resourceTypesCollection.items.find(
      (resourceType) => resourceType.slug === RESOURCE_TYPE_V5_DEFAULT_SLUG,
    );
    const expectedEntity = new ExternalResourceEntity({
      name: "Google",
      username: "Hans.Mustermann",
      uris: ["https://www.google.de"],
      resource_type_id: expectedResourceType.id,
      secret_clear: "Secret 1",
    });

    const externalResourceEntity = CsvNetwrixRowParser.parse(
      data,
      importEntity,
      resourceTypesCollection,
      metadataTypesSettings,
    );

    expect(externalResourceEntity).toBeInstanceOf(ExternalResourceEntity);
    expect(externalResourceEntity.toDto()).toEqual(expectedEntity.toDto());
  });

  it("uses the email address as username if the user name is empty", () => {
    expect.assertions(1);

    const data = {
      Description: "Google",
      "User name": "",
      Password: "Secret 1",
      "Email address": "hans@mustermann.de",
    };
    const importEntity = buildImportEntity(data);
    const resourceTypesCollection = new ResourceTypesCollection(resourceTypesCollectionDto());
    const metadataTypesSettings = new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV50FreshDto());

    const externalResourceEntity = CsvNetwrixRowParser.parse(
      data,
      importEntity,
      resourceTypesCollection,
      metadataTypesSettings,
    );

    expect(externalResourceEntity.username).toEqual("hans@mustermann.de");
  });
});
