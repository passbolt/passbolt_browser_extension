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
  defaultPasswordCredentialOptions
} from "./exportResourcesFileEntity.test.data";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";

describe("ExportResourcesFileEntity", () => {
  describe("ExportResourcesFileEntity::getSchema", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(ExportResourcesFileEntity.ENTITY_NAME, ExportResourcesFileEntity.getSchema());
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
});
