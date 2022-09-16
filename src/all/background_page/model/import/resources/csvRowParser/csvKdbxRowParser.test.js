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

describe("CsvKdbxRowParser", () => {
  it("can parse kdbx csv", () => {
    // minimum required fields
    let fields = ["Title", "Password"];
    expect(CsvKdbxRowParser.canParse(fields)).toEqual(2);
    // all fields
    fields = ["Title", "Username", "URL", "Password", "Notes", "Group"];
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
});
