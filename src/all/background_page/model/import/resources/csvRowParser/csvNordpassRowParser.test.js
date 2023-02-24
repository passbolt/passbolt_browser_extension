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
import CsvNordpassRowParser from "./csvNordpassRowParser";
import ExternalResourceEntity from "../../../entity/resource/external/externalResourceEntity";

describe("CsvNordpassRowParser", () => {
  it("can parse LastPass csv", () => {
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

  it("parses legacy resource from csv row with minimum required properties", () => {
    const data = {
      "name": "Password 1"
    };
    const externalResourceEntity = CsvNordpassRowParser.parse(data);
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
      "username": "Username 1",
      "url": "https://url1.com",
      "password": "Secret 1",
      "note": "Description 1",
      "folder": "Folder 1"
    };
    const resourceTypeCollection = getResourceTypeCollection();
    jest.spyOn(resourceTypeCollection, "getFirst");
    const externalResourceEntity = CsvNordpassRowParser.parse(data, resourceTypeCollection);
    expect(externalResourceEntity).toBeInstanceOf(ExternalResourceEntity);
    expect(externalResourceEntity.name).toEqual(data.name);
    expect(externalResourceEntity.username).toEqual(data.username);
    expect(externalResourceEntity.uri).toEqual(data.url);
    expect(externalResourceEntity.secretClear).toEqual(data.password);
    expect(externalResourceEntity.description).toEqual(data.note);
    expect(externalResourceEntity.folderParentPath).toEqual(data.folder);
    expect(resourceTypeCollection.getFirst).toHaveBeenCalled();
  });
});
