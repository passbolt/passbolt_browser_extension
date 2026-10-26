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
 * @since         5.18.0
 */
import ExternalResourceEntity from "../../../entity/resource/external/externalResourceEntity";
import CsvNetwrixRowComposer from "./csvNetwrixRowComposer";
describe("CsvNetwrixRowComposer", () => {
  it("can compose netwrix csv row", () => {
    const dto = {
      name: "Password 1",
      username: "Username 1",
      uris: ["https://url1.com"],
      secret_clear: "Secret 1",
      description: "Description 1",
      folder_parent_path: "Folder 1",
    };
    const externalResourceEntity = new ExternalResourceEntity(dto);
    const csvRow = CsvNetwrixRowComposer.compose(externalResourceEntity);
    expect(csvRow).toEqual({
      DataTags: "",
      Description: externalResourceEntity.name,
      "User name": externalResourceEntity.username,
      Password: externalResourceEntity.secretClear,
      "Internet address": externalResourceEntity.uris[0],
      "Email address": "",
    });
  });
});
