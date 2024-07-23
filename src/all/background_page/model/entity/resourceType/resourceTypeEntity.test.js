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
 * @since         3.0.0
 */
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import ResourceTypeEntity from "./resourceTypeEntity";
import * as assertEntityProperty from "passbolt-styleguide/test/assert/assertEntityProperty";

describe("Resource Type entity", () => {
  describe("ResourceTypeEntity::getSchema", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(ResourceTypeEntity.ENTITY_NAME, ResourceTypeEntity.getSchema());
    });

    it("validates id property", () => {
      assertEntityProperty.uuid(ResourceTypeEntity, "id");
      assertEntityProperty.required(ResourceTypeEntity, "id");
    });

    it("validates name property", () => {
      assertEntityProperty.string(ResourceTypeEntity, "name");
      assertEntityProperty.minLength(ResourceTypeEntity, "name", 1);
      assertEntityProperty.maxLength(ResourceTypeEntity, "name", 255);
      assertEntityProperty.required(ResourceTypeEntity, "name");
    });

    it("validates slug property", () => {
      assertEntityProperty.string(ResourceTypeEntity, "slug");
      assertEntityProperty.minLength(ResourceTypeEntity, "slug", 1);
      assertEntityProperty.maxLength(ResourceTypeEntity, "slug", 64);
      assertEntityProperty.required(ResourceTypeEntity, "slug");
    });

    it("validates definition property", () => {
      const successScenarios = [assertEntityProperty.SCENARIO_OBJECT];
      /*
       * @todo: //add failing scenarios when nested object will be checked
       */
      const failingScenarios = [];

      assertEntityProperty.assert(ResourceTypeEntity, "definition", successScenarios, failingScenarios, "type");
      assertEntityProperty.notRequired(ResourceTypeEntity, "definition");
    });

    it("validates description property", () => {
      const successScenarios = [
        ...assertEntityProperty.SUCCESS_STRING_SCENARIOS,
        assertEntityProperty.SCENARIO_NULL,
      ];
      const failingScenarios = [
        ...assertEntityProperty.FAIL_STRING_SCENARIOS,
      ];

      assertEntityProperty.assert(ResourceTypeEntity, "description", successScenarios, failingScenarios, "type");
      assertEntityProperty.notRequired(ResourceTypeEntity, "description");
    });
  });

  it("constructor works if valid minimal DTO is provided", () => {
    const dto = {
      "id": "a58de6d3-f52c-5080-b79b-a601a647ac85",
      "name": "test resource type",
      "slug": "test-resource-type"
    };
    const entity = new ResourceTypeEntity(dto);
    expect(entity.toDto()).toEqual(dto);
  });

  it("constructor works if valid minimal DTO is provided with optional and non supported fields", () => {
    const dto = {
      "id": "a58de6d3-f52c-5080-b79b-a601a647ac85",
      "name": "test resource type",
      "slug": "test-resource-type",
      "description": "A test resource type",
      "created": "2012-07-04T13:39:25+00:00",
      "modified": "2012-07-04T13:39:25+00:00",
      "_nope": 'nope'
    };
    const filtered = {
      "id": "a58de6d3-f52c-5080-b79b-a601a647ac85",
      "name": "test resource type",
      "slug": "test-resource-type",
      "description": "A test resource type",
      "created": "2012-07-04T13:39:25+00:00",
      "modified": "2012-07-04T13:39:25+00:00",
    };
    const resourceTypeEntity = new ResourceTypeEntity(dto);
    expect(resourceTypeEntity.toDto()).toEqual(filtered);
  });
});
