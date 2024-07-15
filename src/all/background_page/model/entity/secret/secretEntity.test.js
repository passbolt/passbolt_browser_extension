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
 * @since         2.13.0
 */
import SecretEntity from "./secretEntity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import * as assertEntityProperty from "passbolt-styleguide/test/assert/assertEntityProperty";
import {minimalDto, readSecret} from "./secretEntity.test.data";
import {SCENARIO_EMPTY} from "passbolt-styleguide/test/assert/assertEntityProperty";

describe("SecretEntity", () => {
  describe("SecretEntity::getSchema", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(SecretEntity.ENTITY_NAME, SecretEntity.getSchema());
    });

    it("validates id property", () => {
      assertEntityProperty.string(SecretEntity, "id");
      assertEntityProperty.uuid(SecretEntity, "id");
      assertEntityProperty.notRequired(SecretEntity, "id");
    });

    it("validates user_id property", () => {
      assertEntityProperty.string(SecretEntity, "user_id");
      assertEntityProperty.uuid(SecretEntity, "user_id");
      assertEntityProperty.notRequired(SecretEntity, "user_id");
    });

    it("validates resource_id property", () => {
      assertEntityProperty.string(SecretEntity, "resource_id");
      assertEntityProperty.uuid(SecretEntity, "resource_id");
      assertEntityProperty.notRequired(SecretEntity, "resource_id");
    });

    it("validates data property", () => {
      assertEntityProperty.string(SecretEntity, "data");
      // @todo the following empty, begin & end rules are not valid json schema valid.
      assertEntityProperty.assert(SecretEntity, "data", [], [SCENARIO_EMPTY], "empty");
      const failBeginScenario = [{scenario: "begin", value: " -----END PGP MESSAGE-----"}];
      assertEntityProperty.assert(SecretEntity, "data", [], failBeginScenario, "begin");
      const failEndScenario = [{scenario: "end", value: "-----BEGIN PGP MESSAGE----- "}];
      assertEntityProperty.assert(SecretEntity, "data", [], failEndScenario, "end");
      assertEntityProperty.required(SecretEntity, "data");
    });

    it("validates created property", () => {
      assertEntityProperty.string(SecretEntity, "created");
      assertEntityProperty.dateTime(SecretEntity, "created");
      assertEntityProperty.notRequired(SecretEntity, "created");
    });

    it("validates modified property", () => {
      assertEntityProperty.string(SecretEntity, "modified");
      assertEntityProperty.dateTime(SecretEntity, "modified");
      assertEntityProperty.notRequired(SecretEntity, "modified");
    });
  });

  describe("SecretEntity::constructor", () => {
    it("constructor works if valid minimal DTO is provided", () => {
      const dto =  minimalDto();
      const entity = new SecretEntity(dto);
      expect(entity.toDto()).toEqual(dto);
      expect(entity.id).toBeNull();
      expect(entity.data).toEqual(dto.data);
      expect(entity.userId).toBeNull();
      expect(entity.resourceId).toBeNull();
      expect(entity.created).toBeNull();
      expect(entity.modified).toBeNull();
    });

    it("constructor works if valid complete DTO is provided", () => {
      const dto = readSecret();
      const entity = new SecretEntity(dto);
      expect(entity.toDto()).toEqual(dto);
      expect(entity.id).toEqual(dto.id);
      expect(entity.data).toEqual(dto.data);
      expect(entity.userId).toEqual(dto.user_id);
      expect(entity.resourceId).toEqual(dto.resource_id);
      expect(entity.created).toEqual(dto.created);
      expect(entity.modified).toEqual(dto.modified);
    });
  });
});

