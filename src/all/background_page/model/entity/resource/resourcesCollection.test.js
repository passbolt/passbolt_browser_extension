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
import ResourcesCollection from "./resourcesCollection";
import TagEntity from "../tag/tagEntity";
import EntityCollectionError from "passbolt-styleguide/src/shared/models/entity/abstract/entityCollectionError";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import TagsCollection from "../tag/tagsCollection";
import {
  TEST_RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION,
  TEST_RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP,
  TEST_RESOURCE_TYPE_PASSWORD_STRING,
  TEST_RESOURCE_TYPE_TOTP
} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypeEntity.test.data";
import {resourceAllTypesDtosCollection} from "./resourcesCollection.test.data";
import ResourceTypesCollection from "../resourceType/resourceTypesCollection";
import {
  resourceTypesCollectionDto
} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection.test.data";


describe("Resources Collection", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(ResourcesCollection.ENTITY_NAME, ResourcesCollection.getSchema());
  });
  it("constructor works if valid minimal DTO is provided", () => {
    const resource1 = {
      "name": "resource1",
    };
    const resource2 = {
      "name": "resource2",
    };
    const dto = [resource1, resource2];
    const collection = new ResourcesCollection(dto);
    expect(collection.toDto()).toEqual(dto);
    expect(JSON.stringify(collection)).toEqual(JSON.stringify(dto));
    expect(collection.items[0].name).toEqual('resource1');
    expect(collection.items[1].name).toEqual('resource2');
  });

  it("constructor works if valid DTO is provided", () => {
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
      "name": "resource1"
    };
    const dto = [resource1, resource1];

    const t = () => {
      new ResourcesCollection(dto);
    };
    expect(t).toThrow(EntityCollectionError);
  });

  it("constructor fails if reusing same id", () => {
    const resource1 = {
      "id": "10801423-4151-42a4-99d1-86e66145a08c",
      "name": "resource1",
    };
    const resource2 = {
      "name": "resource2"
    };
    const resource3 = {
      "id": "10801423-4151-42a4-99d1-86e66145a08c",
      "name": "resource3",
    };
    const dto = [resource1, resource2, resource3];

    const t = () => {
      new ResourcesCollection(dto);
    };
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
    };
    const dto = [{
      "name": "resource1",
      "tags": [tag1, tag2]
    }, {
      "name": "resource2",
      "tags": [tag1]
    }, {
      "name": "resource3",
      "tags": [tag2]
    }, {
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
    };
    const tag3 = {
      "id": "45ce85c9-e301-4de2-8b41-298507002863",
      "is_shared": false,
      "slug": 'tag3'
    };
    const dto = [{
      "name": "resource1",
      "tags": [tag1, tag2]
    }, {
      "name": "resource2",
      "tags": [tag1]
    }, {
      "name": "resource3",
      "tags": [tag2]
    }, {
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

  it("bulk replace tag works", () => {
    const tag1 = {"id": "45ce85c9-e301-4de2-8b41-298507002861", "is_shared": false, "slug": 'tag1'};
    const tag2 = {"id": "45ce85c9-e301-4de2-8b41-298507002862", "is_shared": false, "slug": 'tag2'};
    const tag3 = {"id": "45ce85c9-e301-4de2-8b41-298507002863", "is_shared": false, "slug": 'tag3'};
    const dto = [{
      "id": "45ce85c9-e301-4de2-8b41-298507002851",
      "name": "resource1",
      "tags": [tag1, tag2]
    }, {
      "id": "45ce85c9-e301-4de2-8b41-298507002852",
      "name": "resource2",
      "tags": [tag1]
    }, {
      "id": "45ce85c9-e301-4de2-8b41-298507002853",
      "name": "resource3",
      "tags": [tag2]
    }, {
      "id": "45ce85c9-e301-4de2-8b41-298507002854",
      "name": "resource4"
    }];
    const resourcesCollection = new ResourcesCollection(dto);

    const tagsCollections = [];
    const resourceIds = [];

    // resource not in collection
    resourceIds.push("45ce85c9-e301-4de2-8b41-298507002850");
    tagsCollections.push(new TagsCollection([tag1, tag3]));

    // resource tag not edited
    resourceIds.push("45ce85c9-e301-4de2-8b41-298507002851");
    tagsCollections.push(new TagsCollection([tag1, tag2]));

    // resource tags edited
    resourceIds.push("45ce85c9-e301-4de2-8b41-298507002852");
    tagsCollections.push(new TagsCollection([tag2, tag3]));

    // resource tags removed
    resourceIds.push("45ce85c9-e301-4de2-8b41-298507002853");
    tagsCollections.push(new TagsCollection([]));

    // resource tags added
    resourceIds.push("45ce85c9-e301-4de2-8b41-298507002854");
    tagsCollections.push(new TagsCollection([tag1]));

    const result = resourcesCollection.bulkReplaceTagsCollection(resourceIds, tagsCollections);

    expect(resourcesCollection.resources[0].tags.toDto()).toEqual([tag1, tag2]);
    expect(resourcesCollection.resources[1].tags.toDto()).toEqual([tag2, tag3]);
    expect(resourcesCollection.resources[2].tags.toDto()).toEqual([]);
    expect(resourcesCollection.resources[3].tags.toDto()).toEqual([tag1]);
    expect(result).toEqual(4);
  });

  describe("sanitizeDto", () => {
    it("sanitizeDto should remove duplicated resource ids", () => {
      const resource1 = {
        "id": "10801423-4151-42a4-99d1-86e66145a08c",
        "name": "resource1",
      };
      const resource2 = {
        "id": "10801423-4151-42a4-99d1-86e66145a08c",
        "name": "resource1",
      };

      const santitizedDto = ResourcesCollection.sanitizeDto([resource1, resource2]);
      expect(santitizedDto).toHaveLength(1);
      expect(santitizedDto).toEqual(expect.arrayContaining([resource1]));

      const collection = new ResourcesCollection(santitizedDto);
      expect(collection).toHaveLength(1);
    });

    it("sanitizeDto should return an empty array if an unsupported type of data is given in parameter", () => {
      const santitizedDtos = ResourcesCollection.sanitizeDto("not-an-array");
      expect(santitizedDtos).toHaveLength(0);

      const collection = new ResourcesCollection(santitizedDtos);
      expect(collection).toHaveLength(0);
    });
  });

  describe("ResourceCollection::filterByResourceTypes", () => {
    it("should filter the collection by all supported resources types and keep all resources having a defined resource type.", () => {
      const resources = new ResourcesCollection(resourceAllTypesDtosCollection());
      const resourcesTypes = new ResourceTypesCollection(resourceTypesCollectionDto());
      resources.filterByResourceTypes(resourcesTypes);
      expect.assertions(6);
      expect(resources).toHaveLength(4);
      expect(resources.getFirst("resource_type_id", TEST_RESOURCE_TYPE_PASSWORD_STRING)).toBeTruthy();
      expect(resources.getFirst("resource_type_id", TEST_RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION)).toBeTruthy();
      expect(resources.getFirst("resource_type_id", TEST_RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP)).toBeTruthy();
      expect(resources.getFirst("resource_type_id", TEST_RESOURCE_TYPE_TOTP)).toBeTruthy();
      expect(resources.getFirst("name", "Resource password string legacy")).toBeFalsy();
    });

    it("with the option to keep resource with undefined resource type, it should filter the collection by all supported and not defined resources types.", () => {
      const resources = new ResourcesCollection(resourceAllTypesDtosCollection());
      const resourcesTypes = new ResourceTypesCollection(resourceTypesCollectionDto());
      resources.filterByResourceTypes(resourcesTypes, false);
      expect.assertions(6);
      expect(resources).toHaveLength(5);
      expect(resources.getFirst("resource_type_id", TEST_RESOURCE_TYPE_PASSWORD_STRING)).toBeTruthy();
      expect(resources.getFirst("resource_type_id", TEST_RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION)).toBeTruthy();
      expect(resources.getFirst("resource_type_id", TEST_RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP)).toBeTruthy();
      expect(resources.getFirst("resource_type_id", TEST_RESOURCE_TYPE_TOTP)).toBeTruthy();
      expect(resources.getFirst("name", "Resource password string legacy")).toBeTruthy();
    });

    it("should filter the collection by a subset of resource types and excludes resources without resource type.", () => {
      const resources = new ResourcesCollection(resourceAllTypesDtosCollection());
      const resourcesTypes = new ResourceTypesCollection(resourceTypesCollectionDto());
      resourcesTypes.filterByPasswordResourceTypes();
      resources.filterByResourceTypes(resourcesTypes);
      expect.assertions(6);
      expect(resources).toHaveLength(3);
      expect(resources.getFirst("resource_type_id", TEST_RESOURCE_TYPE_PASSWORD_STRING)).toBeTruthy();
      expect(resources.getFirst("resource_type_id", TEST_RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION)).toBeTruthy();
      expect(resources.getFirst("resource_type_id", TEST_RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP)).toBeTruthy();
      expect(resources.getFirst("resource_type_id", TEST_RESOURCE_TYPE_TOTP)).toBeFalsy();
      expect(resources.getFirst("name", "Resource password string legacy")).toBeFalsy();
    });

    it("should filter the collection by a subset of resource types and includes resources without resource type.", () => {
      const resources = new ResourcesCollection(resourceAllTypesDtosCollection());
      const resourcesTypes = new ResourceTypesCollection(resourceTypesCollectionDto());
      resourcesTypes.filterByPasswordResourceTypes();
      resources.filterByResourceTypes(resourcesTypes, false);
      expect.assertions(6);
      expect(resources).toHaveLength(4);
      expect(resources.getFirst("resource_type_id", TEST_RESOURCE_TYPE_PASSWORD_STRING)).toBeTruthy();
      expect(resources.getFirst("resource_type_id", TEST_RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION)).toBeTruthy();
      expect(resources.getFirst("resource_type_id", TEST_RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP)).toBeTruthy();
      expect(resources.getFirst("resource_type_id", TEST_RESOURCE_TYPE_TOTP)).toBeFalsy();
      expect(resources.getFirst("name", "Resource password string legacy")).toBeTruthy();
    });
  });
});
