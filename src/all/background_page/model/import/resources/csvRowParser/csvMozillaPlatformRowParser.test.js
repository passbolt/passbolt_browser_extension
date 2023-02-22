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
import CsvMozillaPlatformRowParser from "./csvMozillaPlatformRowParser";
import ExternalResourceEntity from "../../../entity/resource/external/externalResourceEntity";

describe("CsvMozillaPlatformRowParser", () => {
  it("can parse Mozilla Platform based browsers csv", () => {
    // minimum required fields
    let fields = ["url", "password"];
    expect(CsvMozillaPlatformRowParser.canParse(fields)).toEqual(3);
    // all fields
    fields = ["name", "username", "url", "password"];
    expect(CsvMozillaPlatformRowParser.canParse(fields)).toEqual(4);
    // Missing one required field
    fields = ["name", "username", "url"];
    expect(CsvMozillaPlatformRowParser.canParse(fields)).toEqual(0);
    // Duplicate field
    fields = ["name", "username", "url", "password", "password"];
    expect(CsvMozillaPlatformRowParser.canParse(fields)).toEqual(4);
    // additional fields not supported
    fields = ["url", "password", "Unsupported field"];
    expect(CsvMozillaPlatformRowParser.canParse(fields)).toEqual(3);
  });

  it("parses legacy resource from csv row with minimum required properties", () => {
    const data = {
      "url": "https://url1.com"
    };
    const externalResourceEntity = CsvMozillaPlatformRowParser.parse(data);
    expect(externalResourceEntity).toBeInstanceOf(ExternalResourceEntity);
    expect(externalResourceEntity.uri).toEqual(data.url);
    expect(externalResourceEntity.secretClear).toEqual("");
    expect(externalResourceEntity.username).toBeUndefined();
  });

  it("parses legacy resource from csv row with all available properties", () => {
    const data = {
      "name": "https://url1.com",
      "username": "Username 1",
      "url": "https://url1.com",
      "password": "Secret 1",
    };
    const resourceTypeCollection = getResourceTypeCollection();
    jest.spyOn(resourceTypeCollection, "getFirst");
    const externalResourceEntity = CsvMozillaPlatformRowParser.parse(data, resourceTypeCollection);
    expect(externalResourceEntity).toBeInstanceOf(ExternalResourceEntity);
    expect(externalResourceEntity.name).toEqual(data.name);
    expect(externalResourceEntity.username).toEqual(data.username);
    expect(externalResourceEntity.uri).toEqual(data.url);
    expect(externalResourceEntity.secretClear).toEqual(data.password);
    expect(resourceTypeCollection.getFirst).toHaveBeenCalled();
  });
});
