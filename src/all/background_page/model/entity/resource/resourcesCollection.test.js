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
import {ResourcesCollection} from "./resourcesCollection";
import {TagEntity} from "../tag/tagEntity";
import {EntityCollectionError} from "../abstract/entityCollectionError";
import {EntitySchema} from "../abstract/entitySchema";
import Validator from 'validator';

// Reset the modules before each resource1.
beforeEach(() => {
  window.Validator = Validator;
  jest.resetModules();
});

describe("Resource entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(ResourcesCollection.ENTITY_NAME, ResourcesCollection.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    const resource1 = {
      "id": "10801423-4151-42a4-99d1-86e66145a08c",
      "name": "resource1",
      "username": "",
      "uri": "",
      "description": "",
      "deleted": false,
      "created": "2020-05-04T20:31:45+00:00",
      "modified": "2020-05-04T20:31:45+00:00",
      "created_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
      "modified_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
      "folder_parent_id": "e2172205-139c-4e4b-a03a-933528123fff"
    };
    const resource2 = {
      "id": "692af28a-58eb-4306-aab7-ab284b6141b3",
      "name": "resource2",
      "username": "",
      "uri": "",
      "description": "",
      "deleted": false,
      "created": "2020-05-08T10:03:11+00:00",
      "modified": "2020-05-08T10:03:11+00:00",
      "created_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
      "modified_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
      "folder_parent_id": null
    };
    const dto = [resource1, resource2];
    const entity = new ResourcesCollection(dto);
    expect(entity.toDto()).toEqual(dto);
    expect(JSON.stringify(entity)).toEqual(JSON.stringify(dto));
    expect(entity.items[0].name).toEqual('resource1');
    expect(entity.items[1].name).toEqual('resource2');
    expect(entity.folderParentIds).toEqual(['e2172205-139c-4e4b-a03a-933528123fff']);
  });

  it("constructor fails if reusing same resource", () => {
    const resource1 = {
      "id": "692af28a-58eb-4306-aab7-ab284b6141b3",
      "name": "resource1",
      "username": "",
      "uri": "",
      "description": "",
      "deleted": false,
      "created": "2020-05-08T10:03:11+00:00",
      "modified": "2020-05-08T10:03:11+00:00",
      "created_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
      "modified_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
      "folder_parent_id": null
    };
    const dto = [resource1, resource1];

    let t = () => {new ResourcesCollection(dto)};
    expect(t).toThrow(EntityCollectionError);
  });

  it("constructor fails if reusing same id", () => {
    const resource1 = {
      "id": "10801423-4151-42a4-99d1-86e66145a08c",
      "name": "resource1",
      "username": "",
      "uri": "",
      "description": "",
      "deleted": false,
      "created": "2020-05-04T20:31:45+00:00",
      "modified": "2020-05-04T20:31:45+00:00",
      "created_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
      "modified_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
      "folder_parent_id": "e2172205-139c-4e4b-a03a-933528123fff"
    };
    const resource2 = {
      "id": "10801423-4151-42a4-99d1-86e66145a08c",
      "name": "resource2",
      "username": "",
      "uri": "",
      "description": "",
      "deleted": false,
      "created": "2020-05-04T20:31:45+00:00",
      "modified": "2020-05-04T20:31:45+00:00",
      "created_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
      "modified_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
      "folder_parent_id": "e2172205-139c-4e4b-a03a-933528123fff"
    };
    const dto = [resource1, resource2];

    let t = () => {new ResourcesCollection(dto)};
    expect(t).toThrow(EntityCollectionError);
  });

  it("constructor works with empty collection", () => {
    const collection = new ResourcesCollection([]);
    expect(collection.folderParentIds).toEqual([]);
  });

  it("removeTagById works", () => {
    const tag1 = {
      "id": "45ce85c9-e301-4de2-8b41-298507002861",
      "is_shared": false,
      "slug": 'tag1'
    };
    const tag2 = {
      "id": "45ce85c9-e301-4de2-8b41-298507002862",
      "is_shared": false,
      "slug": 'tag2'
    }
    const dto = [{
      "name": "resource1",
      "tags": [tag1, tag2]
    },{
      "name": "resource2",
      "tags": [tag1]
    },{
      "name": "resource3",
      "tags": [tag2]
    },{
      "name": "resource4"
    }];
    const resourcesCollection = new ResourcesCollection(dto);

    // remove existing tag
    expect(resourcesCollection.removeTagById('45ce85c9-e301-4de2-8b41-298507002861')).toBe(true);
    expect(resourcesCollection.resources[0].tags.toDto()).toEqual([tag2]);
    expect(resourcesCollection.resources[1].tags.toDto()).toEqual([]);
    expect(resourcesCollection.resources[2].tags.toDto()).toEqual([tag2]);
    expect(resourcesCollection.resources[3].tags).toBeNull();

    // try to remove non existing tag
    expect(resourcesCollection.removeTagById('45ce85c9-e301-4de2-8b41-298507002863')).toBe(false);
    expect(resourcesCollection.resources[0].tags.toDto()).toEqual([tag2]);
    expect(resourcesCollection.resources[1].tags.toDto()).toEqual([]);
    expect(resourcesCollection.resources[2].tags.toDto()).toEqual([tag2]);
    expect(resourcesCollection.resources[3].tags).toBeNull();
  });

  it("update tag works", () => {
    const tag1 = {
      "id": "45ce85c9-e301-4de2-8b41-298507002861",
      "is_shared": false,
      "slug": 'tag1'
    };
    const updatedTag1 = {
      "id": "45ce85c9-e301-4de2-8b41-298507002861",
      "is_shared": false,
      "slug": 'updated_tag1'
    };
    const tag2 = {
      "id": "45ce85c9-e301-4de2-8b41-298507002862",
      "is_shared": false,
      "slug": 'tag2'
    }
    const tag3 = {
      "id": "45ce85c9-e301-4de2-8b41-298507002863",
      "is_shared": false,
      "slug": 'tag3'
    };
    const dto = [{
      "name": "resource1",
      "tags": [tag1, tag2]
    },{
      "name": "resource2",
      "tags": [tag1]
    },{
      "name": "resource3",
      "tags": [tag2]
    },{
      "name": "resource4"
    }];
    const resourcesCollection = new ResourcesCollection(dto);

    // Try to update existing tag
    expect(resourcesCollection.replaceTag(updatedTag1.id, new TagEntity(updatedTag1))).toBe(true);
    expect(resourcesCollection.resources[0].tags.toDto()).toEqual([updatedTag1, tag2]);
    expect(resourcesCollection.resources[1].tags.toDto()).toEqual([updatedTag1]);
    expect(resourcesCollection.resources[2].tags.toDto()).toEqual([tag2]);
    expect(resourcesCollection.resources[3].tags).toBeNull();

    // Try to update non existing tag
    expect(resourcesCollection.replaceTag(tag3.id, new TagEntity(tag3))).toBe(false);
    expect(resourcesCollection.resources[0].tags.toDto()).toEqual([updatedTag1, tag2]);
    expect(resourcesCollection.resources[1].tags.toDto()).toEqual([updatedTag1]);
    expect(resourcesCollection.resources[2].tags.toDto()).toEqual([tag2]);
    expect(resourcesCollection.resources[3].tags).toBeNull();
  });

});
