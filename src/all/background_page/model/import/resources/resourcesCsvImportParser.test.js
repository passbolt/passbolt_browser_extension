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

import FileFormatError from "../../../error/fileFormatError";
import ResourcesCsvImportParser from "./resourcesCsvImportParser";

import Csv1PasswordRowParser from "./csvRowParser/csv1PasswordRowParser";
import CsvKdbxRowParser from "./csvRowParser/csvKdbxRowParser";
import CsvLastPassRowParser from "./csvRowParser/csvLastPassRowParser";

import ExternalResourceEntity from "../../entity/resource/external/externalResourceEntity";
import ImportResourcesFileEntity from "../../entity/import/importResourcesFileEntity";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import ImportError from "../../../error/importError";
import BinaryConvert from "../../../utils/format/binaryConvert";
import CsvChromiumRowParser from "./csvRowParser/csvChromiumRowParser";
import CsvBitWardenRowParser from "./csvRowParser/csvBitWardenRowParser";
import CsvSafariRowParser from "./csvRowParser/csvSafariRowParser";
import CsvDashlaneRowParser from "./csvRowParser/csvDashlaneRowParser";
import CsvMozillaPlatformRowParser from "./csvRowParser/csvMozillaPlatformRowParser";
import CsvNordpassRowParser from "./csvRowParser/csvNordpassRowParser";
import CsvLogMeOnceRowParser from "./csvRowParser/csvLogMeOnceRowParser";

