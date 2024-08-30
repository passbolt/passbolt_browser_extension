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
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import ExternalFolderEntity from "./externalFolderEntity";
import * as assertEntityProperty from "passbolt-styleguide/test/assert/assertEntityProperty";
import {defaultExternalFolderDto, minimalExternalFolderDto} from "./externalFolderEntity.test.data";
import {v4 as uuid} from 'uuid';
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";

describe("ExternalFolderEntity", () => {
  describe("::getSchema", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(ExternalFolderEntity.name, ExternalFolderEntity.getSchema());
    });

    it("validates id property", () => {
      assertEntityProperty.string(ExternalFolderEntity, "id");
      assertEntityProperty.uuid(ExternalFolderEntity, "id");
      assertEntityProperty.notRequired(ExternalFolderEntity, "id");
    });

    it("validates name property", () => {
      assertEntityProperty.string(ExternalFolderEntity, "name");
      assertEntityProperty.minLength(ExternalFolderEntity, "name", 1);
      assertEntityProperty.maxLength(ExternalFolderEntity, "name", 256);
      assertEntityProperty.required(ExternalFolderEntity, "name");
    });

    it("validates folder_parent_id property", () => {
      assertEntityProperty.string(ExternalFolderEntity, "folder_parent_id");
      assertEntityProperty.uuid(ExternalFolderEntity, "folder_parent_id");
      assertEntityProperty.nullable(ExternalFolderEntity, "folder_parent_id");
      assertEntityProperty.notRequired(ExternalFolderEntity, "folder_parent_id");
    });

    it("validates folder_parent_path property", () => {
      assertEntityProperty.string(ExternalFolderEntity, "folder_parent_path");
      assertEntityProperty.notRequired(ExternalFolderEntity, "folder_parent_path");
    });
  });

  describe("::constructor", () => {
    it("constructor works if valid minimal DTO is provided", () => {
      expect.assertions(6);

      const dto = minimalExternalFolderDto();
      const result = Object.assign({}, dto, {
        "folder_parent_path": ""
      });

      const entity = new ExternalFolderEntity(dto);
      expect(entity.toDto()).toEqual(result);
      expect(entity.name).toStrictEqual(dto.name);
      expect(entity.folderParentPath).toEqual("");
      expect(entity.id).toBeNull();
      expect(entity.path).toEqual(dto.name);
      expect(entity.depth).toEqual(0);
    });

    it("constructor sanitize folder_parent_path", () => {
      expect.assertions(1);
      const dto = minimalExternalFolderDto({
        "folder_parent_path": "// at/ the///root //"
      });
      const entity = new ExternalFolderEntity(dto);
      expect(entity.folderParentPath).toStrictEqual("/ at/ the/root /");
    });

    it("constructor should set the folder_parent_path to an empty string if not provided", () => {
      expect.assertions(1);
      const dto = minimalExternalFolderDto();
      const entity = new ExternalFolderEntity(dto);
      expect(entity.folderParentPath).toStrictEqual("");
    });
  });

  describe("::createFromPath", () => {
    it("should construct a folder from a path", () => {
      expect.assertions(2);

      const path = "// at/ the///root /";
      const entity = ExternalFolderEntity.createFromPath(path);

      expect(entity.name).toEqual("root /");
      expect(entity.folderParentPath).toEqual("/ at/ the");
    });
  });

  describe("::sanitizePath", () => {
    it("should sanitize a path by removing all trailing slashes", () => {
      expect.assertions(1);
      const path = "///";
      expect(ExternalFolderEntity.sanitizePath(path)).toEqual("");
    });

    it("should sanitize a path by removing all trailing slashes but keep the folder name", () => {
      expect.assertions(1);
      const path = "/root/";
      expect(ExternalFolderEntity.sanitizePath(path)).toEqual("root");
    });

    it("should sanitize a path by removing all trailing slashes but keep the folder name and keep the starting '/ ' and ending ' /' pattern in the folders name", () => {
      expect.assertions(1);
      const path = "///  root  / / ////  folder1 /folder2   /// ///";
      expect(ExternalFolderEntity.sanitizePath(path)).toEqual("/  root  / / ///  folder1 /folder2   /// /");
    });
  });

  describe("::changeRootPath", () => {
    it("changeRootPath change the folder root path and keep the full path", () => {
      expect.assertions(4);

      const rootFolder = new ExternalFolderEntity({"name": "root"});
      const intermediateFolder = new ExternalFolderEntity({"name": "Intermediate Folder"});
      const folder = new ExternalFolderEntity({"name": "Folder 1"});

      intermediateFolder.changeRootPath(rootFolder);
      expect(intermediateFolder.folderParentPath).toStrictEqual("root");
      expect(intermediateFolder.path).toStrictEqual("root/Intermediate Folder");

      folder.changeRootPath(intermediateFolder);
      expect(folder.folderParentPath).toStrictEqual("root/Intermediate Folder");
      expect(folder.path).toStrictEqual("root/Intermediate Folder/Folder 1");
    });
  });

  describe("::splitFolderPath", () => {
    it("should split folder path using '/' as a delimiter", () => {
      expect.assertions(1);
      const folderPathString =  "Root/DatabaseCC/Domaine/Windows";
      const expectedResult = ["Root", "DatabaseCC", "Domaine", "Windows"];
      expect(ExternalFolderEntity.splitFolderPath(folderPathString)).toStrictEqual(expectedResult);
    });

    it("should split folder path using '/'as a delimiter but keep the starting '/ ' as part of the folders name", () => {
      expect.assertions(1);
      const folderPathString =  "Root/DatabaseCC// Domaine/Windows// Subfolder";
      const expectedResult = ["Root", "DatabaseCC", "/ Domaine", "Windows", "/ Subfolder"];
      expect(ExternalFolderEntity.splitFolderPath(folderPathString)).toStrictEqual(expectedResult);
    });

    it("should split folder path using '/' as a delimiter but keep the ending ' /' as part of the folders name", () => {
      expect.assertions(1);
      const folderPathString =  "Root/DatabaseCC //Domaine/Windows //Subfolder";
      const expectedResult = ["Root", "DatabaseCC /", "Domaine", "Windows /", "Subfolder"];
      expect(ExternalFolderEntity.splitFolderPath(folderPathString)).toStrictEqual(expectedResult);
    });

    it("should split folder path using '/' as a delimiter but keep the in-between ' / ' as part of the folders name", () => {
      expect.assertions(1);
      const folderPathString =  "Root/DatabaseCC / Domaine/Windows / Subfolder";
      const expectedResult = ["Root", "DatabaseCC / Domaine", "Windows / Subfolder"];
      expect(ExternalFolderEntity.splitFolderPath(folderPathString)).toStrictEqual(expectedResult);
    });

    it("should split folder path using '/' as a delimiter but keep all the special '/' patterns as part of the folders name", () => {
      expect.assertions(1);
      const folderPathString =  "/ Root/DatabaseCC / Domaine/Windows /// Sub / folder /";
      const expectedResult = ["/ Root", "DatabaseCC / Domaine", "Windows /", "/ Sub / folder /"];
      expect(ExternalFolderEntity.splitFolderPath(folderPathString)).toStrictEqual(expectedResult);
    });
  });

  describe("::escapeName", () => {
    it("Should keep the name if no special pattern is present", () => {
      expect.assertions(1);
      const folderName =  "Root";
      const expectedFolderName = "Root";
      expect(ExternalFolderEntity.escapeName(folderName)).toStrictEqual(expectedFolderName);
    });

    it("Should work even with an falsy data", () => {
      expect.assertions(1);
      expect(ExternalFolderEntity.escapeName(null)).toStrictEqual("");
    });

    it("Should trim the given name", () => {
      expect.assertions(1);
      const folderName =  " Root ";
      const expectedFolderName = "Root";
      expect(ExternalFolderEntity.escapeName(folderName)).toStrictEqual(expectedFolderName);
    });

    it("Should add a space for any starting '/'", () => {
      expect.assertions(1);
      const folderName =  "/Root";
      const expectedFolderName = "/ Root";
      expect(ExternalFolderEntity.escapeName(folderName)).toStrictEqual(expectedFolderName);
    });

    it("Should add a space for any starting '/' even when there are already spaces", () => {
      expect.assertions(1);
      const folderName =  "/ Root";
      const expectedFolderName = "/  Root";
      expect(ExternalFolderEntity.escapeName(folderName)).toStrictEqual(expectedFolderName);
    });

    it("Should put a space before any ending '/'", () => {
      expect.assertions(1);
      const folderName =  "Root/";
      const expectedFolderName = "Root /";
      expect(ExternalFolderEntity.escapeName(folderName)).toStrictEqual(expectedFolderName);
    });

    it("Should put a space before any ending '/' even when there are already spaces", () => {
      expect.assertions(1);
      const folderName =  "Root /";
      const expectedFolderName = "Root  /";
      expect(ExternalFolderEntity.escapeName(folderName)).toStrictEqual(expectedFolderName);
    });

    it("Should surrond '/' characters with spaces", () => {
      expect.assertions(1);
      const folderName =  "R/o/o/t";
      const expectedFolderName = "R / o/o / t";
      expect(ExternalFolderEntity.escapeName(folderName)).toStrictEqual(expectedFolderName);
    });

    it("Should surrond '/' characters with spaces even when there are already spaces", () => {
      expect.assertions(1);
      const folderName =  "R / o / o / t";
      const expectedFolderName = "R  /  o  /  o  /  t";
      expect(ExternalFolderEntity.escapeName(folderName)).toStrictEqual(expectedFolderName);
    });

    it("Should apply spaces for all '/' patterns that can be found", () => {
      expect.assertions(1);
      const folderName =  "///R/o / ot/";
      const expectedFolderName = "/  / /R / o  /  ot /";
      expect(ExternalFolderEntity.escapeName(folderName)).toStrictEqual(expectedFolderName);
    });
  });

  describe("::resolveEscapedName", () => {
    it("Should keep the name if no special pattern is present", () => {
      expect.assertions(1);
      const folderName =  "Root";
      const expectedFolderName = "Root";
      expect(ExternalFolderEntity.resolveEscapedName(folderName)).toStrictEqual(expectedFolderName);
    });

    it("Should work even with an falsy data", () => {
      expect.assertions(1);
      expect(ExternalFolderEntity.resolveEscapedName(null)).toStrictEqual("");
    });

    it("Should keep the name as-is even with trailing spaces", () => {
      expect.assertions(1);
      const folderName =  " Root ";
      const expectedFolderName = " Root ";
      expect(ExternalFolderEntity.resolveEscapedName(folderName)).toStrictEqual(expectedFolderName);
    });

    it("Should not keep the name as-is even with internal `/`", () => {
      expect.assertions(1);
      const folderName =  "Ro/ot";
      const expectedFolderName = "Ro/ot";
      expect(ExternalFolderEntity.resolveEscapedName(folderName)).toStrictEqual(expectedFolderName);
    });

    it("Should remove spaces surrounding a '/' inside the string", () => {
      expect.assertions(1);
      const folderName =  "Ro / ot";
      const expectedFolderName = "Ro/ot";
      expect(ExternalFolderEntity.resolveEscapedName(folderName)).toStrictEqual(expectedFolderName);
    });

    it("Should remove the space from '/ ' if the string starts with this pattern", () => {
      expect.assertions(1);
      const folderName =  "/ Root";
      const expectedFolderName = "/Root";
      expect(ExternalFolderEntity.resolveEscapedName(folderName)).toStrictEqual(expectedFolderName);
    });

    it("Should remove the space from ' /' if the string ends with this pattern", () => {
      expect.assertions(1);
      const folderName =  "Root /";
      const expectedFolderName = "Root/";
      expect(ExternalFolderEntity.resolveEscapedName(folderName)).toStrictEqual(expectedFolderName);
    });

    it("Should apply all the rules at once", () => {
      expect.assertions(1);
      const folderName =  "/ R / oo / t /";
      const expectedFolderName = "/R/oo/t/";
      expect(ExternalFolderEntity.resolveEscapedName(folderName)).toStrictEqual(expectedFolderName);
    });

    it("Should apply all the rules at once and keep the trailing spaces", () => {
      expect.assertions(1);
      const folderName =  "  / R / oo / t /  ";
      const expectedFolderName = " /R/oo/t/ ";
      expect(ExternalFolderEntity.resolveEscapedName(folderName)).toStrictEqual(expectedFolderName);
    });
  });

  describe("::depth", () => {
    it("Sould give the right depth for a root", () => {
      expect.assertions(1);
      const dto = minimalExternalFolderDto({
        folder_parent_path: "Root",
      });
      const externalFolderEntity = new ExternalFolderEntity(dto);
      expect(externalFolderEntity.depth).toStrictEqual(1);
    });

    it("Sould give the right depth for folders with basic names", () => {
      expect.assertions(1);
      const dto = minimalExternalFolderDto({
        folder_parent_path: "Root/Subfolder",
      });
      const externalFolderEntity = new ExternalFolderEntity(dto);
      expect(externalFolderEntity.depth).toStrictEqual(2);
    });

    it("Sould give the right depth for folders having slashes in their names", () => {
      expect.assertions(1);
      const dto = minimalExternalFolderDto({
        folder_parent_path: "/ Root/Intermediate / folder/Last Folder /",
      });
      const externalFolderEntity = new ExternalFolderEntity(dto);
      expect(externalFolderEntity.depth).toStrictEqual(3);
    });

    it("Sould give the right depth for folders with chaotic-like path", () => {
      expect.assertions(1);
      const dto = minimalExternalFolderDto({
        folder_parent_path: " // Root //DatabaseCC/ / //Réseau avocat / Vidéo // /",
      });
      const externalFolderEntity = new ExternalFolderEntity(dto);
      expect(externalFolderEntity.depth).toStrictEqual(3);
    });
  });

  describe("::getters", () => {
    it("should provide the right values when everything is set", () => {
      expect.assertions(6);

      const dto = defaultExternalFolderDto();
      const entity = new ExternalFolderEntity(dto);

      expect(entity.id).toStrictEqual(dto.id);
      expect(entity.name).toStrictEqual(dto.name);
      expect(entity.folderParentId).toStrictEqual(dto.folder_parent_id);
      expect(entity.folderParentPath).toStrictEqual(dto.folder_parent_path);
      expect(entity.path).toStrictEqual(`${dto.folder_parent_path}/${dto.name}`);
      expect(entity.depth).toStrictEqual(1);
    });

    it("should provide the default values with minimal dto", () => {
      expect.assertions(6);

      const dto = minimalExternalFolderDto();
      const entity = new ExternalFolderEntity(dto);

      expect(entity.id).toBeNull();
      expect(entity.name).toStrictEqual(dto.name);
      expect(entity.folderParentId).toBeNull();
      expect(entity.folderParentPath).toStrictEqual("");
      expect(entity.path).toStrictEqual(dto.name);
      expect(entity.depth).toStrictEqual(0);
    });
  });

  describe("::setters", () => {
    it("should provide the right values when everything is set", () => {
      expect.assertions(2);

      const entity = new ExternalFolderEntity(defaultExternalFolderDto());
      const expectedData = {
        id: uuid(),
        folder_parent_id: uuid(),
      };

      entity.id = expectedData.id;
      entity.folderParentId = expectedData.folder_parent_id;

      expect(entity.id).toStrictEqual(expectedData.id);
      expect(entity.folderParentId).toStrictEqual(expectedData.folder_parent_id);
    });

    it("should validate id when using the setter", () => {
      expect.assertions(1);

      const entity = new ExternalFolderEntity(minimalExternalFolderDto());
      expect(() => { entity.id = 42; }).toThrow(EntityValidationError);
    });

    it("should validate folderParentId when using the setter", () => {
      expect.assertions(1);

      const entity = new ExternalFolderEntity(minimalExternalFolderDto());
      expect(() => { entity.folderParentId = 42; }).toThrow(EntityValidationError);
    });
  });
});
