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
import {defaultResourcesDtos, resourceAllTypesDtosCollection} from "./resourcesCollection.test.data";
import ResourceTypesCollection from "../resourceType/resourceTypesCollection";
import {
  resourceTypesCollectionDto
} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection.test.data";
import {defaultResourceDto} from "passbolt-styleguide/src/shared/models/entity/resource/resourceEntity.test.data";
import ResourceEntity from "./resourceEntity";
import resourcesCollection from "./resourcesCollection";
import {defaultTagDto} from "../tag/tagEntity.test.data";
import expect from "expect";

describe("ResourcesCollection", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(ResourcesCollection.ENTITY_NAME, ResourcesCollection.getSchema());
  });

  describe("::constructor", () => {
    it("works with empty data", () => {
      expect.assertions(1);
      const collection = new ResourcesCollection([]);
      expect(collection).toHaveLength(0);
    });

    it("works if valid minimal DTO is provided", () => {
      expect.assertions(5);
      const dto1 = {"name": "resource1"};
      const dto2 = {"name": "resource2"};
      const dtos = [dto1, dto2];
      const collection = new ResourcesCollection(dtos);
      expect(collection.toDto()).toEqual(dtos);
      expect(JSON.stringify(collection)).toEqual(JSON.stringify(dtos));
      expect(collection).toHaveLength(2);
      expect(collection.items[0].name).toEqual('resource1');
      expect(collection.items[1].name).toEqual('resource2');
    });

    it("works if valid complete DTOs are provided", () => {
      expect.assertions(4);
      const dto1 = defaultResourceDto({"name": "resource1"});
      const dto2 = defaultResourceDto({"name": "resource2"});
      const dtos = [dto1, dto2];
      const collection = new ResourcesCollection(dtos);
      expect(collection).toHaveLength(2);
      expect(collection.toDto()).toEqual(dtos);
      expect(collection.items[0].id).toEqual(dto1.id);
      expect(collection.items[1].id).toEqual(dto2.id);
    });

    it("works if valid complete entities are provided", () => {
      expect.assertions(3);
      const entity1 = new ResourceEntity(defaultResourceDto());
      const entity2 = new ResourceEntity(defaultResourceDto());
      const dtos = [entity1, entity2];
      const collection = new ResourcesCollection(dtos);
      expect(collection).toHaveLength(2);
      expect(collection.items[0].id).toEqual(entity1.id);
      expect(collection.items[1].id).toEqual(entity2.id);
    });

    it("should throw if one of data item does not validate the collection entity schema", () => {
      const dto1 = defaultResourceDto();
      const dto2 = defaultResourceDto({id: 42});

      expect.assertions(2);
      // Prior to migrating to collection V2 the returned error does not precise the path of the error.
      expect(() => new ResourcesCollection([dto1, dto2]))
        .not.toThrowCollectionValidationError("1.id.type");
      expect(() => new ResourcesCollection([dto1, dto2]))
        .toThrowCollectionValidationError("id.type");
    });

    it("should throw if one of data item does not validate the unique id build rule", () => {
      const dto1 = defaultResourceDto();
      const dto2 = defaultResourceDto({id: dto1.id});

      expect.assertions(2);
      expect(() => new ResourcesCollection([dto1, dto2]))
        .not.toThrowCollectionValidationError("1.id.unique");
      expect(() => new ResourcesCollection([dto1, dto2]))
        .toThrowError(new EntityCollectionError(1, resourcesCollection.RULE_UNIQUE_ID, `Resource id ${dto2.id} already exists.`));
    });
  });

  describe(":pushMany", () => {
    it("[performance] should ensure performance adding large dataset remains effective.", async() => {
      const count = 10_000;
      const options = {withCreator: true, withModifier: true, withPermissions: 10, withFavorite: true};
      const dtos = defaultResourcesDtos(count, {}, options);

      const start = performance.now();
      const collection = new ResourcesCollection(dtos);
      const time = performance.now() - start;
      expect(collection).toHaveLength(count);
      expect(time).toBeLessThan(5_000);
    });
  });

  describe("::removeTagById", () => {
    it("removeTagById works", () => {
      const tagDto1 = defaultTagDto({slug: "tag 1"});
      const tagDto2 = defaultTagDto({slug: "tag 2"});
      const resourceDto1 = defaultResourceDto({tags: [tagDto1, tagDto2]});
      const resourceDto2 = defaultResourceDto({tags: [tagDto1]});
      const resourceDto3 = defaultResourceDto({tags: [tagDto2]});
      const resourceDto4 = defaultResourceDto();
      const dtos = [resourceDto1, resourceDto2, resourceDto3, resourceDto4];
      const resourcesCollection = new ResourcesCollection(dtos);

      // remove existing tag
      expect(resourcesCollection.removeTagById(tagDto1.id)).toBe(true);
      expect(resourcesCollection.resources[0].tags.toDto()).toEqual([tagDto2]);
      expect(resourcesCollection.resources[1].tags.toDto()).toEqual([]);
      expect(resourcesCollection.resources[2].tags.toDto()).toEqual([tagDto2]);
      expect(resourcesCollection.resources[3].tags).toBeNull();

      // try to remove non existing tag
      expect(resourcesCollection.removeTagById(crypto.randomUUID())).toBe(false);
      expect(resourcesCollection.resources[0].tags.toDto()).toEqual([tagDto2]);
      expect(resourcesCollection.resources[1].tags.toDto()).toEqual([]);
      expect(resourcesCollection.resources[2].tags.toDto()).toEqual([tagDto2]);
      expect(resourcesCollection.resources[3].tags).toBeNull();
    });
  });

  describe("::replaceTag", () => {
    it("update tag works", () => {
      const tagDto1 = defaultTagDto({slug: "tag 1"});
      const updatedTagDto1 = defaultTagDto({id: tagDto1.id, slug: "updated tag 1"});
      const tagDto2 = defaultTagDto({slug: "tag 2"});
      const tagDto3 = defaultTagDto({slug: "tag 3"});
      const resourceDto1 = defaultResourceDto({tags: [tagDto1, tagDto2]});
      const resourceDto2 = defaultResourceDto({tags: [tagDto1]});
      const resourceDto3 = defaultResourceDto({tags: [tagDto2]});
      const resourceDto4 = defaultResourceDto();
      const dtos = [resourceDto1, resourceDto2, resourceDto3, resourceDto4];
      const resourcesCollection = new ResourcesCollection(dtos);

      // Try to update existing tag
      expect(resourcesCollection.replaceTag(tagDto1.id, new TagEntity(updatedTagDto1))).toBe(true);
      expect(resourcesCollection.resources[0].tags.toDto()).toEqual([updatedTagDto1, tagDto2]);
      expect(resourcesCollection.resources[1].tags.toDto()).toEqual([updatedTagDto1]);
      expect(resourcesCollection.resources[2].tags.toDto()).toEqual([tagDto2]);
      expect(resourcesCollection.resources[3].tags).toBeNull();

      // Try to update non existing tag
      expect(resourcesCollection.replaceTag(tagDto3.id, new TagEntity(tagDto3))).toBe(false);
      expect(resourcesCollection.resources[0].tags.toDto()).toEqual([updatedTagDto1, tagDto2]);
      expect(resourcesCollection.resources[1].tags.toDto()).toEqual([updatedTagDto1]);
      expect(resourcesCollection.resources[2].tags.toDto()).toEqual([tagDto2]);
      expect(resourcesCollection.resources[3].tags).toBeNull();
    });
  });

  describe("::bulkReplaceTagsCollection", () => {
    it("bulk replace tag works", () => {
      const tagDto1 = defaultTagDto({slug: "tag 1"});
      const tagDto2 = defaultTagDto({slug: "tag 2"});
      const tagDto3 = defaultTagDto({slug: "tag 3"});
      const resourceDto1 = defaultResourceDto({tags: [tagDto1, tagDto2]});
      const resourceDto2 = defaultResourceDto({tags: [tagDto1]});
      const resourceDto3 = defaultResourceDto({tags: [tagDto2]});
      const resourceDto4 = defaultResourceDto();
      const dtos = [resourceDto1, resourceDto2, resourceDto3, resourceDto4];
      const resourcesCollection = new ResourcesCollection(dtos);

      const tagsCollections = [];
      const resourceIds = [];

      // resource not in collection
      resourceIds.push(crypto.randomUUID());
      tagsCollections.push(new TagsCollection([tagDto1, tagDto3]));

      // resource tag not edited
      resourceIds.push(resourceDto1.id);
      tagsCollections.push(new TagsCollection([tagDto1, tagDto2]));

      // resource tags edited
      resourceIds.push(resourceDto2.id);
      tagsCollections.push(new TagsCollection([tagDto2, tagDto3]));

      // resource tags removed
      resourceIds.push(resourceDto3.id);
      tagsCollections.push(new TagsCollection([]));

      // resource tags added
      resourceIds.push(resourceDto4.id);
      tagsCollections.push(new TagsCollection([tagDto1]));

      const result = resourcesCollection.bulkReplaceTagsCollection(resourceIds, tagsCollections);

      expect(resourcesCollection.resources[0].tags.toDto()).toEqual([tagDto1, tagDto2]);
      expect(resourcesCollection.resources[1].tags.toDto()).toEqual([tagDto2, tagDto3]);
      expect(resourcesCollection.resources[2].tags.toDto()).toEqual([]);
      expect(resourcesCollection.resources[3].tags.toDto()).toEqual([tagDto1]);
      expect(result).toEqual(4);
    });
  });

  describe("::sanitizeDto", () => {
    it("sanitizeDto should remove duplicated resource ids", () => {
      const resourceDto1 = defaultResourceDto();
      const resourceDto2 = defaultResourceDto({id: resourceDto1.id});

      const santitizedDto = ResourcesCollection.sanitizeDto([resourceDto1, resourceDto2]);
      expect(santitizedDto).toHaveLength(1);
      expect(santitizedDto).toEqual(expect.arrayContaining([resourceDto1]));

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

  describe("::filterByResourceTypes", () => {
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

    it("should throw an exception if the resource types parameter is not a ResourceTypesCollection.", () => {
      const collection = new ResourcesCollection([]);
      expect.assertions(1);
      expect(() => collection.filterByResourceTypes(42)).toThrow(TypeError);
    });
  });

  describe("::filterBySuggestedResources", () => {
    it("should filter the collection by resources that could be suggested for a given url.", () => {
      const suggestedResource1 = defaultResourceDto({uri: "https://passbolt.com"});
      const suggestedResource2 = defaultResourceDto({uri: "passbolt.com"});
      const notSuggestedResource1 = defaultResourceDto({uri: "not-passbolt.com"});
      const notSuggestedResource2 = defaultResourceDto({uri: ""});
      const resources = new ResourcesCollection([
        suggestedResource1,
        suggestedResource2,
        notSuggestedResource1,
        notSuggestedResource2
      ]);
      resources.filterBySuggestResources("https://www.passbolt.com");
      expect.assertions(3);
      expect(resources).toHaveLength(2);
      expect(resources.getFirstById(suggestedResource1.id)).toBeTruthy();
      expect(resources.getFirstById(suggestedResource2.id)).toBeTruthy();
    });

    it("should filter all resources out if no resources could be suggested.", () => {
      const suggestedResource1 = defaultResourceDto({uri: "https://passbolt.com"});
      const suggestedResource2 = defaultResourceDto({uri: "passbolt.com"});
      const resources = new ResourcesCollection([
        suggestedResource1,
        suggestedResource2,
      ]);
      resources.filterBySuggestResources("https://www.not-passbolt.com");
      expect.assertions(1);
      expect(resources).toHaveLength(0);
    });

    it("should throw an exception if the url parameter is not a string.", () => {
      const collection = new ResourcesCollection([]);
      expect.assertions(1);
      expect(() => collection.filterBySuggestResources(42)).toThrow(TypeError);
    });
  });
});
