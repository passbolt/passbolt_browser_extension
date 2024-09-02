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
import ImportResourcesFileEntity from "./importResourcesFileEntity";
import * as assertEntityProperty from "passbolt-styleguide/test/assert/assertEntityProperty";
import {defaultImportResourceFileDto, defaultImportResourceFileOptionsDto, importResourceFileWithAllOptionsDto} from "./importResourcesFileEntity.test.data";
import FolderEntity from "../folder/folderEntity";
import {defaultFolderDto, minimalFolderDto} from "passbolt-styleguide/src/shared/models/entity/folder/folderEntity.test.data";
import TagEntity from "../tag/tagEntity";
import {defaultTagDto} from "../tag/tagEntity.test.data";
import ExternalResourcesCollection from "../resource/external/externalResourcesCollection";
import {defaultExternalResourceCollectionDto, externalResourceCollectionWithIdsDto} from "../resource/external/externalResourcesCollection.test.data";
import ExternalFoldersCollection from "../folder/external/externalFoldersCollection";
import {defaultExternalFoldersCollectionDto} from "../folder/external/externalFoldersCollection.test.data";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import ImportError from "../../../error/importError";

describe("ImportResourcesFileEntity entity", () => {
  describe("::getSchema", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(ImportResourcesFileEntity.name, ImportResourcesFileEntity.getSchema());
    });

    it("validates ref property", () => {
      const successScenarios = assertEntityProperty.SUCCESS_STRING_SCENARIOS;

      const failingTypeScenarios = [
        assertEntityProperty.SCENARIO_NULL,
        assertEntityProperty.SCENARIO_INTEGER,
        assertEntityProperty.SCENARIO_OBJECT,
        assertEntityProperty.SCENARIO_FALSE,
      ];

      const failingPatternScenario = [
        {scenario: "string not respecting pattern", value: "test//test"}
      ];

      assertEntityProperty.string(ImportResourcesFileEntity, "ref");
      assertEntityProperty.assert(ImportResourcesFileEntity, "ref", successScenarios, failingTypeScenarios, "type");
      assertEntityProperty.assert(ImportResourcesFileEntity, "ref", successScenarios, failingPatternScenario, "pattern");
      assertEntityProperty.required(ImportResourcesFileEntity, "ref");
    });

    it("validates file property", () => {
      const successScenarios = [
        {scenario: "base64 string", value: "cGFzc2JvbHQ="},
      ];

      const failingTypeScenarios = [
        assertEntityProperty.SCENARIO_NULL,
        assertEntityProperty.SCENARIO_INTEGER,
        assertEntityProperty.SCENARIO_OBJECT,
        assertEntityProperty.SCENARIO_FALSE,
      ];

      const failingPatternScenario = [
        {scenario: "string not using base64 charset", value: "!!!!"},
      ];

      assertEntityProperty.string(ImportResourcesFileEntity, "file");
      assertEntityProperty.assert(ImportResourcesFileEntity, "file", successScenarios, failingTypeScenarios, "type");
      assertEntityProperty.assert(ImportResourcesFileEntity, "file", successScenarios, failingPatternScenario, "format");
      assertEntityProperty.required(ImportResourcesFileEntity, "file");
    });

    it("validates file_type property", () => {
      const rightValues = ["csv", "kdbx"];
      const wrongValues = ["test", "file"];
      assertEntityProperty.string(ImportResourcesFileEntity, "file_type");
      assertEntityProperty.enumeration(ImportResourcesFileEntity, "file_type", rightValues, wrongValues);
      assertEntityProperty.required(ImportResourcesFileEntity, "file_type");
    });

    it("validates options property", () => {
      const correctOptions = [
        {folders: true, tags: false, credentials: {password: null, file: "test=="}},
        {folders: false, tags: true, credentials: {password: "password", file: null}},
      ];
      const successScenarios = [
        assertEntityProperty.SCENARIO_ARRAY,
        {scenario: "with valid options", value: correctOptions}
      ];

      const failingScenarios = [
        assertEntityProperty.SCENARIO_INTEGER,
        assertEntityProperty.SCENARIO_STRING,
        assertEntityProperty.SCENARIO_FALSE,
      ];

      assertEntityProperty.assert(ImportResourcesFileEntity, "options", successScenarios, failingScenarios, "type");
      assertEntityProperty.notRequired(ImportResourcesFileEntity, "options");
    });
  });

  describe("::constructor", () => {
    it("constructor works if valid minimal DTO is provided", () => {
      expect.assertions(7);

      const dto = defaultImportResourceFileDto();
      const entity = new ImportResourcesFileEntity(dto);
      expect(entity.ref).toStrictEqual(dto.ref);
      expect(entity.fileType).toStrictEqual(dto.file_type);
      expect(entity.file).toStrictEqual(dto.file);
      expect(entity.mustImportFolders).toStrictEqual(false);
      expect(entity.mustTag).toStrictEqual(false);
      expect(entity.password).toBeNull();
      expect(entity.keyfile).toBeNull();
    });

    it("constructor works if valid fields DTO is provided", () => {
      expect.assertions(7);

      const dto = importResourceFileWithAllOptionsDto();
      const entity = new ImportResourcesFileEntity(dto);
      expect(entity.ref).toStrictEqual(dto.ref);
      expect(entity.fileType).toStrictEqual(dto.file_type);
      expect(entity.file).toStrictEqual(dto.file);
      expect(entity.mustImportFolders).toStrictEqual(true);
      expect(entity.mustTag).toStrictEqual(true);
      expect(entity.password).toStrictEqual(dto.options.credentials.password);
      expect(entity.keyfile).toStrictEqual(dto.options.credentials.keyfile);
    });

    it("constructor should validate options property fields", () => {
      const successScenarios = [
        {scenario: "a valid option", value: defaultImportResourceFileOptionsDto()},
      ];
      const failScenarios = [
        {scenario: "a non boolean tags option", value: defaultImportResourceFileOptionsDto({tags: "test"})},
        {scenario: "a non boolean folders option", value: defaultImportResourceFileOptionsDto({folders: "test"})},
      ];
      assertEntityProperty.assertAssociation(ImportResourcesFileEntity, "options", defaultImportResourceFileDto(), successScenarios, failScenarios);
    });

    it("constructor should validate options.credentials property", () => {
      const successScenarios = [
        {scenario: "a valid option.credentials", value: defaultImportResourceFileOptionsDto()},
        {scenario: "a valid option.credentials with null props", value: defaultImportResourceFileOptionsDto({
          options: {
            credentials: {
              keyfile: null,
              password: null
            }
          }
        })},
      ];
      const failScenarios = [
        {scenario: "a non string options.credentials.keyfile", value: defaultImportResourceFileOptionsDto({credentials: {keyfile: []}})},
        {scenario: "a non string options.credentials.password", value: defaultImportResourceFileOptionsDto({credentials: {password: []}})},
      ];
      assertEntityProperty.assertAssociation(ImportResourcesFileEntity, "options", defaultImportResourceFileDto(), successScenarios, failScenarios);
    });

    it("constructor should validate options property", () => {
      expect.assertions(1);

      const dto = defaultImportResourceFileDto({
        options: {folders: "test"},
      });
      expect(() => new ImportResourcesFileEntity(dto)).toThrow(EntityValidationError);
    });

    it("constructor should ignore options.credentials validation if none provided", () => {
      expect.assertions(1);

      const dto = defaultImportResourceFileDto({
        options: defaultImportResourceFileOptionsDto({credentials: null}),
      });
      expect(() => new ImportResourcesFileEntity(dto)).not.toThrow();
    });
  });

  describe("::getters", () => {
    it("should provide the right values when everything is set from constructor with all options", () => {
      expect.assertions(13);

      const dto = importResourceFileWithAllOptionsDto();
      const entity = new ImportResourcesFileEntity(dto);

      expect(entity.ref).toStrictEqual(dto.ref);
      expect(entity.file).toStrictEqual(dto.file);
      expect(entity.fileType).toStrictEqual(dto.file_type);
      expect(entity.mustImportFolders).toStrictEqual(true);
      expect(entity.mustTag).toStrictEqual(true);
      expect(entity.password).toStrictEqual(dto.options.credentials.password);
      expect(entity.keyfile).toStrictEqual(dto.options.credentials.keyfile);
      expect(entity.referenceFolder).toBeNull();
      expect(entity.referenceTag).toBeNull();
      expect(entity.importResources).toStrictEqual(new ExternalResourcesCollection([]));
      expect(entity.importFolders).toStrictEqual(new ExternalFoldersCollection([]));
      expect(entity.importResourcesErrors).toStrictEqual([]);
      expect(entity.importFoldersErrors).toStrictEqual([]);
    });

    it("should provide the right values when everything is set from constructor with no options", () => {
      expect.assertions(13);

      const dto = defaultImportResourceFileDto();
      const entity = new ImportResourcesFileEntity(dto);

      expect(entity.ref).toStrictEqual(dto.ref);
      expect(entity.file).toStrictEqual(dto.file);
      expect(entity.fileType).toStrictEqual(dto.file_type);
      expect(entity.mustImportFolders).toStrictEqual(false);
      expect(entity.mustTag).toStrictEqual(false);
      expect(entity.password).toBeNull();
      expect(entity.keyfile).toBeNull();
      expect(entity.referenceFolder).toBeNull();
      expect(entity.referenceTag).toBeNull();
      expect(entity.importResources).toStrictEqual(new ExternalResourcesCollection([]));
      expect(entity.importFolders).toStrictEqual(new ExternalFoldersCollection([]));
      expect(entity.importResourcesErrors).toStrictEqual([]);
      expect(entity.importFoldersErrors).toStrictEqual([]);
    });
  });

  describe("::setters", () => {
    it("should set the property as expected", () => {
      expect.assertions(4);

      const dto = importResourceFileWithAllOptionsDto();
      const entity = new ImportResourcesFileEntity(dto);

      const folderEntity = new FolderEntity(defaultFolderDto());
      entity.referenceFolder = folderEntity;

      const tagEntity = new TagEntity(defaultTagDto());
      entity.referenceTag = tagEntity;

      const externalResourcesCollection = new ExternalResourcesCollection(defaultExternalResourceCollectionDto());
      entity.importResources = externalResourcesCollection;

      const externalFoldersCollection = new ExternalFoldersCollection(defaultExternalFoldersCollectionDto());
      entity.importFolders = externalFoldersCollection;

      expect(entity.referenceFolder).toStrictEqual(folderEntity);
      expect(entity.referenceTag).toStrictEqual(tagEntity);
      expect(entity.importResources).toStrictEqual(externalResourcesCollection);
      expect(entity.importFolders).toStrictEqual(externalFoldersCollection);
    });

    it("should assert referenceFolder as a FolderEntity", () => {
      expect.assertions(1);

      const dto = defaultImportResourceFileDto();
      const entity = new ImportResourcesFileEntity(dto);

      expect(() => entity.referenceFolder = "test").toThrow(TypeError);
    });

    it("should assert referenceTag as a TagEntity", () => {
      expect.assertions(1);

      const dto = defaultImportResourceFileDto();
      const entity = new ImportResourcesFileEntity(dto);

      expect(() => entity.referenceTag = "test").toThrow(TypeError);
    });

    it("should assert importResources as a ExternalResourcesCollection", () => {
      expect.assertions(1);

      const dto = defaultImportResourceFileDto();
      const entity = new ImportResourcesFileEntity(dto);

      expect(() => entity.importResources = "test").toThrow(TypeError);
    });
  });

  describe("::toDto", () => {
    it("Should format the data as expected", () => {
      expect.assertions(1);

      const entity = new ImportResourcesFileEntity(importResourceFileWithAllOptionsDto());
      const expectedResult = {
        created: {
          resourcesCount: 0,
          foldersCount: 0,
        },
        errors: {
          resources: [],
          folders: [],
        },
        options: {
          folders: true,
          tags: true
        },
        references: {
          folder: null,
          tag: null,
        },
      };

      expect(entity.toDto()).toStrictEqual(expectedResult);
    });

    it("Should format the data as expected with all the information available", () => {
      expect.assertions(1);

      const entity = new ImportResourcesFileEntity(importResourceFileWithAllOptionsDto());

      const folderReference = new FolderEntity(minimalFolderDto());
      entity.referenceFolder = folderReference;

      const tagReference = new TagEntity(defaultTagDto());
      entity.referenceTag = tagReference;

      const foldersCollection = new ExternalFoldersCollection(defaultExternalFoldersCollectionDto());
      entity.importFolders = foldersCollection;

      const resourcesCollection = new ExternalResourcesCollection(externalResourceCollectionWithIdsDto());
      entity.importResources = resourcesCollection;

      const importFoldersError = new ImportError("An error occured while importing a folder");
      entity.importFoldersErrors.push(importFoldersError);

      const importResourcesError = new ImportError("An error occured while importing a resource");
      entity.importResourcesErrors.push(importResourcesError);

      const expectedResult = {
        created: {
          resourcesCount: resourcesCollection.length,
          foldersCount: foldersCollection.length,
        },
        errors: {
          resources: [importResourcesError.toJSON()],
          folders: [importFoldersError.toJSON()],
        },
        options: {
          folders: true,
          tags: true
        },
        references: {
          folder: folderReference.toDto(),
          tag: tagReference.toDto(),
        },
      };

      expect(entity.toDto()).toStrictEqual(expectedResult);
    });
  });

  describe("::toJSON", () => {
    it("Should call `toDto` the expected way", () => {
      expect.assertions(3);

      const entity = new ImportResourcesFileEntity(importResourceFileWithAllOptionsDto());
      const spyOnToDto = jest.spyOn(entity, "toDto");

      const expectedResult = {
        created: {
          resourcesCount: 0,
          foldersCount: 0,
        },
        errors: {
          resources: [],
          folders: [],
        },
        options: {
          folders: true,
          tags: true
        },
        references: {
          folder: null,
          tag: null,
        },
      };

      const result = entity.toJSON();

      expect(result).toStrictEqual(expectedResult);
      expect(spyOnToDto).toHaveBeenCalledTimes(1);
      expect(spyOnToDto).toHaveBeenCalledWith();
    });
  });
});
