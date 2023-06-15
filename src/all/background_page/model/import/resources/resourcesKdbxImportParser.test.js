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
import * as kdbxweb from "kdbxweb";
import ResourcesKdbxImportParser from "./resourcesKdbxImportParser";
import ImportResourcesFileEntity from "../../entity/import/importResourcesFileEntity";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import ImportError from "../../../error/importError";

describe("ResourcesKdbxImportParser", () => {
  it("should read import file", async() => {
    const file = fs.readFileSync("./src/all/background_page/model/import/resources/kdbx/kdbx-not-protected.kdbx", {encoding: 'base64'});
    const importDto = {
      "ref": "import-ref",
      "file_type": "kdbx",
      "file": file
    };
    const importEntity = new ImportResourcesFileEntity(importDto);
    const parser = new ResourcesKdbxImportParser(importEntity);
    const kdbx = await parser.readKdbxDb();
    expect(kdbx).toBeInstanceOf(kdbxweb.Kdbx);
  });

  it("should read import file protected by password", async() => {
    const file = fs.readFileSync("./src/all/background_page/model/import/resources/kdbx/kdbx-protected-password.kdbx", {encoding: 'base64'});
    const importDto = {
      "ref": "import-ref",
      "file_type": "kdbx",
      "file": file,
      "options": {
        "credentials": {
          "password": "passbolt"
        }
      }
    };
    const importEntity = new ImportResourcesFileEntity(importDto);
    const parser = new ResourcesKdbxImportParser(importEntity);
    const kdbx = await parser.readKdbxDb();
    expect(kdbx).toBeInstanceOf(kdbxweb.Kdbx);
  });

  it("should not be able to read import file protected by password if wrong password", async() => {
    const file = fs.readFileSync("./src/all/background_page/model/import/resources/kdbx/kdbx-protected-password.kdbx", {encoding: 'base64'});
    const importDto = {
      "ref": "import-ref",
      "file_type": "kdbx",
      "file": file
    };
    const importEntity = new ImportResourcesFileEntity(importDto);
    const parser = new ResourcesKdbxImportParser(importEntity);
    try {
      await parser.readKdbxDb();
      expect(true).toBeFalsy();
    } catch (error) {
      expect(error).toBeInstanceOf(kdbxweb.KdbxError);
    }
  });

  it("should read import file protected by keyfile", async() => {
    const file = fs.readFileSync("./src/all/background_page/model/import/resources/kdbx/kdbx-protected-keyfile.kdbx", {encoding: 'base64'});
    const keyfile = fs.readFileSync("./src/all/background_page/model/import/resources/kdbx/kdbx-keyfile.key", {encoding: 'base64'});
    const importDto = {
      "ref": "import-ref",
      "file_type": "kdbx",
      "file": file,
      "options": {
        "credentials": {
          "keyfile": keyfile
        }
      }
    };
    const importEntity = new ImportResourcesFileEntity(importDto);
    const parser = new ResourcesKdbxImportParser(importEntity);
    const kdbx = await parser.readKdbxDb();
    expect(kdbx).toBeInstanceOf(kdbxweb.Kdbx);
  });

  it("should not be able to read import file protected by keyfile if wrong keyfile", async() => {
    const file = fs.readFileSync("./src/all/background_page/model/import/resources/kdbx/kdbx-protected-keyfile.kdbx", {encoding: 'base64'});
    const importDto = {
      "ref": "import-ref",
      "file_type": "kdbx",
      "file": file
    };
    const importEntity = new ImportResourcesFileEntity(importDto);
    const parser = new ResourcesKdbxImportParser(importEntity);
    try {
      await parser.readKdbxDb();
      expect(true).toBeFalsy();
    } catch (error) {
      expect(error).toBeInstanceOf(kdbxweb.KdbxError);
    }
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

  it("should parse resources and folders", async() => {
    const file = fs.readFileSync("./src/all/background_page/model/import/resources/kdbx/kdbx-not-protected.kdbx", {encoding: 'base64'});
    const importDto = {
      "ref": "import-ref",
      "file_type": "kdbx",
      "file": file
    };
    const importEntity = new ImportResourcesFileEntity(importDto);
    const parser = new ResourcesKdbxImportParser(importEntity);
    await parser.parseImport();

    // Assert resources
    expect(importEntity.importResources.items).toHaveLength(4);
    const resource1Dto = buildExternalResourceDto(1, {folder_parent_path: "import-ref/Root/Folder 1/Folder 2"});
    expect(importEntity.importResources.toJSON()).toEqual(expect.arrayContaining([resource1Dto]));
    const resource2Dto = buildExternalResourceDto(2, {folder_parent_path: "import-ref/Root/Folder 1"});
    expect(importEntity.importResources.toJSON()).toEqual(expect.arrayContaining([resource2Dto]));
    const resource3Dto = buildExternalResourceDto(3, {folder_parent_path: "import-ref/Root/Folder 3/Folder 4"});
    expect(importEntity.importResources.toJSON()).toEqual(expect.arrayContaining([resource3Dto]));
    const resource4Dto = buildExternalResourceDto(4, {folder_parent_path: "import-ref/Root/Folder 2/Folder 1"});
    expect(importEntity.importResources.toJSON()).toEqual(expect.arrayContaining([resource4Dto]));

    // Assert folders
    expect(importEntity.importFolders.items).toHaveLength(9);
    const folderRefDto = {name: "import-ref", folder_parent_path: ""};
    expect(importEntity.importFolders.toJSON()).toEqual(expect.arrayContaining([folderRefDto]));
    const folderKdbxRootDto = {name: "Root", folder_parent_path: "import-ref"};
    expect(importEntity.importFolders.toJSON()).toEqual(expect.arrayContaining([folderKdbxRootDto]));
    const folder1RootDto = buildExternalFolderDto(1, {folder_parent_path: "import-ref/Root"});
    expect(importEntity.importFolders.toJSON()).toEqual(expect.arrayContaining([folder1RootDto]));
    const folder2Dto = buildExternalFolderDto(2, {folder_parent_path: "import-ref/Root/Folder 1"});
    expect(importEntity.importFolders.toJSON()).toEqual(expect.arrayContaining([folder2Dto]));
    const folder3Dto = buildExternalFolderDto(3, {folder_parent_path: "import-ref/Root"});
    expect(importEntity.importFolders.toJSON()).toEqual(expect.arrayContaining([folder3Dto]));
    const folder4Dto = buildExternalFolderDto(4, {folder_parent_path: "import-ref/Root/Folder 3"});
    expect(importEntity.importFolders.toJSON()).toEqual(expect.arrayContaining([folder4Dto]));
    const folder2RootDto = buildExternalFolderDto(2, {folder_parent_path: "import-ref/Root"});
    expect(importEntity.importFolders.toJSON()).toEqual(expect.arrayContaining([folder2RootDto]));
    const folder1Dto = buildExternalFolderDto(1, {folder_parent_path: "import-ref/Root/Folder 2"});
    expect(importEntity.importFolders.toJSON()).toEqual(expect.arrayContaining([folder1Dto]));
    const folder5Dto = buildExternalFolderDto(5, {folder_parent_path: "import-ref/Root"});
    expect(importEntity.importFolders.toJSON()).toEqual(expect.arrayContaining([folder5Dto]));
  });

  it("should catch and keep a reference of import resource entity validation error", async() => {
    const file = fs.readFileSync("./src/all/background_page/model/import/resources/kdbx/kdbx-content-error-not-protected.kdbx", {encoding: 'base64'});
    const importDto = {
      "ref": "import-ref",
      "file_type": "kdbx",
      "file": file
    };
    const importEntity = new ImportResourcesFileEntity(importDto);
    const parser = new ResourcesKdbxImportParser(importEntity);
    await parser.parseImport();

    // Assert resources
    expect(importEntity.importResources.items).toHaveLength(2);
    const resource1Dto = buildExternalResourceDto(1, {folder_parent_path: "import-ref/Root/Folder 1"});
    expect(importEntity.importResources.toJSON()).toEqual(expect.arrayContaining([resource1Dto]));

    // Assert folders
    expect(importEntity.importFolders.items).toHaveLength(4);
    const folderRefDto = {name: "import-ref", folder_parent_path: ""};
    expect(importEntity.importFolders.toJSON()).toEqual(expect.arrayContaining([folderRefDto]));
    const folderKdbxRootDto = {name: "Root", folder_parent_path: "import-ref"};
    expect(importEntity.importFolders.toJSON()).toEqual(expect.arrayContaining([folderKdbxRootDto]));
    const folder1RootDto = buildExternalFolderDto(1, {folder_parent_path: "import-ref/Root"});
    expect(importEntity.importFolders.toJSON()).toEqual(expect.arrayContaining([folder1RootDto]));

    // Assert folders errors
    expect(importEntity.importFoldersErrors).toHaveLength(1);
    // Folder name exceeding max length
    let error = importEntity.importFoldersErrors[0];
    expect(error).toBeInstanceOf(ImportError);
    expect(error.sourceError).toBeInstanceOf(EntityValidationError);
    expect(error.sourceError.details).toHaveProperty("name");
    expect(error.data.name).toEqual("too-long-folder-name-too-long-folder-name-too-long-folder-name-too-long-folder-nametoo-long-folder-name-too-long-folder-name-too-long-folder-name-too-long-folder-nametoo-long-folder-name-too-long-folder-name-too-long-folder-name-too-long-folder-nametoo-long-folder-name-too-long-folder-name-too-long-folder-name-too-long-folder-name");

    // Assert resources errors
    expect(importEntity.importResourcesErrors).toHaveLength(1);
    error = importEntity.importResourcesErrors[0];
    expect(error).toBeInstanceOf(ImportError);
    expect(error.sourceError).toBeInstanceOf(EntityValidationError);
    expect(error.sourceError.details).toHaveProperty("name");
    const resourceName = "too-long-resource-name-too-long-resource-name-too-long-resource-name-too-long-resource-name-too-long-resource-name-too-long-resource-name-too-long-resource-name-too-long-resource-name-too-long-resource-name-too-long-resource-name-too-long-resource-name-too-long-resource-name-too-long-resource-name-too-long-resource-name";
    expect(error.data.name).toEqual(resourceName);
  });
});
