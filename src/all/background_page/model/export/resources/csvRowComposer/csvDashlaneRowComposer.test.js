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
import CsvDashlaneRowComposer from "./csvDashlaneRowComposer";

describe("CsvDashlaneRowComposer", () => {
  it("can compose dashlane csv row", () => {
    const dto = {
      "name": "Password 1",
      "username": "Username 1",
      "uri": "https://url1.com",
      "secret_clear": "Secret 1",
      "description": "Description 1",
      "folder_parent_path": "Folder 1"
    };
    const externalResourceEntity = new ExternalResourceEntity(dto);
    const csvRow = CsvDashlaneRowComposer.compose(externalResourceEntity);
    expect(csvRow).toBeInstanceOf(Object);
    expect(csvRow.title).toEqual(externalResourceEntity.name);
    expect(csvRow.username).toEqual(externalResourceEntity.username);
    expect(csvRow.url).toEqual(externalResourceEntity.uri);
    expect(csvRow.password).toEqual(externalResourceEntity.secretClear);
    expect(csvRow.note).toEqual(externalResourceEntity.description);
  });
});
