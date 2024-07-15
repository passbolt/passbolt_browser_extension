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

describe("ImportResourcesFileEntity entity", () => {
  describe("ExternalGpgKeyEntity::getSchema", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(ImportResourcesFileEntity.ENTITY_NAME, ImportResourcesFileEntity.getSchema());
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
        /*
         * @todo add scenario when nested object will be checked
         * {folders: null, tags: "3", credentials: null},
         */
      ];

      assertEntityProperty.assert(ImportResourcesFileEntity, "options", successScenarios, failingScenarios, "type");
      assertEntityProperty.notRequired(ImportResourcesFileEntity, "options");
    });
  });

  it("constructor works if valid minimal DTO is provided", () => {
    const csv = "Title,Username,URL,Password,Notes,Group\n" +
      "Password 1,Username 1,https://url1.com,Password 1,Description 1,\n";
    const importDto = {
      "ref": "import-ref",
      "file_type": "csv",
      "file": btoa(csv)
    };
    const entity = new ImportResourcesFileEntity(importDto);
    expect(entity.ref).toEqual("import-ref");
    expect(entity.fileType).toEqual("csv");
    expect(entity.file).toEqual(btoa(csv));
    expect(entity.options).toEqual({});
    expect(entity.mustImportFolders).toEqual(false);
    expect(entity.mustTag).toEqual(false);
    expect(entity.credentials).toEqual({});
    expect(entity.password).toBeUndefined();
    expect(entity.keyfile).toBeUndefined();
  });
});
