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
import {v4 as uuidv4} from "uuid";
import ResourcesCollection from "./resourcesCollection";
import TagEntity from "../tag/tagEntity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import TagsCollection from "../tag/tagsCollection";
import {
  TEST_RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION,
  TEST_RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP,
  TEST_RESOURCE_TYPE_PASSWORD_STRING,
  TEST_RESOURCE_TYPE_TOTP,
} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypeEntity.test.data";
import {defaultResourceDtosCollection, defaultResourcesDtos, resourceAllTypesDtosCollection} from "passbolt-styleguide/src/shared/models/entity/resource/resourcesCollection.test.data";
import ResourceTypesCollection from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection";
import {
  resourceTypesCollectionDto,
} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection.test.data";
import {
  defaultResourceDto,
  defaultResourceV4Dto,
  resourceStandaloneTotpDto,
  resourceWithTotpDto
} from "passbolt-styleguide/src/shared/models/entity/resource/resourceEntity.test.data";
import ResourceEntity, {METADATA_KEY_TYPE_METADATA_KEY, METADATA_KEY_TYPE_USER_KEY} from "./resourceEntity";
import {defaultTagDto} from "../tag/tagEntity.test.data";
import expect from "expect";
import {
  ownerPermissionDto, readPermissionDto,
  updatePermissionDto
} from "passbolt-styleguide/src/shared/models/entity/permission/permissionEntity.test.data";
import {
  defaultResourceMetadataDto
} from "passbolt-styleguide/src/shared/models/entity/resource/metadata/resourceMetadataEntity.test.data";
import {metadata} from "passbolt-styleguide/test/fixture/encryptedMetadata/metadata";

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
      expect.assertions(4);
      const dto1 = {resource_type_id: TEST_RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION, metadata: {resource_type_id: TEST_RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION, "name": "resource1"}};
      const dto2 = {resource_type_id: TEST_RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION, metadata: {resource_type_id: TEST_RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION, "name": "resource2"}};
      const dtos = [dto1, dto2];
      const collection = new ResourcesCollection(dtos);
      expect(JSON.stringify(collection)).toEqual(JSON.stringify(dtos));
      expect(collection).toHaveLength(2);
      expect(collection.items[0].metadata.name).toEqual('resource1');
      expect(collection.items[1].metadata.name).toEqual('resource2');
    });

    it("works if valid complete DTOs are provided", () => {
      expect.assertions(3);
      const dto1 = defaultResourceDto({metadata: {resource_type_id: TEST_RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION, name: "resource1"}});
      const dto2 = defaultResourceDto({metadata: {resource_type_id: TEST_RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION, name: "resource2"}});
      const dtos = [dto1, dto2];
      const collection = new ResourcesCollection(dtos);
      expect(collection).toHaveLength(2);
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

    it("should throw if the collection schema does not validate", () => {
      expect.assertions(1);
      expect(() => new ResourcesCollection({}))
        .toThrowEntityValidationError("items");
    });

    it("should throw if one of data item does not validate the collection entity schema", () => {
      const dto1 = defaultResourceDto();
      const dto2 = defaultResourceDto({id: 42});

      expect.assertions(1);
      expect(() => new ResourcesCollection([dto1, dto2]))
        .toThrowCollectionValidationError("1.id.type");
    });

    it("should throw if one of data item does not validate the unique id build rule", () => {
      const dto1 = defaultResourceDto();
      const dto2 = defaultResourceDto({id: dto1.id});

      expect.assertions(1);
      expect(() => new ResourcesCollection([dto1, dto2]))
        .toThrowCollectionValidationError("1.id.unique");
    });

    it("should, with enabling the ignore invalid option, ignore items which do not validate their schema", () => {
      const dto1 = defaultResourceDto();
      const dto2 = defaultResourceDto({metadata: defaultResourceMetadataDto({username: 42})});

      expect.assertions(2);
      const collection = new ResourcesCollection([dto1, dto2], {ignoreInvalidEntity: true});
      expect(collection.items).toHaveLength(1);
      expect(collection.items[0].id).toEqual(dto1.id);
    });

    it("should, with enabling the ignore invalid option, ignore items which do not validate the unique id build rule", () => {
      const dto1 = defaultResourceDto({username: "user1@passbolt.com"});
      const dto2 = defaultResourceDto({id: dto1.id, username: "user2@passbolt.com"});

      expect.assertions(2);
      const collection = new ResourcesCollection([dto1, dto2], {ignoreInvalidEntity: true});
      expect(collection.items).toHaveLength(1);
      expect(collection.items[0].id).toEqual(dto1.id);
    });

    // @todo ignoreInvalidEntity option is not yet passed to associated entities and collections, therefore the parent entity is ignored.
    it.failing("should, with enabling the ignore invalid option, ignore items associated permissions entities which do not validate their entity schema validation", () => {
      const dto1 = defaultResourceDto({}, {withPermissions: true});
      const dto2 = defaultResourceDto({
        permissions: [
          ownerPermissionDto({aco_foreign_key: 42})
        ]
      });
      const dto3 = defaultResourceDto({}, {withPermissions: true});

      expect.assertions(1);
      const collection = new ResourcesCollection([dto1, dto2, dto3], {ignoreInvalidEntity: true});
      expect(collection.items).toHaveLength(3);
      expect(collection.items[0].id).toEqual(dto1.id);
      expect(collection.items[0]._permissions).toHaveLength(1);
      expect(collection.items[1].id).toEqual(dto2.id);
      expect(collection.items[1]._permissions).toHaveLength(0);
      expect(collection.items[2].id).toEqual(dto3.id);
      expect(collection.items[2]._permissions).toHaveLength(1);
    });
  });

  describe(":pushMany", () => {
    it("[performance] should ensure performance adding large dataset remains effective.", async() => {
      const count = 10_000;
      const options = {withCreator: true, withModifier: true, withPermissions: {count: 10}, withFavorite: true};
      const dtos = defaultResourcesDtos(count, {}, options);

      const start = performance.now();
      const collection = new ResourcesCollection(dtos);
      const time = performance.now() - start;
      expect(collection).toHaveLength(count);
      expect(time).toBeLessThan(10_000);
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

  describe("::filterByResourceTypes", () => {
    it("should filter the collection by all supported resources types and keep all resources having a defined resource type.", () => {
      const resources = new ResourcesCollection(resourceAllTypesDtosCollection());
      const resourcesTypes = new ResourceTypesCollection(resourceTypesCollectionDto());
      resources.filterByResourceTypes(resourcesTypes);
      expect.assertions(5);
      expect(resources).toHaveLength(4);
      expect(resources.getFirst("resource_type_id", TEST_RESOURCE_TYPE_PASSWORD_STRING)).toBeTruthy();
      expect(resources.getFirst("resource_type_id", TEST_RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION)).toBeTruthy();
      expect(resources.getFirst("resource_type_id", TEST_RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP)).toBeTruthy();
      expect(resources.getFirst("resource_type_id", TEST_RESOURCE_TYPE_TOTP)).toBeTruthy();
    });

    it("should filter the collection by a subset of resource types and excludes resources without resource type.", () => {
      const resources = new ResourcesCollection(resourceAllTypesDtosCollection());
      const resourcesTypes = new ResourceTypesCollection(resourceTypesCollectionDto());
      resourcesTypes.filterByPasswordResourceTypes();
      resources.filterByResourceTypes(resourcesTypes);
      expect.assertions(5);
      expect(resources).toHaveLength(3);
      expect(resources.getFirst("resource_type_id", TEST_RESOURCE_TYPE_PASSWORD_STRING)).toBeTruthy();
      expect(resources.getFirst("resource_type_id", TEST_RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION)).toBeTruthy();
      expect(resources.getFirst("resource_type_id", TEST_RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP)).toBeTruthy();
      expect(resources.getFirst("resource_type_id", TEST_RESOURCE_TYPE_TOTP)).toBeFalsy();
    });

    it("should throw an exception if the resource types parameter is not a ResourceTypesCollection.", () => {
      const collection = new ResourcesCollection([]);
      expect.assertions(1);
      expect(() => collection.filterByResourceTypes(42)).toThrow(TypeError);
    });
  });

  describe("::filterBySuggestedResources", () => {
    it("should filter the collection by resources that could be suggested for a given url.", () => {
      const suggestedResource1 = defaultResourceDto({metadata: defaultResourceMetadataDto({uris: ["https://passbolt.com"]})});
      const suggestedResource2 = defaultResourceDto({metadata: defaultResourceMetadataDto({uris: ["passbolt.com"]})});
      const notSuggestedResource1 = defaultResourceDto({metadata: defaultResourceMetadataDto({uris: ["nost-passbolt.com"]})});
      const notSuggestedResource2 = defaultResourceDto({metadata: defaultResourceMetadataDto({uris: [""]})});
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

  describe("::filterOutMetadataEncrypted", () => {
    it("should filter out the resource which metadata are encrypted.", () => {
      expect.assertions(3);

      const resourceDecrypted1 = defaultResourceDto();
      const resourceDecrypted2 = defaultResourceDto();
      const resourceEncrypted1 = defaultResourceDto({metadata: metadata.withAdaKey.encryptedMetadata[0]});
      const resourceEncrypted2 = defaultResourceDto({metadata: metadata.withSharedKey.encryptedMetadata[1]});

      delete resourceDecrypted1.permission;
      delete resourceDecrypted2.permission;

      const resources = new ResourcesCollection([
        resourceDecrypted1,
        resourceEncrypted1,
        resourceDecrypted2,
        resourceEncrypted2
      ]);

      resources.filterOutMetadataEncrypted();

      expect(resources).toHaveLength(2);
      expect(resources.items[0].toDto()).toStrictEqual(resourceDecrypted1);
      expect(resources.items[1].toDto()).toStrictEqual(resourceDecrypted2);
    });
  });

  describe("::filterOutMetadataNotEncryptedWithUserKey", () => {
    it("should filter out the resource which have metadata key type different than user_key.", () => {
      expect.assertions(2);

      const resourceMetaKeyTypeUserKeyDto = defaultResourceDto({metadata_key_type: METADATA_KEY_TYPE_USER_KEY});
      const resourceV4Dto = defaultResourceV4Dto();
      const resourceMetaKeyTypeMetadataKeyDto = defaultResourceDto({metadata_key_type: METADATA_KEY_TYPE_METADATA_KEY});
      const resources = new ResourcesCollection([
        resourceMetaKeyTypeUserKeyDto,
        resourceMetaKeyTypeMetadataKeyDto,
        resourceV4Dto,
      ]);

      resources.filterOutMetadataNotEncryptedWithUserKey();

      expect(resources).toHaveLength(1);
      expect(resources.items[0].id).toStrictEqual(resourceMetaKeyTypeUserKeyDto.id);
    });
  });

  describe("::filterByIsOwner", () => {
    it("filters the collection by resources having a owner permission.", () => {
      expect.assertions(2);

      const resource1Id = uuidv4();
      const resource1Dto = defaultResourceDto({id: resource1Id, permission: ownerPermissionDto({aco_foreign_key: resource1Id})});
      const resource2Id = uuidv4();
      const resource2Dto = defaultResourceDto({id: resource2Id, permission: updatePermissionDto({aco_foreign_key: resource2Id})});
      const resource3Id = uuidv4();
      const resource3Dto = defaultResourceDto({id: resource3Id, permission: readPermissionDto({aco_foreign_key: resource3Id})});
      const resource4Id = uuidv4();
      const resource4Dto = defaultResourceDto({id: resource4Id, permission: ownerPermissionDto({aco_foreign_key: resource4Id})});
      const resources = new ResourcesCollection([
        resource1Dto,
        resource2Dto,
        resource3Dto,
        resource4Dto,
      ]);

      const filteredResources = resources.filterByIsOwner();

      expect(filteredResources).toHaveLength(2);
      expect(filteredResources.ids).toEqual([resource1Id, resource4Id]);
    });
  });

  describe("::setDecryptedMetadataFromCollection", () => {
    it("should set the decrypted data from the given collection to the current one if the resources are not modified.", () => {
      expect.assertions(4);

      const decryptedCollectionDto = defaultResourceDtosCollection();
      const encryptedCollectionDto = JSON.parse(JSON.stringify(decryptedCollectionDto));

      encryptedCollectionDto[0].metadata = metadata.withSharedKey.encryptedMetadata[0];
      encryptedCollectionDto[1].metadata = metadata.withSharedKey.encryptedMetadata[1];
      encryptedCollectionDto[2].metadata = metadata.withSharedKey.encryptedMetadata[2];
      encryptedCollectionDto[3].metadata = metadata.withSharedKey.encryptedMetadata[3];

      encryptedCollectionDto[0].modified = (new Date()).toISOString();
      encryptedCollectionDto[2].modified = (new Date()).toISOString();

      const decryptedCollection = new ResourcesCollection(decryptedCollectionDto);
      const collection = new ResourcesCollection(encryptedCollectionDto);
      collection.setDecryptedMetadataFromCollection(decryptedCollection);

      expect(collection.items[0].isMetadataDecrypted()).toStrictEqual(false);
      expect(collection.items[1].isMetadataDecrypted()).toStrictEqual(true);
      expect(collection.items[2].isMetadataDecrypted()).toStrictEqual(false);
      expect(collection.items[3].isMetadataDecrypted()).toStrictEqual(true);
    });

    it("should assert its parameter", () => {
      expect.assertions(1);

      const collection = new ResourcesCollection([]);
      expect(() => collection.setDecryptedMetadataFromCollection("test")).toThrow('The `resourcesCollection` parameter should be a ResourcesCollection.');
    });
  });

  describe("::updateWithCollection", () => {
    it("should update the existing resources and add the new ones", () => {
      expect.assertions(5);
      const resource1 = defaultResourceDto();
      const resource2 = defaultResourceDto();
      const collection = new ResourcesCollection([resource1, resource2]);

      const updatedResource2 = {
        ...resource2,
        metadata: defaultResourceMetadataDto({
          name: "UPDATE - RESOURCE",
        }),
      };

      const resource3 = defaultResourceDto();
      const collectionForUpdate = new ResourcesCollection([resource3, updatedResource2]);

      collection.updateWithCollection(collectionForUpdate);

      expect(collection).toHaveLength(3);
      expect(collection.items[0].id).toStrictEqual(resource1.id);
      expect(collection.items[1].id).toStrictEqual(resource2.id);
      expect(collection.items[1].metadata.name).toStrictEqual(updatedResource2.metadata.name);
      expect(collection.items[2].id).toStrictEqual(resource3.id);
    });

    it("should assert its parameters", () => {
      expect.assertions(1);
      const collection = new ResourcesCollection([]);

      expect(() => collection.updateWithCollection("test")).toThrow();
    });
  });
  describe("::setExpiryDateIfUnset", () => {
    it("should set expiry date on resources that don't have one", () => {
      expect.assertions(3);

      const resource1 = defaultResourceDto();
      const resource2 = defaultResourceDto();
      const resource3 = defaultResourceDto();
      const collection = new ResourcesCollection([resource1, resource2, resource3]);
      const resourcesTypes = new ResourceTypesCollection(resourceTypesCollectionDto());

      const expiryDate = "2025-12-31T23:59:59Z";
      collection.setExpiryDateIfUnset(expiryDate, resourcesTypes);

      expect(collection.items[0]._props.expired).toEqual(expiryDate);
      expect(collection.items[1]._props.expired).toEqual(expiryDate);
      expect(collection.items[2]._props.expired).toEqual(expiryDate);
    });

    it("should not override existing expiry dates", () => {
      expect.assertions(3);

      const existingExpiryDate = "2025-06-30T23:59:59Z";
      const resource1 = defaultResourceDto({expired: existingExpiryDate});
      const resource2 = defaultResourceDto();
      const resource3 = defaultResourceDto({expired: existingExpiryDate});
      const collection = new ResourcesCollection([resource1, resource2, resource3]);
      const resourcesTypes = new ResourceTypesCollection(resourceTypesCollectionDto());

      const newExpiryDate = "2025-12-31T23:59:59Z";
      collection.setExpiryDateIfUnset(newExpiryDate, resourcesTypes);

      expect(collection.items[0]._props.expired).toEqual(existingExpiryDate);
      expect(collection.items[1]._props.expired).toEqual(newExpiryDate);
      expect(collection.items[2]._props.expired).toEqual(existingExpiryDate);
    });

    it("should work with empty collection", () => {
      expect.assertions(1);

      const collection = new ResourcesCollection([]);
      const resourcesTypes = new ResourceTypesCollection(resourceTypesCollectionDto());

      const expiryDate = "2025-12-31T23:59:59Z";

      expect(() => collection.setExpiryDateIfUnset(expiryDate, resourcesTypes)).not.toThrow();
    });

    it("should handle null expiry date", () => {
      expect.assertions(3);

      const resource1 = defaultResourceDto();
      const resource2 = defaultResourceDto();
      const resource3 = defaultResourceDto();
      const collection = new ResourcesCollection([resource1, resource2, resource3]);
      const resourcesTypes = new ResourceTypesCollection(resourceTypesCollectionDto());

      collection.setExpiryDateIfUnset(null, resourcesTypes);

      expect(collection.items[0]._props.expired).toBeNull();
      expect(collection.items[1]._props.expired).toBeNull();
      expect(collection.items[2]._props.expired).toBeNull();
    });

    it("should do nothing when resourceTypes is empty after filtering", () => {
      expect.assertions(3);

      const resource1 = defaultResourceDto();
      const resource2 = defaultResourceDto();
      const resource3 = defaultResourceDto();
      const collection = new ResourcesCollection([resource1, resource2, resource3]);
      const resourcesTypes = new ResourceTypesCollection([]);

      const expiryDate = "2025-12-31T23:59:59Z";
      collection.setExpiryDateIfUnset(expiryDate, resourcesTypes);

      expect(collection.items[0]._props.expired).toBeNull();
      expect(collection.items[1]._props.expired).toBeNull();
      expect(collection.items[2]._props.expired).toBeNull();
    });

    it("should only set expiry on resources matching the filtered resource types", () => {
      expect.assertions(3);

      const standaloneTotpResourceType = resourceStandaloneTotpDto();
      const totpResourceType = resourceWithTotpDto();
      const ResourceType = defaultResourceDto();

      const collection = new ResourcesCollection([totpResourceType, standaloneTotpResourceType, ResourceType]);
      const resourcesTypes = new ResourceTypesCollection(resourceTypesCollectionDto());

      const expiryDate = "2025-12-31T23:59:59Z";
      collection.setExpiryDateIfUnset(expiryDate, resourcesTypes);

      expect(collection.items[0]._props.expired).toEqual(expiryDate);
      expect(collection.items[1]._props.expired).toBeNull();
      expect(collection.items[2]._props.expired).toEqual(expiryDate);
    });
  });
});
