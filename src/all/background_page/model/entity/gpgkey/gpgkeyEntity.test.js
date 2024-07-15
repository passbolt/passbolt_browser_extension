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
 * @since         3.5.0
 */
import GpgkeyEntity from "./gpgkeyEntity";
import {GpgkeyEntityFixtures} from "./gpgkeyEntity.test.fixtures";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import * as assertEntityProperty from "passbolt-styleguide/test/assert/assertEntityProperty";

describe("Gpgkey entity", () => {
  describe("GpgkeyEntity::getSchema", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(GpgkeyEntity.ENTITY_NAME, GpgkeyEntity.getSchema());
    });

    it("validates id property", () => {
      assertEntityProperty.uuid(GpgkeyEntity, "id");
      assertEntityProperty.notRequired(GpgkeyEntity, "id");
    });

    it("validates user_id property", () => {
      assertEntityProperty.uuid(GpgkeyEntity, "user_id");
      assertEntityProperty.required(GpgkeyEntity, "user_id");
    });

    it("validates fingerprint property", () => {
      //@todo: refactor fingerprint check in assertEntityProperty
      assertEntityProperty.string(GpgkeyEntity, "fingerprint");
      assertEntityProperty.minLength(GpgkeyEntity, "fingerprint", 40);
      assertEntityProperty.maxLength(GpgkeyEntity, "fingerprint", 40);
      assertEntityProperty.notRequired(GpgkeyEntity, "fingerprint");
    });

    it("validates armored_key property", () => {
      assertEntityProperty.string(GpgkeyEntity, "armored_key");
      assertEntityProperty.required(GpgkeyEntity, "armored_key");
    });

    it("validates type property", () => {
      const successScenarios = [
        ...assertEntityProperty.SUCCESS_STRING_SCENARIOS,
        assertEntityProperty.SCENARIO_NULL,
      ];
      const failingScenarios = assertEntityProperty.FAIL_STRING_SCENARIOS;

      assertEntityProperty.assert(GpgkeyEntity, "type", successScenarios, failingScenarios, "type");
      assertEntityProperty.notRequired(GpgkeyEntity, "type");
    });

    it("validates uid property", () => {
      assertEntityProperty.string(GpgkeyEntity, "uid");
      assertEntityProperty.notRequired(GpgkeyEntity, "uid");
    });

    it("validates bits property", () => {
      const successScenarios = [
        ...assertEntityProperty.SUCCESS_INTEGER_SCENARIO,
        assertEntityProperty.SCENARIO_NULL,
      ];
      const failingScenarios = assertEntityProperty.FAIL_INTEGER_SCENARIO;

      assertEntityProperty.assert(GpgkeyEntity, "bits", successScenarios, failingScenarios, "type");
      assertEntityProperty.notRequired(GpgkeyEntity, "bits");
    });

    it("validates key_id property", () => {
      assertEntityProperty.string(GpgkeyEntity, "key_id");
      assertEntityProperty.minLength(GpgkeyEntity, "key_id", 8);
      assertEntityProperty.maxLength(GpgkeyEntity, "key_id", 16);
      assertEntityProperty.notRequired(GpgkeyEntity, "key_id");
    });

    it("validates key_created property", () => {
      assertEntityProperty.string(GpgkeyEntity, "key_created");
      assertEntityProperty.dateTime(GpgkeyEntity, "key_created");
      assertEntityProperty.notRequired(GpgkeyEntity, "key_created");
    });

    it("validates expires property", () => {
      assertEntityProperty.dateTime(GpgkeyEntity, "expires");
      assertEntityProperty.nullable(GpgkeyEntity, "expires");
      assertEntityProperty.notRequired(GpgkeyEntity, "expires");
    });

    it("validates created property", () => {
      assertEntityProperty.string(GpgkeyEntity, "created");
      assertEntityProperty.dateTime(GpgkeyEntity, "created");
      assertEntityProperty.notRequired(GpgkeyEntity, "created");
    });

    it("validates modified property", () => {
      assertEntityProperty.string(GpgkeyEntity, "modified");
      assertEntityProperty.dateTime(GpgkeyEntity, "modified");
      assertEntityProperty.notRequired(GpgkeyEntity, "modified");
    });

    it("validates deleted property", () => {
      assertEntityProperty.boolean(GpgkeyEntity, "deleted");
      assertEntityProperty.notRequired(GpgkeyEntity, "deleted");
    });
  });

  it("constructor works if valid minimal DTO is provided", () => {
    const dto = GpgkeyEntityFixtures.default;
    const key = new GpgkeyEntity(dto);
    expect(key.toDto()).toEqual(dto);
  });

  it("constructor works if valid DTO is provided with optional and non supported fields", () => {
    const unsupportedFields = {
      unkwnown: 1,
      unsupported: false,
    };
    const expectedDto = GpgkeyEntityFixtures.default;
    const dto = Object.assign({}, expectedDto, unsupportedFields);
    const key = new GpgkeyEntity(dto);
    expect(key.toDto()).toEqual(expectedDto);
  });
});
