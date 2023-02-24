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
import CsvDashlaneRowParser from "./csvDashlaneRowParser";
import ExternalResourceEntity from "../../../entity/resource/external/externalResourceEntity";

describe("CsvDashlaneRowParser", () => {
  it("can parse LastPass csv", () => {
    // minimum required fields
    let fields = ["title", "password"];
    expect(CsvDashlaneRowParser.canParse(fields)).toEqual(2);
    // all fields
    fields = ["title", "username", "url", "password", "note"];
    expect(CsvDashlaneRowParser.canParse(fields)).toEqual(5);
    // Missing one required field
    fields = ["title", "username", "url", "note"];
    expect(CsvDashlaneRowParser.canParse(fields)).toEqual(0);
    // Duplicate field
    fields = ["title", "username", "url", "password", "note", "note"];
    expect(CsvDashlaneRowParser.canParse(fields)).toEqual(5);
    // additional fields not supported
    fields = ["title", "password", "Unsupported field"];
    expect(CsvDashlaneRowParser.canParse(fields)).toEqual(2);
  });

  it("parses legacy resource from csv row with minimum required properties", () => {
    const data = {
      "title": "Password 1"
    };
    const externalResourceEntity = CsvDashlaneRowParser.parse(data);
    expect(externalResourceEntity).toBeInstanceOf(ExternalResourceEntity);
    expect(externalResourceEntity.name).toEqual(data.title);
    expect(externalResourceEntity.username).toBeUndefined();
    expect(externalResourceEntity.uri).toBeUndefined();
    expect(externalResourceEntity.secretClear).toEqual("");
    expect(externalResourceEntity.description).toBeUndefined();
  });

  it("parses legacy resource from csv row with all available properties", () => {
    const data = {
      "title": "Password 1",
      "username": "Username 1",
      "url": "https://url1.com",
      "password": "Secret 1",
      "note": "Description 1",
    };
    const resourceTypeCollection = getResourceTypeCollection();
    jest.spyOn(resourceTypeCollection, "getFirst");
    const externalResourceEntity = CsvDashlaneRowParser.parse(data, resourceTypeCollection);
    expect(externalResourceEntity).toBeInstanceOf(ExternalResourceEntity);
    expect(externalResourceEntity.name).toEqual(data.title);
    expect(externalResourceEntity.username).toEqual(data.username);
    expect(externalResourceEntity.uri).toEqual(data.url);
    expect(externalResourceEntity.secretClear).toEqual(data.password);
    expect(externalResourceEntity.description).toEqual(data.note);
    expect(resourceTypeCollection.getFirst).toHaveBeenCalled();
  });
});
