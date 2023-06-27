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
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import ResourceTypeEntity from "./resourceTypeEntity";

describe("Resource Type entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(ResourceTypeEntity.ENTITY_NAME, ResourceTypeEntity.getSchema());
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

  it("constructor returns validation error if dto required fields are missing", () => {
    let t = () => { new ResourceTypeEntity({'id': '7f077753-0835-4054-92ee-556660ea04f1', 'slug': 'test'}); };
    expect(t).toThrow(EntityValidationError);
    t = () => { new ResourceTypeEntity({'id': '7f077753-0835-4054-92ee-556660ea04f1', 'name': 'test'}); };
    expect(t).toThrow(EntityValidationError);
    t = () => { new ResourceTypeEntity({'name': 'test', 'slug': 'test'}); };
    expect(t).toThrow(EntityValidationError);
  });

  it("constructor returns validation error if dto fields are invalid", () => {
    let t = () => { new ResourceTypeEntity({'id': 'nope', 'name': 'test', 'slug': 'test'}); };
    expect(t).toThrow(EntityValidationError);
    t = () => { new ResourceTypeEntity({'id': 'nope', 'name': Array(255).join("a"), 'slug': 'test'}); };
    expect(t).toThrow(EntityValidationError);
    t = () => { new ResourceTypeEntity({'id': '7f077753-0835-4054-92ee-556660ea04f1', 'name': 'test', 'slug': 'test', 'description': Array(257).join("a")}); };
    expect(t).toThrow(EntityValidationError);
  });
});
