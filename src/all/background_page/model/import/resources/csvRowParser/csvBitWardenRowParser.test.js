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
import {getResourceTypeCollection} from './abstractCsvRowParser.test.data.js';
import ExternalResourceEntity from "../../../entity/resource/external/externalResourceEntity";
import CsvBitWardenRowParser from "./csvBitWardenRowParser";

describe("CsvBitWardenRowParser", () => {
  it("can parse BitWarden csv", () => {
    // minimum required fields
    let fields = ["name", "login_password"];
    expect(CsvBitWardenRowParser.canParse(fields)).toEqual(2);
    // all fields
    fields = ["name", "login_username", "login_uri", "login_password", "notes", "folder"];
    expect(CsvBitWardenRowParser.canParse(fields)).toEqual(6);
    // Missing one required field
    fields = ["name", "login_username", "login_uri", "notes", "folder"];
    expect(CsvBitWardenRowParser.canParse(fields)).toEqual(0);
    // Duplicate field
    fields = ["name", "login_username", "login_uri", "login_password", "notes", "folder", "folder"];
    expect(CsvBitWardenRowParser.canParse(fields)).toEqual(6);
    // additional fields not supported
    fields = ["name", "login_password", "Unsupported field"];
    expect(CsvBitWardenRowParser.canParse(fields)).toEqual(2);
  });

  it("parses legacy resource from csv row with minimum required properties", () => {
    const data = {
      "name": "Password 1"
    };
    const externalResourceEntity = CsvBitWardenRowParser.parse(data);
    expect(externalResourceEntity).toBeInstanceOf(ExternalResourceEntity);
    expect(externalResourceEntity.name).toEqual(data.name);
    expect(externalResourceEntity.username).toBeUndefined();
    expect(externalResourceEntity.uri).toBeUndefined();
    expect(externalResourceEntity.secretClear).toEqual("");
    expect(externalResourceEntity.description).toBeUndefined();
    expect(externalResourceEntity.folderParentPath).toEqual("");
  });

  it("parses legacy resource from csv row with all available properties", () => {
    const data = {
      "name": "Password 1",
      "login_username": "Username 1",
      "login_uri": "https://url1.com",
      "login_password": "Secret 1",
      "notes": "Description 1",
      "folder": "Folder 1"
    };
    const resourceTypeCollection = getResourceTypeCollection();
    jest.spyOn(resourceTypeCollection, "getFirst");
    const externalResourceEntity = CsvBitWardenRowParser.parse(data, resourceTypeCollection);
    expect(externalResourceEntity).toBeInstanceOf(ExternalResourceEntity);
    expect(externalResourceEntity.name).toEqual(data.name);
    expect(externalResourceEntity.username).toEqual(data.login_username);
    expect(externalResourceEntity.uri).toEqual(data.login_uri);
    expect(externalResourceEntity.secretClear).toEqual(data.login_password);
    expect(externalResourceEntity.description).toEqual(data.notes);
    expect(externalResourceEntity.folderParentPath).toEqual(data.folder);
    expect(resourceTypeCollection.getFirst).toHaveBeenCalled();
  });
});
