/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.6.0
 */
import ExternalGpgKeyEntity from "./externalGpgKeyEntity";
import {ExternalGpgKeyEntityFixtures} from "./externalGpgKeyEntity.test.fixtures";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import * as assertEntityProperty from "passbolt-styleguide/test/assert/assertEntityProperty";

describe("ExternalGpgKey entity", () => {
  describe("ExternalGpgKeyEntity::getSchema", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(ExternalGpgKeyEntity.ENTITY_NAME, ExternalGpgKeyEntity.getSchema());
    });

    it("validates armored_key property", () => {
      assertEntityProperty.string(ExternalGpgKeyEntity, "armored_key");
      assertEntityProperty.minLength(ExternalGpgKeyEntity, "armored_key", 1);
      assertEntityProperty.required(ExternalGpgKeyEntity, "armored_key");
    });

    it("validates key_id property", () => {
      assertEntityProperty.string(ExternalGpgKeyEntity, "key_id");
      assertEntityProperty.minLength(ExternalGpgKeyEntity, "key_id", 8);
      assertEntityProperty.maxLength(ExternalGpgKeyEntity, "key_id", 16);
      assertEntityProperty.notRequired(ExternalGpgKeyEntity, "key_id");
    });


    it("validates user_ids property", () => {
      const correctUserIds = [
        {email: "test@test.com", name: "user's name"},
        {email: "test2@test.com", name: "second user's name"},
      ];
      const successScenarios = [
        assertEntityProperty.SCENARIO_ARRAY,
        {scenario: "with valid user_ids", value: correctUserIds}
      ];

      const failingScenarios = [
        assertEntityProperty.SCENARIO_NULL,
        assertEntityProperty.SCENARIO_INTEGER,
        assertEntityProperty.SCENARIO_STRING,
        assertEntityProperty.SCENARIO_OBJECT,
        assertEntityProperty.SCENARIO_FALSE,
        /*
         * @todo add scenario when nested object will be checked
         * {scenario: "with invalid user_ids", value: [{email: "test", name: 2}]}
         */
      ];

      assertEntityProperty.assert(ExternalGpgKeyEntity, "user_ids", successScenarios, failingScenarios, "type");
      assertEntityProperty.notRequired(ExternalGpgKeyEntity, "user_ids");
    });

    it("validates fingerprint property", () => {
      //@todo: refactor fingerprint check in assertEntityProperty
      assertEntityProperty.string(ExternalGpgKeyEntity, "fingerprint");
      assertEntityProperty.minLength(ExternalGpgKeyEntity, "fingerprint", 40);
      assertEntityProperty.maxLength(ExternalGpgKeyEntity, "fingerprint", 40);
      assertEntityProperty.notRequired(ExternalGpgKeyEntity, "fingerprint");
    });

    it("validates expires property", () => {
      const successScenarios = [
        ...assertEntityProperty.SUCCESS_DATETIME_SCENARIOS,
        {scenario: "date 'infinity'", value: "Infinity"},
        {scenario: "date 'Never'", value: "Never"},
        assertEntityProperty.SCENARIO_NULL,
      ];

      //no failing tests are used as the value is enforced in the constructor
      assertEntityProperty.assert(ExternalGpgKeyEntity, "expires", successScenarios, [], "type");
      assertEntityProperty.notRequired(ExternalGpgKeyEntity, "expires");
    });

    it("validates created property", () => {
      //assertEntityProperty.string: without failing tests as the value is enforced in the constructor
      assertEntityProperty.assert(ExternalGpgKeyEntity, "created", assertEntityProperty.SUCCESS_STRING_SCENARIOS, [], "type");

      //assertEntityProperty.dateTime: without failing tests as the value is enforced in the constructor
      assertEntityProperty.assert(ExternalGpgKeyEntity, "created", assertEntityProperty.SUCCESS_DATETIME_SCENARIOS, [], "format");
      assertEntityProperty.notRequired(ExternalGpgKeyEntity, "created");
    });

    it("validates algorithm property", () => {
      assertEntityProperty.string(ExternalGpgKeyEntity, "algorithm");
      assertEntityProperty.notRequired(ExternalGpgKeyEntity, "algorithm");
    });

    it("validates length property", () => {
      assertEntityProperty.integer(ExternalGpgKeyEntity, "length");
      /*
       * @todo: put back the "min" check when the schema is updated to what's compatible with this rule (using `gte` instead of `min`)
       * assertEntityProperty.min(ExternalGpgKeyEntity, "length", 1);
       */
      assertEntityProperty.notRequired(ExternalGpgKeyEntity, "length");
    });

    it("validates curve property", () => {
      const successScenarios = [
        ...assertEntityProperty.SUCCESS_STRING_SCENARIOS,
        assertEntityProperty.SCENARIO_NULL,
      ];
      const failingScenarios = assertEntityProperty.FAIL_STRING_SCENARIOS;

      assertEntityProperty.assert(ExternalGpgKeyEntity, "curve", successScenarios, failingScenarios, "type");
      assertEntityProperty.notRequired(ExternalGpgKeyEntity, "curve");
    });

    it("validates private property", () => {
      assertEntityProperty.boolean(ExternalGpgKeyEntity, "private");
      assertEntityProperty.notRequired(ExternalGpgKeyEntity, "private");
    });

    it("validates revoked property", () => {
      assertEntityProperty.boolean(ExternalGpgKeyEntity, "revoked");
      assertEntityProperty.notRequired(ExternalGpgKeyEntity, "revoked");
    });
  });

  it("constructor works if valid minimal DTO is provided", () => {
    const dto = ExternalGpgKeyEntityFixtures.minimal_dto;
    const entity = new ExternalGpgKeyEntity(dto);
    expect(entity.toDto()).toEqual(dto);
  });

  it("constructor works if valid full DTO is provided", () => {
    const dto = ExternalGpgKeyEntityFixtures.full_dto;
    const entity = new ExternalGpgKeyEntity(dto);
    expect(entity.toDto()).toEqual(dto);
  });

  it("constructor works if non RSA key information is provided", () => {
    const dto = ExternalGpgKeyEntityFixtures.eddsa;
    const entity = new ExternalGpgKeyEntity(dto);
    expect(entity.toDto()).toEqual(dto);
  });

  it("constructor works if valid legacy full DTO is provided", () => {
    const legacyDto = ExternalGpgKeyEntityFixtures.legacy_full_dto;
    const entity = new ExternalGpgKeyEntity(legacyDto);
    const sanitizedDto = {
      ...legacyDto,
      armored_key: legacyDto.key,
      key_id: legacyDto.keyId,
      user_ids: legacyDto.userIds,
      created: "2015-10-26T12:45:08.000Z",
      expires: "2024-10-26T12:45:08.000Z"
    };
    delete sanitizedDto.key;
    delete sanitizedDto.keyId;
    delete sanitizedDto.userIds;
    expect(entity.toDto()).toEqual(sanitizedDto);
  });

  it.todo("constructor works if the user id email is not standard and the application settings defined a custom validation.");
});
