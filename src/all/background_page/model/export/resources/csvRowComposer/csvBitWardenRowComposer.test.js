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
import CsvBitWardenRowComposer from "./csvBitWardenRowComposer";
import ExternalResourceEntity from "../../../entity/resource/external/externalResourceEntity";
describe("CsvBitWardenRowComposer", () => {
  it("can compose bitwarden csv row", () => {
    const dto = {
      "name": "Password 1",
      "username": "Username 1",
      "uris": ["https://url1.com", "https://url2.com", "https://url3.com"],
      "secret_clear": "Secret 1",
      "description": "Description 1",
      "folder_parent_path": "Folder 1"
    };
    const externalResourceEntity = new ExternalResourceEntity(dto);
    const csvRow = CsvBitWardenRowComposer.compose(externalResourceEntity);
    expect(csvRow).toBeInstanceOf(Object);
    expect(csvRow.name).toEqual(externalResourceEntity.name);
    expect(csvRow.login_username).toEqual(externalResourceEntity.username);
    expect(csvRow.login_uri).toEqual(externalResourceEntity.uris.join(","));
    expect(csvRow.login_password).toEqual(externalResourceEntity.secretClear);
    expect(csvRow.notes).toEqual(externalResourceEntity.description);
    expect(csvRow.folder).toEqual(externalResourceEntity.folderParentPath);
  });
});
