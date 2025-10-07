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
import CsvLastPassRowComposer from "./csvLastPassRowComposer";
import {defaultTotpDto} from "../../../entity/totp/totpDto.test.data";

describe("CsvLastPassRowComposer", () => {
  it("can compose lastpass csv row", () => {
    const dto = {
      "name": "Password 1",
      "username": "Username 1",
      "uris": ["https://url1.com"],
      "secret_clear": "Secret 1",
      "description": "Description 1",
      "folder_parent_path": "Folder 1"
    };
    const externalResourceEntity = new ExternalResourceEntity(dto);
    const csvRow = CsvLastPassRowComposer.compose(externalResourceEntity);
    expect(csvRow).toBeInstanceOf(Object);
    expect(csvRow.name).toEqual(externalResourceEntity.name);
    expect(csvRow.username).toEqual(externalResourceEntity.username);
    expect(csvRow.url).toEqual(externalResourceEntity.uris[0]);
    expect(csvRow.password).toEqual(externalResourceEntity.secretClear);
    expect(csvRow.extra).toEqual(externalResourceEntity.description);
    expect(csvRow.grouping).toEqual(externalResourceEntity.folderParentPath);
  });

  it("can compose lastpass csv row with totp", () => {
    const dto = {
      "name": "Password 1",
      "username": "Username 1",
      "uris": ["https://url1.com"],
      "secret_clear": "Secret 1",
      "description": "Description 1",
      "folder_parent_path": "Folder 1",
      "totp": defaultTotpDto()
    };
    const externalResourceEntity = new ExternalResourceEntity(dto);
    const csvRow = CsvLastPassRowComposer.compose(externalResourceEntity);
    expect(csvRow).toBeInstanceOf(Object);
    expect(csvRow.name).toEqual(externalResourceEntity.name);
    expect(csvRow.username).toEqual(externalResourceEntity.username);
    expect(csvRow.url).toEqual(externalResourceEntity.uris[0]);
    expect(csvRow.password).toEqual(externalResourceEntity.secretClear);
    expect(csvRow.extra).toEqual(externalResourceEntity.description);
    expect(csvRow.grouping).toEqual(externalResourceEntity.folderParentPath);
    expect(csvRow.totp).toEqual(externalResourceEntity.totp.secretKey);
  });
});
