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
import CsvKdbxRowComposer from "./csvKdbxRowComposer";
import ExternalResourceEntity from "../../../entity/resource/external/externalResourceEntity";

describe("CsvKdbxComposer", () => {
  it("can compose kdbx csv row", () => {
    const dto = {
      "name": "Password 1",
      "username": "Username 1",
      "uri": "https://url1.com",
      "secret_clear": "Secret 1",
      "description": "Description 1",
      "folder_parent_path": "Folder 1"
    };
    const externalResourceEntity = new ExternalResourceEntity(dto);
    const csvRow = CsvKdbxRowComposer.compose(externalResourceEntity);
    expect(csvRow).toBeInstanceOf(Object);
    expect(csvRow.Title).toEqual(externalResourceEntity.name);
    expect(csvRow.Username).toEqual(externalResourceEntity.username);
    expect(csvRow.URL).toEqual(externalResourceEntity.uri);
    expect(csvRow.Password).toEqual(externalResourceEntity.secretClear);
    expect(csvRow.Notes).toEqual(externalResourceEntity.description);
    expect(csvRow.Group).toEqual(externalResourceEntity.folderParentPath);
  });
});
