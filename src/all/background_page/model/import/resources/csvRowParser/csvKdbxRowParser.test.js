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
import ExternalResourceEntity from "../../../entity/resource/external/externalResourceEntity";
import CsvKdbxRowParser from "./csvKdbxRowParser";
import {resourceTypesCollectionDto} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection.test.data";
import ResourceTypesCollection from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection";
import MetadataTypesSettingsEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTypesSettingsEntity";
import {defaultMetadataTypesSettingsV4Dto} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTypesSettingsEntity.test.data";

describe("CsvKdbxRowParser", () => {
  it("can parse kdbx csv", () => {
    expect.assertions(5);
    // minimum required fields
    let fields = ["Title", "Password"];
    expect(CsvKdbxRowParser.canParse(fields)).toEqual(2);
    // all fields
    fields = ["Title", "Username", "URL", "Password", "Notes", "TOTP", "Group"];
    expect(CsvKdbxRowParser.canParse(fields)).toEqual(6);
    // Missing one required field
    fields = ["Title", "Username", "URL", "Notes", "Group"];
    expect(CsvKdbxRowParser.canParse(fields)).toEqual(0);
    // Duplicate field
    fields = ["Title", "Username", "URL", "Password", "Notes", "Group", "Group"];
    expect(CsvKdbxRowParser.canParse(fields)).toEqual(6);
    // additional fields not supported
    fields = ["Title", "Password", "Unsupported field"];
    expect(CsvKdbxRowParser.canParse(fields)).toEqual(2);
  });

  it("parses resource of type password-with-description with all properties from csv row", () => {
    expect.assertions(2);

    const data = {
      "Title": "Password 1",
      "Username": "Username 1",
      "URL": "https://url1.com",
      "Password": "Secret 1",
      "Notes": "Description 1",
      "Group": "Folder 1"
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
      folder_parent_path: data.Group,
    });

    const externalResourceEntity = CsvKdbxRowParser.parse(data, resourceTypesCollection, metadataTypesSettings);

    expect(externalResourceEntity).toBeInstanceOf(ExternalResourceEntity);
    expect(externalResourceEntity.toDto()).toEqual(expectedEntity.toDto());
  });

  it("parses resource of type password-description-totp with all properties from csv row", () => {
    expect.assertions(2);
    const data = {
      "Title": "Password 1",
      "Username": "Username 1",
      "URL": "https://url1.com",
      "Password": "Secret 1",
      "Notes": "Description 1",
      "TOTP": "otpauth://totp/test.com%20%3A%20admin%40passbolt.com:admin%40passbolt.com?secret=TJSNMLGTCYOEMXZG&period=30&digits=6&issuer=test.com%20%3A%20admin%40passbolt.com",
      "Group": "Folder 1"
    };

    const resourceTypesCollection = new ResourceTypesCollection(resourceTypesCollectionDto());
    const metadataTypesSettings = new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV4Dto());
    const expectedResourceType = resourceTypesCollection.items.find(resourceType =>  resourceType.slug === "password-description-totp");
    const expectedEntity = new ExternalResourceEntity({
      name: data.Title,
      username: data.Username,
      uri: data.URL,
      resource_type_id: expectedResourceType.id,
      secret_clear: data.Password,
      description: data.Notes,
      folder_parent_path: data.Group,
      totp: {
        period: 30,
        digits: 6,
        algorithm: "SHA1",
        secret_key: "TJSNMLGTCYOEMXZG"
      }
    });

    const externalResourceEntity = CsvKdbxRowParser.parse(data, resourceTypesCollection, metadataTypesSettings);

    expect(externalResourceEntity).toBeInstanceOf(ExternalResourceEntity);
    expect(externalResourceEntity.toDto()).toEqual(expectedEntity.toDto());
  });

  it("parses resource from csv raise an error if totp entity is not valid", () => {
    expect.assertions(1);
    const resourceTypesCollection = new ResourceTypesCollection(resourceTypesCollectionDto());
    const metadataTypesSettings = new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV4Dto());

    const data = {
      "Title": "Password 1",
      "Username": "Username 1",
      "URL": "https://url1.com",
      "Password": "Secret 1",
      "Notes": "Description 1",
      "TOTP": "otpauth://totp/test.com%20%3A%20admin%40passbolt.com:admin%40passbolt.com?secret=TJSNMLGTCYOEMXZG&period=30&digits=10&issuer=test.com%20%3A%20admin%40passbolt.com",
      "Group": "Folder 1"
    };
    try {
      CsvKdbxRowParser.parse(data, resourceTypesCollection, metadataTypesSettings);
    } catch (error) {
      expect(error.message).toStrictEqual("Could not validate entity TotpEntity.");
    }
  });
});
