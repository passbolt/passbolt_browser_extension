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
import ResourceTypesCollection from "../../../entity/resourceType/resourceTypesCollection";

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

  it("parses legacy resource from csv row with minimum required properties", () => {
    expect.assertions(7);
    const data = {
      "Title": "Password 1"
    };
    const externalResourceEntity = CsvKdbxRowParser.parse(data);
    expect(externalResourceEntity).toBeInstanceOf(ExternalResourceEntity);
    expect(externalResourceEntity.name).toEqual(data.Title);
    expect(externalResourceEntity.username).toBeUndefined();
    expect(externalResourceEntity.uri).toBeUndefined();
    expect(externalResourceEntity.secretClear).toEqual("");
    expect(externalResourceEntity.description).toBeUndefined();
    expect(externalResourceEntity.folderParentPath).toEqual("");
  });

  it("parses legacy resource from csv row with all available properties", () => {
    expect.assertions(7);
    const data = {
      "Title": "Password 1",
      "Username": "Username 1",
      "URL": "https://url1.com",
      "Password": "Secret 1",
      "Notes": "Description 1",
      "Group": "Folder 1"
    };
    const externalResourceEntity = CsvKdbxRowParser.parse(data);
    expect(externalResourceEntity).toBeInstanceOf(ExternalResourceEntity);
    expect(externalResourceEntity.name).toEqual(data.Title);
    expect(externalResourceEntity.username).toEqual(data.Username);
    expect(externalResourceEntity.uri).toEqual(data.URL);
    expect(externalResourceEntity.secretClear).toEqual(data.Password);
    expect(externalResourceEntity.description).toEqual(data.Notes);
    expect(externalResourceEntity.folderParentPath).toEqual(data.Group);
  });

  it("parses resource from csv row with all available properties", () => {
    expect.assertions(11);
    const resourceTypesCollection = new ResourceTypesCollection(resourceTypesCollectionDto());
    const data = {
      "Title": "Password 1",
      "Username": "Username 1",
      "URL": "https://url1.com",
      "Password": "Secret 1",
      "Notes": "Description 1",
      "TOTP": "otpauth://totp/test.com%20%3A%20admin%40passbolt.com:admin%40passbolt.com?secret=TJSNMLGTCYOEMXZG&period=30&digits=6&issuer=test.com%20%3A%20admin%40passbolt.com",
      "Group": "Folder 1"
    };
    const externalResourceEntity = CsvKdbxRowParser.parse(data, resourceTypesCollection);
    expect(externalResourceEntity).toBeInstanceOf(ExternalResourceEntity);
    expect(externalResourceEntity.name).toEqual(data.Title);
    expect(externalResourceEntity.username).toEqual(data.Username);
    expect(externalResourceEntity.uri).toEqual(data.URL);
    expect(externalResourceEntity.secretClear).toEqual(data.Password);
    expect(externalResourceEntity.description).toEqual(data.Notes);
    expect(externalResourceEntity.folderParentPath).toEqual(data.Group);
    expect(externalResourceEntity.totp.secretKey).toEqual("TJSNMLGTCYOEMXZG");
    expect(externalResourceEntity.totp.period).toEqual(30);
    expect(externalResourceEntity.totp.digits).toEqual(6);
    expect(externalResourceEntity.totp.algorithm).toEqual("SHA1");
  });

  it("parses resource from csv raise an error if totp entity is not valid", () => {
    expect.assertions(1);
    const resourceTypesCollection = new ResourceTypesCollection(resourceTypesCollectionDto());
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
      CsvKdbxRowParser.parse(data, resourceTypesCollection);
    } catch (error) {
      expect(error.message).toStrictEqual("Could not validate entity TotpEntity.");
    }
  });
});
