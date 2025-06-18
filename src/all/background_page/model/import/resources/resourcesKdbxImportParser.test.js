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
import ResourceTypesCollection from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection";
import {resourceTypesCollectionDto} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection.test.data";
import {
  TEST_RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION,
  TEST_RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP,
} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypeEntity.test.data";
import {defaultTotpDto} from "../../entity/totp/totpDto.test.data";
import MetadataTypesSettingsEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTypesSettingsEntity";
import {defaultMetadataTypesSettingsV4Dto, defaultMetadataTypesSettingsV6Dto} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTypesSettingsEntity.test.data";
import IconEntity, {ICON_TYPE_KEEPASS_ICON_SET} from "passbolt-styleguide/src/shared/models/entity/resource/metadata/IconEntity";

describe("ResourcesKdbxImportParser", () => {
  let resourceTypesCollection, metadataTypesSettings;

  beforeEach(() => {
    resourceTypesCollection = new ResourceTypesCollection(resourceTypesCollectionDto());
    metadataTypesSettings = new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV4Dto());
  });

  it("should read import file", async() => {
    expect.assertions(1);
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
    expect.assertions(1);
    const file = fs.readFileSync("./src/all/background_page/model/import/resources/kdbx/kdbx-with-all-resource-types.kdbx", {encoding: 'base64'});
    const importDto = {
      "ref": "import-ref",
      "file_type": "kdbx",
      "file": file,
      "options": {
        "credentials": {
          "password": "test"
        }
      }
    };
    const importEntity = new ImportResourcesFileEntity(importDto);
    const parser = new ResourcesKdbxImportParser(importEntity, resourceTypesCollection, metadataTypesSettings);
    const kdbx = await parser.readKdbxDb();
    expect(kdbx).toBeInstanceOf(kdbxweb.Kdbx);
  });

  it("should not be able to read import file protected by password if wrong password", async() => {
    expect.assertions(1);
    const file = fs.readFileSync("./src/all/background_page/model/import/resources/kdbx/kdbx-protected-password.kdbx", {encoding: 'base64'});
    const importDto = {
      "ref": "import-ref",
      "file_type": "kdbx",
      "file": file
    };
    const importEntity = new ImportResourcesFileEntity(importDto);
    const parser = new ResourcesKdbxImportParser(importEntity, resourceTypesCollection, metadataTypesSettings);
    try {
      await parser.readKdbxDb();
    } catch (error) {
      expect(error).toBeInstanceOf(kdbxweb.KdbxError);
    }
  });

  it("should read import file protected by keyfile", async() => {
    expect.assertions(1);
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
    const parser = new ResourcesKdbxImportParser(importEntity, resourceTypesCollection, metadataTypesSettings);
    const kdbx = await parser.readKdbxDb();
    expect(kdbx).toBeInstanceOf(kdbxweb.Kdbx);
  });

  it("should not be able to read import file protected by keyfile if wrong keyfile", async() => {
    expect.assertions(1);
    const file = fs.readFileSync("./src/all/background_page/model/import/resources/kdbx/kdbx-protected-keyfile.kdbx", {encoding: 'base64'});
    const importDto = {
      "ref": "import-ref",
      "file_type": "kdbx",
      "file": file
    };
    const importEntity = new ImportResourcesFileEntity(importDto);
    const parser = new ResourcesKdbxImportParser(importEntity, resourceTypesCollection, metadataTypesSettings);
    try {
      await parser.readKdbxDb();
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
      folder_parent_path: ``,
      expired: null,
    }, data);
  }

  function buildExternalFolderDto(num, data) {
    return Object.assign({
      name: `Folder ${num}`,
      folder_parent_path: ``
    }, data);
  }

  it("should parse resources and folders", async() => {
    expect.assertions(12);
    const file = fs.readFileSync("./src/all/background_page/model/import/resources/kdbx/kdbx-not-protected.kdbx", {encoding: 'base64'});
    const importDto = {
      "ref": "import-ref",
      "file_type": "kdbx",
      "file": file
    };
    const importEntity = new ImportResourcesFileEntity(importDto);
    const parser = new ResourcesKdbxImportParser(importEntity, resourceTypesCollection, metadataTypesSettings);
    await parser.parseImport();
    const expectedResourceType = resourceTypesCollection.items.find(resourceType =>  resourceType.slug === "password-and-description");

    // Assert resources
    expect(importEntity.importResources.items).toHaveLength(4);
    const resource1Dto = buildExternalResourceDto(1, {folder_parent_path: "import-ref/Root/Folder 1/Folder 2", resource_type_id: expectedResourceType.id});
    const resource2Dto = buildExternalResourceDto(2, {folder_parent_path: "import-ref/Root/Folder 1", resource_type_id: expectedResourceType.id});
    const resource3Dto = buildExternalResourceDto(3, {folder_parent_path: "import-ref/Root/Folder 3/Folder 4", resource_type_id: expectedResourceType.id});
    const resource4Dto = buildExternalResourceDto(4, {folder_parent_path: "import-ref/Root/Folder 2/Folder 1", resource_type_id: expectedResourceType.id});
    expect(importEntity.importResources.toJSON()).toEqual([resource1Dto, resource2Dto, resource4Dto, resource3Dto]);

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

  it("should parse resources with TOTP and folders", async() => {
    expect.assertions(6);
    const resourceTypesCollection = new ResourceTypesCollection(resourceTypesCollectionDto());
    const file = fs.readFileSync("./src/all/background_page/model/import/resources/kdbx/kdbx-with-totp-protected-password.kdbx", {encoding: 'base64'});
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
    const parser = new ResourcesKdbxImportParser(importEntity, resourceTypesCollection, metadataTypesSettings);
    await parser.parseImport();

    // Assert resources
    const totp = defaultTotpDto({secret_key: "TJSNMLGTCYOEMXZG"});
    expect(importEntity.importResources.items).toHaveLength(2);
    const resource1Dto = buildExternalResourceDto(1, {totp: totp, folder_parent_path: "import-ref/Root", resource_type_id: TEST_RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP, expired: "2023-11-10T08:09:04.000Z"});
    expect(importEntity.importResources.toJSON()).toEqual(expect.arrayContaining([resource1Dto]));
    const resource2Dto = buildExternalResourceDto(2, {totp: totp, folder_parent_path: "import-ref/Root", resource_type_id: TEST_RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP});
    expect(importEntity.importResources.toJSON()).toEqual(expect.arrayContaining([resource2Dto]));

    // Assert folders
    expect(importEntity.importFolders.items).toHaveLength(2);
    const folderRefDto = {name: "import-ref", folder_parent_path: ""};
    expect(importEntity.importFolders.toJSON()).toEqual(expect.arrayContaining([folderRefDto]));
    const folderKdbxRootDto = {name: "Root", folder_parent_path: "import-ref"};
    expect(importEntity.importFolders.toJSON()).toEqual(expect.arrayContaining([folderKdbxRootDto]));
  });

  it("should parse resources with TOTP and folders from kdbx windows", async() => {
    expect.assertions(7);
    const resourceTypesCollection = new ResourceTypesCollection(resourceTypesCollectionDto());
    const file = fs.readFileSync("./src/all/background_page/model/import/resources/kdbx/kdbx-windows-with-totp-protected-password.kdbx", {encoding: 'base64'});
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
    const parser = new ResourcesKdbxImportParser(importEntity, resourceTypesCollection, metadataTypesSettings);
    await parser.parseImport();

    // Assert resources
    const totp = defaultTotpDto({secret_key: "THISISANOTHERSECRET"});
    const totp2 = defaultTotpDto({secret_key: "THISISTOTPSECRT", algorithm: "SHA256", digits: 8, period: 60});
    expect(importEntity.importResources.items).toHaveLength(3);
    const resource1Dto = buildExternalResourceDto(1, {folder_parent_path: "import-ref/Database", resource_type_id: TEST_RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION});
    expect(importEntity.importResources.toJSON()).toEqual(expect.arrayContaining([resource1Dto]));
    const resource2Dto = buildExternalResourceDto(2, {totp: totp, folder_parent_path: "import-ref/Database", resource_type_id: TEST_RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP});
    expect(importEntity.importResources.toJSON()).toEqual(expect.arrayContaining([resource2Dto]));
    const resource3Dto = buildExternalResourceDto(3, {totp: totp2, folder_parent_path: "import-ref/Database", resource_type_id: TEST_RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP});
    expect(importEntity.importResources.toJSON()).toEqual(expect.arrayContaining([resource3Dto]));

    // Assert folders
    expect(importEntity.importFolders.items).toHaveLength(2);
    const folderRefDto = {name: "import-ref", folder_parent_path: ""};
    expect(importEntity.importFolders.toJSON()).toEqual(expect.arrayContaining([folderRefDto]));
    const folderKdbxRootDto = {name: "Database", folder_parent_path: "import-ref"};
    expect(importEntity.importFolders.toJSON()).toEqual(expect.arrayContaining([folderKdbxRootDto]));
  });

  it("should catch and keep a reference of import resource entity validation error", async() => {
    expect.assertions(16);
    const file = fs.readFileSync("./src/all/background_page/model/import/resources/kdbx/kdbx-content-error-not-protected.kdbx", {encoding: 'base64'});
    const importDto = {
      "ref": "import-ref",
      "file_type": "kdbx",
      "file": file
    };
    const importEntity = new ImportResourcesFileEntity(importDto);
    const parser = new ResourcesKdbxImportParser(importEntity, resourceTypesCollection, metadataTypesSettings);
    await parser.parseImport();
    const expectedResourceType = resourceTypesCollection.items.find(resourceType =>  resourceType.slug === "password-and-description");

    // Assert resources
    expect(importEntity.importResources.items).toHaveLength(2);
    const resource1Dto = buildExternalResourceDto(1, {folder_parent_path: "import-ref/Root/Folder 1", resource_type_id: expectedResourceType.id});
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

  it("should import the expiration date", async() => {
    expect.assertions(2);
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
    const parser = new ResourcesKdbxImportParser(importEntity, resourceTypesCollection, metadataTypesSettings);
    await parser.parseImport();

    // Assert resources
    expect(importEntity.importResources.items).toHaveLength(2);
    expect(importEntity.importResources.items[1].expired).toStrictEqual("2020-11-16T23:00:42.000Z");
  });

  it("should import the icon and background color data if any", async() => {
    expect.assertions(6);

    const metadataTypesSettings = new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV6Dto());

    const file = fs.readFileSync("./src/all/background_page/model/import/resources/kdbx/kdbx-protected-with-color-and-icon.kdbx", {encoding: 'base64'});
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
    const parser = new ResourcesKdbxImportParser(importEntity, resourceTypesCollection, metadataTypesSettings);
    await parser.parseImport();

    // Assert resources
    expect(importEntity.importResources.items).toHaveLength(2);
    expect(importEntity.importResources.items[0]._icon).toBeInstanceOf(IconEntity);
    expect(importEntity.importResources.items[0]._icon.type).toStrictEqual(ICON_TYPE_KEEPASS_ICON_SET);
    expect(importEntity.importResources.items[0]._icon.value).toStrictEqual(4);
    expect(importEntity.importResources.items[0]._icon.backgroundColor).toStrictEqual("#FF0000");
    expect(importEntity.importResources.items[1]._icon).toBeUndefined();
  });

  it("should not import the icon if the default is v4", async() => {
    expect.assertions(3);
    const file = fs.readFileSync("./src/all/background_page/model/import/resources/kdbx/kdbx-protected-with-color-and-icon.kdbx", {encoding: 'base64'});
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
    const parser = new ResourcesKdbxImportParser(importEntity, resourceTypesCollection, metadataTypesSettings);
    await parser.parseImport();
    console.log(importEntity);

    // Assert resources
    expect(importEntity.importResources.items).toHaveLength(2);
    expect(importEntity.importResources.items[0]._icon).toBeUndefined();
    expect(importEntity.importResources.items[1]._icon).toBeUndefined();
  });
});