describe("ResourcesCsvImportParser", () => {
  it("should be aware of the supported row parsers", () => {
    expect(ResourcesCsvImportParser.register).toHaveLength(10);
    const supportedRowParsers = [
      Csv1PasswordRowParser,
      CsvKdbxRowParser,
      CsvLastPassRowParser,
      CsvChromiumRowParser,
      CsvBitWardenRowParser,
      CsvSafariRowParser,
      CsvDashlaneRowParser,
      CsvMozillaPlatformRowParser,
      CsvNordpassRowParser,
      CsvLogMeOnceRowParser
    ];
    expect(ResourcesCsvImportParser.register).toEqual(expect.arrayContaining(supportedRowParsers));
  });

  it("should read import file encoded in base64", () => {
    const csv = "Title,Username,URL,Password,Notes,Group\n" +
      "Password 1,Username 1,https://url1.com,Password 1,Description 1,\n";
    const importDto = {
      "ref": "import-ref",
      "file_type": "csv",
      "file": btoa(BinaryConvert.toBinary(csv))
    };
    const importEntity = new ImportResourcesFileEntity(importDto);
    const importer = new ResourcesCsvImportParser(importEntity);
    const {data, fields} = importer.readCsv();
    const csvRow = {
      Title: 'Password 1',
      Username: 'Username 1',
      URL: 'https://url1.com',
      Password: 'Password 1',
      Notes: 'Description 1',
      Group: ''
    };
    expect(data).toEqual(expect.arrayContaining([csvRow]));
    const csvFields = ['Title', 'Username', 'URL', 'Password', 'Notes', 'Group'];
    expect(fields).toEqual(expect.arrayContaining(csvFields));
  });

  it("should determine row parser to use", () => {
    const csv = "Title,Username,URL,Password,Notes,Group\n" +
      "Password 1,Username 1,https://url1.com,Password 1,Description 1,\n";
    const importDto = {
      "ref": "import-ref",
      "file_type": "csv",
      "file": btoa(BinaryConvert.toBinary(csv))
    };
    const importEntity = new ImportResourcesFileEntity(importDto);
    const importer = new ResourcesCsvImportParser(importEntity);
    const {fields} = importer.readCsv();
    const RowParser = importer.getRowParser(fields);
    expect(RowParser).toEqual(CsvKdbxRowParser);
  });

  it("should throw an error if no row parser is identified", async() => {
    const file = fs.readFileSync("./src/all/background_page/model/import/resources/kdbx/kdbx-not-protected.kdbx", {encoding: 'base64'});
    const importDto = {
      "ref": "import-ref",
      "file_type": "csv",
      "file": file
    };
    const importEntity = new ImportResourcesFileEntity(importDto);
    const importer = new ResourcesCsvImportParser(importEntity);
    try {
      await importer.parseImport();
      expect(true).toBeFalsy();
    } catch (error) {
      expect(error).toBeInstanceOf(FileFormatError);
    }

    expect(importEntity.importResources.items).toHaveLength(0);
  });

  function buildExternalResourceDto(num, data) {
    return Object.assign({
      name: `Password ${num}`,
      username: `username${num}`,
      uri: `https://url${num}.com`,
      description: `Description ${num}`,
      secret_clear: `Secret ${num}`,
      folder_parent_path: ``
    }, data);
  }

  function buildExternalFolderDto(num, data) {
    return Object.assign({
      name: `Folder ${num}`,
      folder_parent_path: ``
    }, data);
  }

  it("should parse resources", async() => {
    const csv = "Title,Username,URL,Password,Notes,Group\n" +
      "Password 1,username1,https://url1.com,Secret 1,Description 1,\n" +
      "Password 2,username2,https://url2.com,Secret 2,Description 2,\n";
    const importDto = {
      "ref": "import-ref",
      "file_type": "csv",
      "file": btoa(BinaryConvert.toBinary(csv))
    };
    const importEntity = new ImportResourcesFileEntity(importDto);
    const importer = new ResourcesCsvImportParser(importEntity);
    await importer.parseImport();

    expect(importEntity.importResources.items).toHaveLength(2);
    const resource1Dto = buildExternalResourceDto(1, {folder_parent_path: "import-ref"});
    expect(importEntity.importResources.toJSON()).toEqual(expect.arrayContaining([resource1Dto]));
    const resource2Dto = buildExternalResourceDto(1, {folder_parent_path: "import-ref"});
    expect(importEntity.importResources.toJSON()).toEqual(expect.arrayContaining([resource2Dto]));
  });

  it("should parse resources and folders", async() => {
    const csv = "Title,Username,URL,Password,Notes,Group\n" +
      // The algorithm should create the missing folders in the path if they have not been created yet, Folder 1 here
      "Password 1,username1,https://url1.com,Secret 1,Description 1,Folder 1/Folder 2\n" +
      // The algorithm should not create duplicate for folder already created, Folder 1 has been created with the previous entry
      "Password 2,username2,https://url2.com,Secret 2,Description 2,Folder 1\n" +
      // The algorithm should create folders even though there is no resource in it, Folder 4 here
      "Password 3,username3,https://url3.com,Secret 3,Description 3,Folder 3/Folder 4\n" +
      // The algorithm should not be based on folder name but path, and the folders Folder 1 and Folder 2 are different than the previous ones.
      "Password 4,username4,https://url4.com,Secret 4,Description 4,Folder 2/Folder 1";
    const importDto = {
      "ref": "import-ref",
      "file_type": "csv",
      "file": btoa(BinaryConvert.toBinary(csv))
    };
    const importEntity = new ImportResourcesFileEntity(importDto);
    const importer = new ResourcesCsvImportParser(importEntity);
    await importer.parseImport();

    // Assert resources
    expect(importEntity.importResources.items).toHaveLength(4);
    const resource1Dto = buildExternalResourceDto(1, {folder_parent_path: "import-ref/Folder 1/Folder 2"});
    expect(importEntity.importResources.toJSON()).toEqual(expect.arrayContaining([resource1Dto]));
    const resource2Dto = buildExternalResourceDto(2, {folder_parent_path: "import-ref/Folder 1"});
    expect(importEntity.importResources.toJSON()).toEqual(expect.arrayContaining([resource2Dto]));
    const resource3Dto = buildExternalResourceDto(3, {folder_parent_path: "import-ref/Folder 3/Folder 4"});
    expect(importEntity.importResources.toJSON()).toEqual(expect.arrayContaining([resource3Dto]));
    const resource4Dto = buildExternalResourceDto(4, {folder_parent_path: "import-ref/Folder 2/Folder 1"});
    expect(importEntity.importResources.toJSON()).toEqual(expect.arrayContaining([resource4Dto]));

    // Assert folders
    expect(importEntity.importFolders.items).toHaveLength(7);
    const folderRefDto = {name: "import-ref", folder_parent_path: ""};
    expect(importEntity.importFolders.toJSON()).toEqual(expect.arrayContaining([folderRefDto]));
    const folder1RootDto = buildExternalFolderDto(1, {folder_parent_path: "import-ref"});
    expect(importEntity.importFolders.toJSON()).toEqual(expect.arrayContaining([folder1RootDto]));
    const folder2Dto = buildExternalFolderDto(2, {folder_parent_path: "import-ref/Folder 1"});
    expect(importEntity.importFolders.toJSON()).toEqual(expect.arrayContaining([folder2Dto]));
    const folder3Dto = buildExternalFolderDto(3, {folder_parent_path: "import-ref"});
    expect(importEntity.importFolders.toJSON()).toEqual(expect.arrayContaining([folder3Dto]));
    const folder4Dto = buildExternalFolderDto(4, {folder_parent_path: "import-ref/Folder 3"});
    expect(importEntity.importFolders.toJSON()).toEqual(expect.arrayContaining([folder4Dto]));
    const folder2RootDto = buildExternalFolderDto(2, {folder_parent_path: "import-ref"});
    expect(importEntity.importFolders.toJSON()).toEqual(expect.arrayContaining([folder2RootDto]));
    const folder1Dto = buildExternalFolderDto(1, {folder_parent_path: "import-ref/Folder 2"});
    expect(importEntity.importFolders.toJSON()).toEqual(expect.arrayContaining([folder1Dto]));
  });

  it("should be able to parse an empty row", async() => {
    const csv = "Title,Username,URL,Password,Notes,Group\n" +
      ",,,,,\n";
    const importDto = {
      "ref": "import-ref",
      "file_type": "csv",
      "file": btoa(BinaryConvert.toBinary(csv))
    };
    const importEntity = new ImportResourcesFileEntity(importDto);
    const importer = new ResourcesCsvImportParser(importEntity);
    await importer.parseImport();

    expect(importEntity.importResources.items).toHaveLength(1);
    const expectedResourceDto = {
      name: ExternalResourceEntity.DEFAULT_RESOURCE_NAME,
      secret_clear: "",
      folder_parent_path: "import-ref"
    };
    expect(importEntity.importResources.toJSON()).toEqual(expect.arrayContaining([expectedResourceDto]));
  });

  it("should catch and keep a reference of import resource entity validation error", async() => {
    const name = "too-long-resource-name-too-long-resource-name-too-long-resource-name-too-long-resource-name-too-long-resource-name-too-long-resource-name-too-long-resource-name-too-long-resource-name-too-long-resource-name-too-long-resource-name-too-long-resource-name-too-long-resource-name-too-long-resource-name-too-long-resource-name";
    const csv = "Title,Username,URL,Password,Notes,Group\n" +
      `${name},,,,,\n`;
    const importDto = {
      "ref": "import-ref",
      "file_type": "csv",
      "file": btoa(BinaryConvert.toBinary(csv))
    };
    const importEntity = new ImportResourcesFileEntity(importDto);
    const importer = new ResourcesCsvImportParser(importEntity);
    await importer.parseImport();

    expect(importEntity.importResources.items).toHaveLength(0);
    expect(importEntity.importResourcesErrors).toHaveLength(1);
    const error = importEntity.importResourcesErrors[0];
    expect(error).toBeInstanceOf(ImportError);
    expect(error.sourceError).toBeInstanceOf(EntityValidationError);
    expect(error.sourceError.details).toHaveProperty("name");
    const resourceName = "too-long-resource-name-too-long-resource-name-too-long-resource-name-too-long-resource-name-too-long-resource-name-too-long-resource-name-too-long-resource-name-too-long-resource-name-too-long-resource-name-too-long-resource-name-too-long-resource-name-too-long-resource-name-too-long-resource-name-too-long-resource-name";
    expect(error.data.Title).toEqual(resourceName);
  });

  it("should catch and keep a reference of import folder entity validation error", async() => {
    const path = "too-long-folder-name-too-long-folder-name-too-long-folder-name-too-long-folder-nametoo-long-folder-name-too-long-folder-name-too-long-folder-name-too-long-folder-nametoo-long-folder-name-too-long-folder-name-too-long-folder-name-too-long-folder-nametoo-long-folder-name-too-long-folder-name-too-long-folder-name-too-long-folder-name";
    const csv = "Title,Username,URL,Password,Notes,Group\n" +
      `,,,,,${path}\n`;
    const importDto = {
      "ref": "import-ref",
      "file_type": "csv",
      "file": btoa(BinaryConvert.toBinary(csv))
    };
    const importEntity = new ImportResourcesFileEntity(importDto);
    const importer = new ResourcesCsvImportParser(importEntity);
    await importer.parseImport();

    expect(importEntity.importResources.items).toHaveLength(1);
    // The resource should be moved at the root if the associated folder cannot be imported.
    expect(importEntity.importResources.items[0].folderParentPath).toEqual(importDto.ref);

    expect(importEntity.importFolders.items).toHaveLength(1); // The folder relative to the import reference
    expect(importEntity.importFoldersErrors).toHaveLength(1);
    const error = importEntity.importFoldersErrors[0];
    expect(error).toBeInstanceOf(ImportError);
    expect(error.sourceError).toBeInstanceOf(EntityValidationError);
    expect(error.sourceError.details).toHaveProperty("name");
    expect(error.data.path).toEqual(path);
  });
});
