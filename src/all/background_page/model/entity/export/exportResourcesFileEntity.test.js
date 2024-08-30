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
 * @since         4.8.0
 */
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import * as assertEntityProperty from "passbolt-styleguide/test/assert/assertEntityProperty";
import ExportResourcesFileEntity from "./exportResourcesFileEntity";
import {
  defaultEmptyOptions,
  defaultKdbxExportResourceFileDto,
  defaultKeyFileCredentialOptions,
  defaultPasswordCredentialOptions,
  kdbxWithKeyExportResourceFileDto
} from "./exportResourcesFileEntity.test.data";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import ExternalResourcesCollection from "../resource/external/externalResourcesCollection";
import ExternalFoldersCollection from "../folder/external/externalFoldersCollection";
import {defaultExternalResourceCollectionDto} from "../resource/external/externalResourcesCollection.test.data";
import {defaultExternalFoldersCollectionDto} from "../folder/external/externalFoldersCollection.test.data";

describe("ExportResourcesFileEntity", () => {
  describe("::getSchema", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(ExportResourcesFileEntity.name, ExportResourcesFileEntity.getSchema());
    });

    it("validates format property", () => {
      const expectedValues = [
        "kdbx",
        "kdbx-others",
        "csv-kdbx",
        "csv-lastpass",
        "csv-1password",
        "csv-chromium",
        "csv-bitwarden",
        "csv-mozilla",
        "csv-safari",
        "csv-dashlane",
        "csv-nordpass",
        "csv-logmeonce",
      ];
      const unexpectedValues = ["1", "false", "test"];
      assertEntityProperty.enumeration(ExportResourcesFileEntity, "format", expectedValues, unexpectedValues);
      assertEntityProperty.required(ExportResourcesFileEntity, "format");
    });

    it("validates resources_ids property", () => {
      const successScenarios = [
        assertEntityProperty.SCENARIO_ARRAY,
        assertEntityProperty.SCENARIO_NULL,
      ];
      const failingScenarios = [
        assertEntityProperty.SCENARIO_STRING,
      ];
      assertEntityProperty.assert(ExportResourcesFileEntity, "resources_ids", successScenarios, failingScenarios, "type");
      assertEntityProperty.nullable(ExportResourcesFileEntity, "resources_ids");
      assertEntityProperty.notRequired(ExportResourcesFileEntity, "resources_ids");
      assertEntityProperty.assertArrayItemString(ExportResourcesFileEntity, "resources_ids");
      assertEntityProperty.assertArrayItemUuid(ExportResourcesFileEntity, "resources_ids");
    });

    it("validates folders_ids property", () => {
      const successScenarios = [
        assertEntityProperty.SCENARIO_ARRAY,
        assertEntityProperty.SCENARIO_NULL,
      ];
      const failingScenarios = [
        assertEntityProperty.SCENARIO_STRING,
      ];
      assertEntityProperty.assert(ExportResourcesFileEntity, "folders_ids", successScenarios, failingScenarios, "type");
      assertEntityProperty.nullable(ExportResourcesFileEntity, "folders_ids");
      assertEntityProperty.notRequired(ExportResourcesFileEntity, "folders_ids");
      assertEntityProperty.assertArrayItemString(ExportResourcesFileEntity, "folders_ids");
      assertEntityProperty.assertArrayItemUuid(ExportResourcesFileEntity, "folders_ids");
    });

    it("validates export_resources property", () => {
      const successScenarios = [
        assertEntityProperty.SCENARIO_ARRAY,
      ];
      const failingScenarios = [
        assertEntityProperty.SCENARIO_STRING,
      ];
      assertEntityProperty.assert(ExportResourcesFileEntity, "export_resources", successScenarios, failingScenarios, "type");
      assertEntityProperty.notNullable(ExportResourcesFileEntity, "export_resources");
      assertEntityProperty.notRequired(ExportResourcesFileEntity, "export_resources");
    });

    it("validates export_folders property", () => {
      const successScenarios = [
        assertEntityProperty.SCENARIO_ARRAY,
      ];
      const failingScenarios = [
        assertEntityProperty.SCENARIO_STRING,
      ];
      assertEntityProperty.assert(ExportResourcesFileEntity, "export_folders", successScenarios, failingScenarios, "type");
      assertEntityProperty.notNullable(ExportResourcesFileEntity, "export_folders");
      assertEntityProperty.notRequired(ExportResourcesFileEntity, "export_folders");
    });

    it("validates options property", () => {
      const baseDto = defaultKdbxExportResourceFileDto();

      const successScenarios = [
        {scenario: "with an empty `options` field", value: defaultEmptyOptions()},
        {scenario: "with `options` set with password credentials", value: defaultPasswordCredentialOptions()},
        {scenario: "with `options` set with keyfile credentials", value: defaultKeyFileCredentialOptions()},
      ];

      const failingScenarios = [
        assertEntityProperty.SCENARIO_STRING,
      ];

      successScenarios.forEach(test => {
        const dto = {
          ...baseDto,
          options: test.value
        };
        expect(() => new ExportResourcesFileEntity(dto)).not.toThrow();
      });

      failingScenarios.forEach(test => {
        const dto = {
          ...baseDto,
          options: test.value
        };
        expect(() => new ExportResourcesFileEntity(dto)).toThrow(EntityValidationError);
      });

      assertEntityProperty.notRequired(ExportResourcesFileEntity, "options");
    });
  });

  describe("::constructor", () => {
    it("constructor works if valid minimal DTO is provided", () => {
      expect.assertions(6);

      const dto = defaultEmptyOptions({format: "kdbx"});
      const entity = new ExportResourcesFileEntity(dto);

      expect(entity._props.format).toStrictEqual(dto.format);
      expect(entity._props.resources_ids).toBeUndefined();
      expect(entity._props.folders_ids).toBeUndefined();
      expect(entity.exportResources).toStrictEqual(new ExternalResourcesCollection([]));
      expect(entity.exportFolders).toStrictEqual(new ExternalFoldersCollection([]));
      expect(entity._props.options).toBeUndefined();
    });

    it("constructor works if valid fields DTO is provided", () => {
      expect.assertions(6);

      const dto = defaultKdbxExportResourceFileDto();
      const entity = new ExportResourcesFileEntity(dto);

      expect(entity._props.format).toStrictEqual(dto.format);
      expect(entity._props.resources_ids).toStrictEqual([]);
      expect(entity._props.folders_ids).toStrictEqual([]);
      expect(entity.exportResources.toDto()).toStrictEqual(dto.export_resources);
      expect(entity.exportFolders.toDto()).toStrictEqual(dto.export_folders);
      expect(entity._props.options).toStrictEqual(dto.options);
    });
  });

  describe("::getters", () => {
    it("should provide the right values when everything is set", () => {
      expect.assertions(12);

      const dto = defaultKdbxExportResourceFileDto();
      const entity = new ExportResourcesFileEntity(dto);

      expect(entity.format).toStrictEqual(dto.format);
      expect(entity.foldersIds).toStrictEqual(dto.folders_ids);
      expect(entity.resourcesIds).toStrictEqual(dto.resources_ids);
      expect(entity.password).toStrictEqual(dto.options.credentials.password);
      expect(entity.keyfile).toStrictEqual(dto.options.credentials.keyfile);
      expect(entity.fileType).toStrictEqual(dto.format);

      expect(entity.exportResources).toBeInstanceOf(ExternalResourcesCollection);
      expect(entity.exportResources).toHaveLength(dto.export_resources.length);
      expect(entity.exportResources.toDto()).toStrictEqual(dto.export_resources);

      expect(entity.exportFolders).toBeInstanceOf(ExternalFoldersCollection);
      expect(entity.exportFolders).toHaveLength(dto.export_folders.length);
      expect(entity.exportFolders.toDto()).toStrictEqual(dto.export_folders);
    });

    it("should provide the right values for exporting to KDBX with keyfile", () => {
      expect.assertions(2);

      const dto = kdbxWithKeyExportResourceFileDto();
      const entity = new ExportResourcesFileEntity(dto);

      expect(entity.password).toStrictEqual(dto.options.credentials.password);
      expect(entity.keyfile).toStrictEqual(dto.options.credentials.keyfile);
    });

    it("should provide the default values with minimal dto", () => {
      expect.assertions(8);

      const dto = defaultEmptyOptions({format: "kdbx"});
      const entity = new ExportResourcesFileEntity(dto);

      expect(entity.format).toStrictEqual("kdbx");
      expect(entity.foldersIds).toBeNull();
      expect(entity.resourcesIds).toBeNull();
      expect(entity.password).toBeNull();
      expect(entity.keyfile).toBeNull();
      expect(entity.fileType).toStrictEqual("kdbx");
      expect(entity.exportResources).toStrictEqual(new ExternalResourcesCollection([]));
      expect(entity.exportFolders).toStrictEqual(new ExternalFoldersCollection([]));
    });
  });

  describe("::setters", () => {
    it("should set the property as expected", () => {
      expect.assertions(2);

      const dto = defaultEmptyOptions({format: "kdbx"});
      const entity = new ExportResourcesFileEntity(dto);

      const externalResourcesCollection = new ExternalResourcesCollection(defaultExternalResourceCollectionDto());
      const externalFoldersCollection = new ExternalFoldersCollection(defaultExternalFoldersCollectionDto());

      entity.exportResources = externalResourcesCollection;
      entity.exportFolders = externalFoldersCollection;

      expect(entity.exportResources).toStrictEqual(externalResourcesCollection);
      expect(entity.exportFolders).toStrictEqual(externalFoldersCollection);
    });

    it("should assert exportResources as ExternalResourcesCollection", () => {
      expect.assertions(1);

      const dto = defaultEmptyOptions({format: "kdbx"});
      const entity = new ExportResourcesFileEntity(dto);

      expect(() => entity.exportResources = "test").toThrow(TypeError);
    });

    it("should assert exportFolder as ExternalFoldersCollection", () => {
      expect.assertions(1);

      const dto = defaultEmptyOptions({format: "kdbx"});
      const entity = new ExportResourcesFileEntity(dto);

      expect(() => entity.exportFolders = "test").toThrow(TypeError);
    });
  });
});
