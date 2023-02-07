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
import Csv1PasswordRowParser from "./csv1PasswordRowParser";
import ExternalResourceEntity from "../../../entity/resource/external/externalResourceEntity";

describe("Csv1PasswordRowParser", () => {
  it("can parse 1password csv", () => {
    // minimum required fields
    let fields = ["Title", "Password"];
    expect(Csv1PasswordRowParser.canParse(fields)).toEqual(2);
    // all fields
    fields = ["Title", "Username", "Url", "Password", "Notes", "Type"];
    expect(Csv1PasswordRowParser.canParse(fields)).toEqual(6);
    // Missing one required field
    fields = ["Title", "Username", "Url", "Notes", "Type"];
    expect(Csv1PasswordRowParser.canParse(fields)).toEqual(0);
    // Duplicate field
    fields = ["Title", "Username", "Url", "Password", "Notes", "Type", "Type"];
    expect(Csv1PasswordRowParser.canParse(fields)).toEqual(6);
    // additional fields not supported
    fields = ["Title", "Password", "Unsupported field"];
    expect(Csv1PasswordRowParser.canParse(fields)).toEqual(2);
  });

  it("parses legacy resource from csv row with minimum required properties", () => {
    const data = {
      "Title": "Password 1"
    };
    const externalResourceEntity = Csv1PasswordRowParser.parse(data);
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
      "Url": "https://url1.com",
      "Password": "Secret 1",
      "Notes": "Description 1",
      "Type": "Folder 1"
    };
    const externalResourceEntity = Csv1PasswordRowParser.parse(data);
    expect(externalResourceEntity).toBeInstanceOf(ExternalResourceEntity);
    expect(externalResourceEntity.name).toEqual(data.Title);
    expect(externalResourceEntity.username).toEqual(data.Username);
    expect(externalResourceEntity.uri).toEqual(data.Url);
    expect(externalResourceEntity.secretClear).toEqual(data.Password);
    expect(externalResourceEntity.description).toEqual(data.Notes);
    expect(externalResourceEntity.folderParentPath).toEqual(data.Type);
  });
});
