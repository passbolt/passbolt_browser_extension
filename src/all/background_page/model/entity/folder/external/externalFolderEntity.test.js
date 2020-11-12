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
import Validator from "validator";
import {EntityValidationError} from "../../abstract/entityValidationError";
import {EntitySchema} from "../../abstract/entitySchema";
import {ExternalFolderEntity} from "./externalFolderEntity";

// Reset the modules before each test.
beforeEach(() => {
  window.Validator = Validator;
  jest.resetModules();
});

describe("ExternalFolderEntity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(ExternalFolderEntity.ENTITY_NAME, ExternalFolderEntity.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    const dto = {
      "name": "folder",
    };
    const result = {
      "name": "folder",
      "folder_parent_path": ""
    }
    const entity = new ExternalFolderEntity(dto);
    expect(entity.toDto()).toEqual(result);
    expect(entity.name).toEqual("folder");
    expect(entity.folderParentPath).toEqual("");
    expect(entity.id).toEqual(null);
    expect(entity.path).toEqual("folder");
    expect(entity.depth).toEqual(0);
  });

  it("constructor returns validation error if dto required fields are missing", () => {
    try {
      new ExternalFolderEntity({});
      expect(true).toBeFalsy();
    } catch (error) {
      expect((error instanceof EntityValidationError)).toBe(true);
      expect(error.hasError('name', 'required')).toBe(true);
    }
  });

  it("constructor sanitize folder_parent_path", () => {
    const dto = {
      "name": "folder",
      "folder_parent_path": "// at/ the///root /"
    };
    const entity = new ExternalFolderEntity(dto);
    expect(entity.folderParentPath).toEqual("at/the/root");
  });

  it("constructor returns validation error if dto fields are invalid", () => {
    try {
      new ExternalFolderEntity({
        "name": true,
        "folder_parent_path": []
      });
      expect(true).toBeFalsy();
    } catch (error) {
      expect(error).toBeInstanceOf(EntityValidationError);
      expect(error.hasError("name")).toBe(true);
      expect(error.hasError("folder_parent_path")).toBe(true);
    }
  });

  it("createFromPath constructs a folder from a path", () => {
    const path = "// at/ the///root /";
    const entity = ExternalFolderEntity.createFromPath(path);
    expect(entity.name).toEqual("root");
    expect(entity.folderParentPath).toEqual("at/the");
  });

  it("sanitize sanitizes a path", () => {
    let path = "///";
    expect(ExternalFolderEntity.sanitizePath(path)).toEqual("");
    path = "/root/";
    expect(ExternalFolderEntity.sanitizePath(path)).toEqual("root");
    path = "/  root  / / ////  folder1 /folder2   /// /";
    expect(ExternalFolderEntity.sanitizePath(path)).toEqual("root/folder1/folder2");
  });

  it("changeRootPath change the folder root path", () => {
    const rootFolder = new ExternalFolderEntity({"name": "root"})
    const folder = new ExternalFolderEntity({"name": "Folder 1"});
    folder.changeRootPath(rootFolder)
    expect(folder.folderParentPath).toEqual("root");
    folder.changeRootPath(rootFolder)
    expect(folder.folderParentPath).toEqual("root/root");
  });
});
