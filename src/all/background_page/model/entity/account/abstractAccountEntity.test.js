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
import AbstractAccountEntity from "./abstractAccountEntity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import * as assertEntityProperty from "passbolt-styleguide/test/assert/assertEntityProperty";
import {StubAbstractAccountEntity, defaultAbstractAccountDto} from "./abstractAccountEntity.test.data";

describe("AbstractAccountEntity", () => {
  describe("AbstractAccountEntity::getSchema", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(AbstractAccountEntity.ENTITY_NAME, AbstractAccountEntity.getSchema());
    });

    it("validates type property", () => {
      assertEntityProperty.string(StubAbstractAccountEntity, "type");
      assertEntityProperty.notRequired(StubAbstractAccountEntity, "type");
    });

    it("validates domain property", () => {
      assertEntityProperty.string(StubAbstractAccountEntity, "domain");
      assertEntityProperty.notRequired(StubAbstractAccountEntity, "domain");
    });

    it("validates user_id property", () => {
      assertEntityProperty.string(StubAbstractAccountEntity, "user_id");
      assertEntityProperty.uuid(StubAbstractAccountEntity, "user_id");
      assertEntityProperty.notRequired(StubAbstractAccountEntity, "user_id");
    });

    it("validates user_key_fingerprint property", () => {
      const successScenario = [
        {scenario: "a valid fingerprint", value: "ABCD".repeat(10)},
      ];

      const failingScenario = [
        {scenario: "non hexadecimal fingerprint character set", value: "GHIJ".repeat(10)},
        {scenario: "wrong fingerprint character case set", value: "abcd".repeat(10)},
      ];

      assertEntityProperty.string(StubAbstractAccountEntity, "user_key_fingerprint");
      assertEntityProperty.minLength(StubAbstractAccountEntity, "user_key_fingerprint", 40);
      assertEntityProperty.maxLength(StubAbstractAccountEntity, "user_key_fingerprint", 40);
      assertEntityProperty.assert(StubAbstractAccountEntity, "user_key_fingerprint", successScenario, failingScenario, "pattern");
      assertEntityProperty.notRequired(StubAbstractAccountEntity, "user_key_fingerprint");
    });

    it("validates user_public_armored_key property", () => {
      assertEntityProperty.string(StubAbstractAccountEntity, "user_public_armored_key");
      assertEntityProperty.notRequired(StubAbstractAccountEntity, "user_public_armored_key");
    });

    it("validates user_private_armored_key property", () => {
      assertEntityProperty.string(StubAbstractAccountEntity, "user_private_armored_key");
      assertEntityProperty.notRequired(StubAbstractAccountEntity, "user_private_armored_key");
    });

    it("validates server_public_armored_key property", () => {
      assertEntityProperty.string(StubAbstractAccountEntity, "server_public_armored_key");
      assertEntityProperty.notRequired(StubAbstractAccountEntity, "server_public_armored_key");
    });

    it("validates username property", () => {
      assertEntityProperty.string(StubAbstractAccountEntity, "username");
      assertEntityProperty.email(StubAbstractAccountEntity, "username");
      //@todo: add custom email validation
      assertEntityProperty.notRequired(StubAbstractAccountEntity, "username");
    });

    it("validates first_name property", () => {
      assertEntityProperty.string(StubAbstractAccountEntity, "first_name");
      assertEntityProperty.minLength(StubAbstractAccountEntity, "first_name", 1);
      assertEntityProperty.maxLength(StubAbstractAccountEntity, "first_name", 255);
    });

    it("validates last_name property", () => {
      assertEntityProperty.string(StubAbstractAccountEntity, "last_name");
      assertEntityProperty.minLength(StubAbstractAccountEntity, "last_name", 1);
      assertEntityProperty.maxLength(StubAbstractAccountEntity, "last_name", 255);
    });

    it("validates locale property", () => {
      assertEntityProperty.nullable(StubAbstractAccountEntity, "locale");
      assertEntityProperty.locale(StubAbstractAccountEntity, "locale");
      assertEntityProperty.notRequired(StubAbstractAccountEntity, "locale");
    });

    it("validates security_token property", () => {
      const securityTokenGenerator = ({code = "Abc", color = "#abcdef", textcolor = "#abcdef"} = {}) => ({code, color, textcolor});

      const successScenario = [
        {scenario: "a valid security token", value: securityTokenGenerator()},
      ];

      const failingScenarios = [
        assertEntityProperty.SCENARIO_STRING,
        assertEntityProperty.SCENARIO_INTEGER,
        assertEntityProperty.SCENARIO_OBJECT,
        assertEntityProperty.SCENARIO_ARRAY,
        assertEntityProperty.SCENARIO_TRUE,
        {scenario: "an invalid security token code", value: securityTokenGenerator({code: ";;;"})},
        {scenario: "an invalid security token color", value: securityTokenGenerator({color: "redish"})},
        {scenario: "an invalid security token textcolor", value: securityTokenGenerator({textcolor: "greenish"})},
      ];

      assertEntityProperty.association(StubAbstractAccountEntity, "security_token", successScenario, failingScenarios);
    });
  });

  describe("AbstractAccountEntity::constructor", () => {
    it("constructor works if a valid minimal DTO is provided", () => {
      expect.assertions(1);
      const minimumDto = {};
      const entity = new StubAbstractAccountEntity(minimumDto);
      expect(entity.toDto()).toEqual(minimumDto);
    });

    it("constructor works if a valid complete DTO is provided", () => {
      expect.assertions(1);
      const dto = defaultAbstractAccountDto();
      const entity = new StubAbstractAccountEntity(dto);

      const expectedDto = JSON.parse(JSON.stringify(dto));
      delete expectedDto.security_token;

      expect(entity.toDto()).toEqual(expectedDto);
    });
  });
});
