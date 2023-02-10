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
import Csv1PasswordRowComposer from "./csv1passwordRowComposer";
import ExternalResourceEntity from "../../../entity/resource/external/externalResourceEntity";

describe("Csv1PasswordComposer", () => {
  it("can compose 1password csv row", () => {
    const dto = {
      "name": "Password 1",
      "username": "Username 1",
      "uri": "https://url1.com",
      "secret_clear": "Secret 1",
      "description": "Description 1",
      "folder_parent_path": "Folder 1"
    };
    const externalResourceEntity = new ExternalResourceEntity(dto);
    const csvRow = Csv1PasswordRowComposer.compose(externalResourceEntity);
    expect(csvRow).toBeInstanceOf(Object);
    expect(csvRow.Title).toEqual(externalResourceEntity.name);
    expect(csvRow.Username).toEqual(externalResourceEntity.username);
    expect(csvRow.Url).toEqual(externalResourceEntity.uri);
    expect(csvRow.Password).toEqual(externalResourceEntity.secretClear);
    expect(csvRow.Notes).toEqual(externalResourceEntity.description);
    expect(csvRow.Type).toEqual(externalResourceEntity.folderParentPath);
  });
});
