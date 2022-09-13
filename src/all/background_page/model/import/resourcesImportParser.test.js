/**
 * @jest-environment ./test/jest.custom-kdbx-environment
 */
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
import fs from "fs";
import ResourcesImportParser from "./resourcesImportParser";
import ImportResourcesFileEntity from "../entity/import/importResourcesFileEntity";
import ResourcesCsvImportParser from "./resources/resourcesCsvImportParser";


describe("ResourcesImportParser", () => {
  it("should be able to parse CSV file", async() => {
    const file = "VGl0bGUsVXNlcm5hbWUsVVJMLFBhc3N3b3JkLE5vdGVzLEdyb3VwClBhc3N3b3JkIDEsdXNlcm5hbWUxLGh0dHBzOi8vdXJsMS5jb20sU2VjcmV0IDEsRGVzY3JpcHRpb24gMSxGb2xkZXIgMS9Gb2xkZXIgMgpQYXNzd29yZCAyLHVzZXJuYW1lMixodHRwczovL3VybDIuY29tLFNlY3JldCAyLERlc2NyaXB0aW9uIDIsRm9sZGVyIDEKUGFzc3dvcmQgMyx1c2VybmFtZTMsaHR0cHM6Ly91cmwzLmNvbSxTZWNyZXQgMyxEZXNjcmlwdGlvbiAzLEZvbGRlciAzL0ZvbGRlciA0ClBhc3N3b3JkIDQsdXNlcm5hbWU0LGh0dHBzOi8vdXJsNC5jb20sU2VjcmV0IDQsRGVzY3JpcHRpb24gNCxGb2xkZXIgMi9Gb2xkZXIgMQ==";
    const importDto = {
      "ref": "import-ref",
      "file_type": "csv",
      "file": file
    };
    const importEntity = new ImportResourcesFileEntity(importDto);
    const parser = new ResourcesImportParser();
    // Cannot perform the external in the custom kdbx jest environment, atob is not available.
    const selectedParser = parser.getParser(importEntity);
    expect(selectedParser).toEqual(ResourcesCsvImportParser);
  });

  it("should be able to parse KDBX file", async() => {
    const file = fs.readFileSync("./src/all/background_page/model/import/resources/kdbx/kdbx-not-protected.kdbx", {encoding: 'base64'});
    const importDto = {
      "ref": "import-ref",
      "file_type": "kdbx",
      "file": file
    };
    const importEntity = new ImportResourcesFileEntity(importDto);
    const parser = new ResourcesImportParser();
    await parser.parseImport(importEntity);
  });
});
