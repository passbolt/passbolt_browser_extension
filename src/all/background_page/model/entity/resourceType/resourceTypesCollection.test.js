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
 * @since         4.1.0
 */
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import ResourceTypeEntity from "./resourceTypeEntity";
import ResourceTypesCollection from "./resourceTypesCollection";
import EntityCollectionError from "passbolt-styleguide/src/shared/models/entity/abstract/entityCollectionError";

describe("Resource Types Collection", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(ResourceTypesCollection.ENTITY_NAME, ResourceTypesCollection.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    const dto = {
      "id": "a58de6d3-f52c-5080-b79b-a601a647ac85",
      "name": "test resource type",
      "slug": "password-string"
    };
    const dto2 = {
      "id": "b58de6d3-f52c-5080-b79b-a601a647ac85",
      "name": "test resource type",
      "slug": "password-and-description"
    };
    const entity = new ResourceTypeEntity(dto);
    const entity2 = new ResourceTypeEntity(dto2);
    const resourceTypesCollection = new ResourceTypesCollection([entity, entity2]);
    expect(resourceTypesCollection.toDto()).toEqual([dto, dto2]);
  });

  it("constructor works if valid DTO is provided with optional and non supported fields", () => {
    const dto = {
      "id": "a58de6d3-f52c-5080-b79b-a601a647ac85",
      "name": "test resource type",
      "slug": "password-string",
      "description": "A test resource type",
      "created": "2012-07-04T13:39:25+00:00",
      "modified": "2012-07-04T13:39:25+00:00",
      "_nope": 'nope'
    };
    const dto2 = {
      "id": "b58de6d3-f52c-5080-b79b-a601a647ac85",
      "name": "test resource type 2",
      "slug": "password-and-description",
      "description": "A test resource type 2",
      "created": "2012-07-04T13:39:25+00:00",
      "modified": "2012-07-04T13:39:25+00:00",
      "_nope": 'nope'
    };
    const filtered = {
      "id": "a58de6d3-f52c-5080-b79b-a601a647ac85",
      "name": "test resource type",
      "slug": "password-string",
      "description": "A test resource type",
      "created": "2012-07-04T13:39:25+00:00",
      "modified": "2012-07-04T13:39:25+00:00",
    };
    const filtered2 = {
      "id": "b58de6d3-f52c-5080-b79b-a601a647ac85",
      "name": "test resource type 2",
      "slug": "password-and-description",
      "description": "A test resource type 2",
      "created": "2012-07-04T13:39:25+00:00",
      "modified": "2012-07-04T13:39:25+00:00",
    };
    const entity = new ResourceTypeEntity(dto);
    const entity2 = new ResourceTypeEntity(dto2);
    const resourceTypesCollection = new ResourceTypesCollection([entity, entity2]);
    expect(resourceTypesCollection.toDto()).toEqual([filtered, filtered2]);
  });

  it("constructor fails if reusing same resource", () => {
    const entity = new ResourceTypeEntity({'id': '7f077753-0835-4054-92ee-556660ea04f1', 'slug': 'password-and-description', 'name': 'test'});
    const t = () => new ResourceTypesCollection([entity, entity]);
    expect(t).toThrow(EntityCollectionError);
  });

  it("constructor should be empty if no resource types are supported", () => {
    const entity = new ResourceTypeEntity({'id': '7f077753-0835-4054-92ee-556660ea04f1', 'slug': 'test-resource-type', 'name': 'test'});
    const entity2 = new ResourceTypeEntity({'id': 'af077753-0835-4054-92ee-556660ea04f1', 'slug': 'test-resource-type 2', 'name': 'test2'});
    const resourceTypesCollection = new ResourceTypesCollection([entity, entity2]);
    expect(resourceTypesCollection.length).toStrictEqual(0);
  });

  it("Check if resource type id is present or not in the collection", () => {
    const dto = {
      "id": "a58de6d3-f52c-5080-b79b-a601a647ac85",
      "name": "password string",
      "slug": "password-string"
    };
    const dto2 = {
      "id": "b58de6d3-f52c-5080-b79b-a601a647ac85",
      "name": "password and description",
      "slug": "password-and-description"
    };
    const dto3 = {
      "id": '7f077753-0835-4054-92ee-556660ea04f1',
      "name": "test resource type",
      "slug": 'test-resource-type'
    };
    const entity = new ResourceTypeEntity(dto);
    const entity2 = new ResourceTypeEntity(dto2);
    const entity3 = new ResourceTypeEntity(dto3);
    const resourceTypesCollection = new ResourceTypesCollection([entity, entity2, entity3]);
    expect(resourceTypesCollection.isResourceTypeIdPresent("7f077753-0835-4054-92ee-556660ea04f1")).toBeFalsy();
    expect(resourceTypesCollection.isResourceTypeIdPresent("af077753-0835-4054-92ee-556660ea04f1")).toBeFalsy();
    expect(resourceTypesCollection.isResourceTypeIdPresent("a58de6d3-f52c-5080-b79b-a601a647ac85")).toBeTruthy();
    expect(resourceTypesCollection.isResourceTypeIdPresent("b58de6d3-f52c-5080-b79b-a601a647ac85")).toBeTruthy();
  });

  it("Resource type id present in the collection", () => {
    const dto = {
      "id": "a58de6d3-f52c-5080-b79b-a601a647ac85",
      "name": "test resource type",
      "slug": "password-string"
    };
    const dto2 = {
      "id": "b58de6d3-f52c-5080-b79b-a601a647ac85",
      "name": "test resource type",
      "slug": "password-and-description"
    };
    const entity = new ResourceTypeEntity(dto);
    const entity2 = new ResourceTypeEntity(dto2);
    const resourceTypesCollection = new ResourceTypesCollection([entity, entity2]);
    expect(resourceTypesCollection.isResourceTypeIdPresent("a58de6d3-f52c-5080-b79b-a601a647ac85")).toBeTruthy();
    expect(resourceTypesCollection.isResourceTypeIdPresent("b58de6d3-f52c-5080-b79b-a601a647ac85")).toBeTruthy();
  });
});
