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
 * @since         6.0.0
 */
import { v4 as uuidv4 } from "uuid";
import { enableFetchMocks } from "jest-fetch-mock";

import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import { defaultResourceDto } from "passbolt-styleguide/src/shared/models/entity/resource/resourceEntity.test.data";
import CollectionValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/collectionValidationError";
import { defaultPassboltResponseEntity } from "passbolt-styleguide/src/shared/models/entity/apiService/PassboltResponseEntity.test.data";

import ResourceLocalStorage from "../local_storage/resourceLocalStorage";
import { defaultTagsDtos } from "../../model/entity/tag/tagsCollection.test.data";
import TagsCollection from "../../model/entity/tag/tagsCollection";
import UpdateResourceTagsService from "./updateResourceTagsService";
import ResourceEntity from "../../model/entity/resource/resourceEntity";
import ResourcesCollection from "../../model/entity/resource/resourcesCollection";
import { FAIL_ARRAY_SCENARIOS } from "passbolt-styleguide/test/assert/assertEntityProperty";

describe("UpdateResourceTagsService", () => {
  let service,
    resourceDto,
    updatedTagsCollectionDto,
    updatedTagsCollection,
    updateResponse,
    updatedResourceDto,
    updatedResource,
    resourcesDto,
    resourcesToUpdate,
    resourceIds,
    preparedResourcesToUpdate;

  beforeEach(() => {
    enableFetchMocks();

    service = new UpdateResourceTagsService(defaultApiClientOptions());

    resourceDto = defaultResourceDto({}, { withTags: true });
    updatedTagsCollectionDto = defaultTagsDtos();
    updatedTagsCollection = new TagsCollection(updatedTagsCollectionDto);
    updateResponse = defaultPassboltResponseEntity(updatedTagsCollectionDto);
    updatedResourceDto = defaultResourceDto({
      ...resourceDto,
      tags: updatedTagsCollectionDto,
    });
    updatedResource = new ResourceEntity(updatedResourceDto);
    resourcesDto = [
      defaultResourceDto({ tags: updatedTagsCollectionDto }),
      defaultResourceDto({ tags: [] }),
      defaultResourceDto(),
    ];
    resourcesToUpdate = new ResourcesCollection(resourcesDto);
    resourceIds = resourcesDto.map((resource) => resource.id);
    preparedResourcesToUpdate = new ResourcesCollection(
      resourcesToUpdate.items.map(
        (resource) =>
          new ResourceEntity({
            ...resource.toDto(),
            tags: updatedTagsCollection,
          }),
      ),
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("::_updateResourceTagsApi", () => {
    it("should update the resource's tags collection", async () => {
      expect.assertions(3);

      jest.spyOn(service.tagService, "updateResourceTags").mockResolvedValue(updateResponse);
      const updatedResourceTagsCollection = await service._updateResourceTagsApi(resourceDto.id, updatedTagsCollection);

      expect(service.tagService.updateResourceTags).toHaveBeenCalledWith(resourceDto.id, updatedTagsCollectionDto);
      expect(updatedResourceTagsCollection).toBeInstanceOf(TagsCollection);
      expect(updatedResourceTagsCollection).toEqual(updatedTagsCollection);
    });

    it("should throw an Error if the resourceId parameter is not a valid uuid", async () => {
      expect.assertions(2);

      jest.spyOn(service.tagService, "updateResourceTags");

      await expect(() => service._updateResourceTagsApi("", updatedTagsCollection)).rejects.toThrow(Error);
      expect(service.tagService.updateResourceTags).not.toHaveBeenCalled();
    });

    it("should throw a TypeError if the tags parameter is not a TagsCollection", async () => {
      expect.assertions(2);

      jest.spyOn(service.tagService, "updateResourceTags");

      await expect(() => service._updateResourceTagsApi(resourceDto.id, {})).rejects.toThrow(TypeError);
      expect(service.tagService.updateResourceTags).not.toHaveBeenCalled();
    });

    it("should throw a CollectionValidationError if the entity is malformed", async () => {
      expect.assertions(1);

      jest
        .spyOn(service.tagService, "updateResourceTags")
        .mockResolvedValue(defaultPassboltResponseEntity(defaultTagsDtos(3, { id: null })));

      await expect(() => service._updateResourceTagsApi(resourceDto.id, updatedTagsCollection)).rejects.toThrow(
        CollectionValidationError,
      );
    });

    it("should throw any error thrown by the underlying service", async () => {
      expect.assertions(1);

      const error = new Error();
      jest.spyOn(service.tagService, "updateResourceTags").mockRejectedValue(error);
      await expect(() => service._updateResourceTagsApi(resourceDto.id, updatedTagsCollection)).rejects.toThrow(error);
    });
  });

  describe("::_updateResourceTagsLocalStorage", () => {
    it("should update the resource's tags collection", async () => {
      expect.assertions(4);

      jest.spyOn(ResourceLocalStorage, "getResourceById").mockResolvedValue(resourceDto);
      jest.spyOn(ResourceLocalStorage, "updateResource").mockResolvedValue();

      const updatedLocalResource = await service._updateResourceTagsLocalStorage(resourceDto.id, updatedTagsCollection);

      expect(ResourceLocalStorage.getResourceById).toHaveBeenCalledTimes(1);
      expect(ResourceLocalStorage.updateResource).toHaveBeenCalledWith(updatedResource);

      expect(updatedLocalResource).toBeInstanceOf(ResourceEntity);
      expect(updatedLocalResource).toEqual(updatedResource);
    });

    it("should throw an Error if the resourceId parameter is not a valid uuid", async () => {
      expect.assertions(3);

      jest.spyOn(ResourceLocalStorage, "getResourceById");
      jest.spyOn(ResourceLocalStorage, "updateResource");

      await expect(() => service._updateResourceTagsLocalStorage("", updatedTagsCollection)).rejects.toThrow(Error);
      expect(ResourceLocalStorage.getResourceById).not.toHaveBeenCalled();
      expect(ResourceLocalStorage.updateResource).not.toHaveBeenCalled();
    });

    it("should throw a TypeError if the tags parameter is not a TagsCollection", async () => {
      expect.assertions(3);

      jest.spyOn(ResourceLocalStorage, "getResourceById");
      jest.spyOn(ResourceLocalStorage, "updateResource");

      await expect(() => service._updateResourceTagsLocalStorage(resourceDto.id, {})).rejects.toThrow(TypeError);
      expect(ResourceLocalStorage.getResourceById).not.toHaveBeenCalled();
      expect(ResourceLocalStorage.updateResource).not.toHaveBeenCalled();
    });

    it("should throw an Error if the local resource does not exist", async () => {
      expect.assertions(1);

      jest.spyOn(ResourceLocalStorage, "getResourceById").mockResolvedValue(undefined);
      await expect(() =>
        service._updateResourceTagsLocalStorage(resourceDto.id, updatedTagsCollection),
      ).rejects.toThrow(new Error(`Resource with id ${resourceDto.id} does not exist.`));
    });

    it("should throw a EntityValidationError if the local resource is malformed", async () => {
      expect.assertions(1);

      jest.spyOn(ResourceLocalStorage, "getResourceById").mockResolvedValue({ resource_type_id: 0 });
      await expect(() =>
        service._updateResourceTagsLocalStorage(resourceDto.id, updatedTagsCollection),
      ).rejects.toThrow(EntityValidationError);
    });

    it("should throw any error thrown by the underlying service when getting the resource", async () => {
      expect.assertions(1);

      const error = new Error();
      jest.spyOn(ResourceLocalStorage, "getResourceById").mockRejectedValue(error);

      await expect(service._updateResourceTagsLocalStorage(resourceDto.id, updatedTagsCollection)).rejects.toThrow(
        error,
      );
    });

    it("should throw an Error when the resource doesn't exist locally", async () => {
      expect.assertions(1);

      jest.spyOn(ResourceLocalStorage, "getResourceById").mockResolvedValue(resourceDto);
      jest.spyOn(ResourceLocalStorage, "updateResource");

      await expect(service._updateResourceTagsLocalStorage(resourceDto.id, updatedTagsCollection)).rejects.toThrow(
        Error,
      );
    });
  });

  describe("::updateResourceTags", () => {
    it("should update the resource's tags collection", async () => {
      expect.assertions(5);

      jest.spyOn(service.tagService, "updateResourceTags").mockResolvedValue(updateResponse);
      jest.spyOn(ResourceLocalStorage, "getResourceById").mockResolvedValue(resourceDto);
      jest.spyOn(ResourceLocalStorage, "updateResource").mockResolvedValue();

      const resource = await service.updateResourceTags(resourceDto.id, updatedTagsCollection);

      expect(resource).toBeInstanceOf(ResourceEntity);
      expect(resource).toEqual(updatedResource);

      expect(service.tagService.updateResourceTags).toHaveBeenCalledWith(resourceDto.id, updatedTagsCollectionDto);

      expect(ResourceLocalStorage.getResourceById).toHaveBeenCalledTimes(1);
      expect(ResourceLocalStorage.updateResource).toHaveBeenCalledWith(updatedResource);
    });

    it("should throw an Error if the resourceId parameter is not a valid uuid", async () => {
      expect.assertions(4);

      jest.spyOn(service.tagService, "updateResourceTags");
      jest.spyOn(ResourceLocalStorage, "getResourceById");
      jest.spyOn(ResourceLocalStorage, "updateResource");

      await expect(() => service.updateResourceTags("", updatedTagsCollection)).rejects.toThrow(Error);

      expect(service.tagService.updateResourceTags).not.toHaveBeenCalled();
      expect(ResourceLocalStorage.getResourceById).not.toHaveBeenCalled();
      expect(ResourceLocalStorage.updateResource).not.toHaveBeenCalled();
    });

    it("should throw a TypeError if the tags parameter is not a TagsCollection", async () => {
      expect.assertions(4);

      jest.spyOn(service.tagService, "updateResourceTags");
      jest.spyOn(ResourceLocalStorage, "getResourceById");
      jest.spyOn(ResourceLocalStorage, "updateResource");

      await expect(() => service.updateResourceTags(resourceDto.id, {})).rejects.toThrow(TypeError);

      expect(service.tagService.updateResourceTags).not.toHaveBeenCalled();
      expect(ResourceLocalStorage.getResourceById).not.toHaveBeenCalled();
      expect(ResourceLocalStorage.updateResource).not.toHaveBeenCalled();
    });

    it("should throw any error thrown by the underlying API service", async () => {
      expect.assertions(4);

      const error = new Error();
      jest.spyOn(service.tagService, "updateResourceTags").mockRejectedValue(error);
      jest.spyOn(ResourceLocalStorage, "getResourceById");
      jest.spyOn(ResourceLocalStorage, "updateResource");

      await expect(() => service.updateResourceTags(resourceDto.id, updatedTagsCollection)).rejects.toThrow(error);

      expect(service.tagService.updateResourceTags).toHaveBeenCalledTimes(1);
      expect(ResourceLocalStorage.getResourceById).not.toHaveBeenCalled();
      expect(ResourceLocalStorage.updateResource).not.toHaveBeenCalled();
    });

    it("should throw any error thrown by the underlying local storage getResourceById", async () => {
      expect.assertions(4);

      const error = new Error();
      jest.spyOn(service.tagService, "updateResourceTags").mockResolvedValue(updateResponse);
      jest.spyOn(ResourceLocalStorage, "getResourceById").mockRejectedValue(error);
      jest.spyOn(ResourceLocalStorage, "updateResource");

      await expect(() => service.updateResourceTags(resourceDto.id, updatedTagsCollection)).rejects.toThrow(error);

      expect(service.tagService.updateResourceTags).toHaveBeenCalledTimes(1);
      expect(ResourceLocalStorage.getResourceById).toHaveBeenCalledTimes(1);
      expect(ResourceLocalStorage.updateResource).not.toHaveBeenCalled();
    });

    it("should throw any error thrown by the underlying local storage updateResource", async () => {
      expect.assertions(4);

      const error = new Error();
      jest.spyOn(service.tagService, "updateResourceTags").mockResolvedValue(updateResponse);
      jest.spyOn(ResourceLocalStorage, "getResourceById").mockResolvedValue(resourceDto);
      jest.spyOn(ResourceLocalStorage, "updateResource").mockRejectedValue(error);

      await expect(() => service.updateResourceTags(resourceDto.id, updatedTagsCollection)).rejects.toThrow(error);

      expect(service.tagService.updateResourceTags).toHaveBeenCalledTimes(1);
      expect(ResourceLocalStorage.getResourceById).toHaveBeenCalledTimes(1);
      expect(ResourceLocalStorage.updateResource).toHaveBeenCalledTimes(1);
    });
  });

  describe("::_prepareResourcesWithTags", () => {
    it("should prepare resources by updating their tags collection if needed", async () => {
      expect.assertions(8);

      const { resourcesToUpdate: resources, ignoredResources } = await service._prepareResourcesWithTags(
        resourcesToUpdate,
        resourceIds,
        updatedTagsCollection,
      );

      expect(resources).toBeInstanceOf(ResourcesCollection);
      expect(resources.length).toEqual(2);

      expect(ignoredResources).toBeInstanceOf(ResourcesCollection);
      expect(ignoredResources.length).toEqual(1);

      resources.items.forEach((resource) => {
        expect(resource).toBeInstanceOf(ResourceEntity);
        expect(resource.tags).toEqual(updatedTagsCollection);
      });
    });

    it("should do nothing if given an empty resourceIdsToUpdate array", async () => {
      expect.assertions(4);

      const { resourcesToUpdate: resources, ignoredResources } = await service._prepareResourcesWithTags(
        resourcesToUpdate,
        [],
        updatedTagsCollection,
      );

      expect(resources).toBeInstanceOf(ResourcesCollection);
      expect(resources.length).toEqual(0);

      expect(ignoredResources).toBeInstanceOf(ResourcesCollection);
      expect(ignoredResources.length).toEqual(0);
    });

    it("should throw an Error if localResources is not a ResourcesCollection", async () => {
      expect.assertions(1);

      await expect(() => service._prepareResourcesWithTags([], resourceIds, updatedTagsCollection)).rejects.toThrow(
        new Error("localResources is not a ResourcesCollection"),
      );
    });

    it("should throw a TypeError if resourceIds is not an array", async () => {
      expect.assertions(7);

      const tests = FAIL_ARRAY_SCENARIOS.map(async ({ value }) => {
        await expect(() =>
          service._prepareResourcesWithTags(resourcesToUpdate, value, updatedTagsCollection),
        ).rejects.toThrow(new TypeError("resourceIds is not an array"));
      });
      await Promise.all(tests);
    });

    it("should throw an Error if any resourceId is not a valid uuid", async () => {
      expect.assertions(1);

      await expect(() =>
        service._prepareResourcesWithTags(resourcesToUpdate, ["", ...resourceIds], updatedTagsCollection),
      ).rejects.toThrow(new Error("The given parameter is not a valid UUID"));
    });

    it("should throw a TypeError if the tags parameter is not a TagsCollection", async () => {
      expect.assertions(1);

      await expect(() => service._prepareResourcesWithTags(resourcesToUpdate, resourceIds, [])).rejects.toThrow(
        new TypeError("tags is not a TagsCollection"),
      );
    });

    it("should throw an Error if the resource doesn't exist locally", async () => {
      expect.assertions(1);

      const uuid = uuidv4();
      await expect(() =>
        service._prepareResourcesWithTags(resourcesToUpdate, [uuid], updatedTagsCollection),
      ).rejects.toThrow(new TypeError(`Resource ${uuid} doesn't exist locally`));
    });
  });

  describe("::_addTagsToResourcesApi", () => {
    it("should update the resource's tags collection with the API service", async () => {
      expect.assertions(12);

      jest.spyOn(service.tagService, "updateResourceTags").mockResolvedValue(updateResponse);

      const resources = await service._addTagsToResourcesApi(preparedResourcesToUpdate);

      expect(resources).toBeInstanceOf(ResourcesCollection);
      expect(resources.length).toEqual(3);

      resources.items.forEach((resource) => {
        expect(resource).toBeInstanceOf(ResourceEntity);
        expect(resource.tags).toEqual(updatedTagsCollection);
        expect(service.tagService.updateResourceTags).toHaveBeenCalledWith(resource.id, updatedTagsCollectionDto);
      });

      expect(service.tagService.updateResourceTags).toHaveBeenCalledTimes(3);
    });

    it("should do nothing if given an empty array", async () => {
      expect.assertions(3);

      jest.spyOn(service.tagService, "updateResourceTags");

      const resources = await service._addTagsToResourcesApi(new ResourcesCollection());

      expect(resources).toBeInstanceOf(ResourcesCollection);
      expect(resources.length).toEqual(0);
      expect(service.tagService.updateResourceTags).not.toHaveBeenCalled();
    });

    it("should throw a TypeError if the resourcesToUpdate parameter is not a ResourcesCollection", async () => {
      expect.assertions(2);

      jest.spyOn(service.tagService, "updateResourceTags");

      await expect(() => service._addTagsToResourcesApi([])).rejects.toThrow(
        new TypeError("resourcesToUpdate is not a ResourcesCollection"),
      );

      expect(service.tagService.updateResourceTags).not.toHaveBeenCalled();
    });

    it("should throw a CollectionValidationError when an error is thrown by the underlying API service", async () => {
      expect.assertions(2);

      const error = new Error();
      jest.spyOn(service.tagService, "updateResourceTags").mockRejectedValue(error);

      await expect(() => service._addTagsToResourcesApi(preparedResourcesToUpdate)).rejects.toThrow(
        CollectionValidationError,
      );

      expect(service.tagService.updateResourceTags).toHaveBeenCalledTimes(3);
    });

    describe("Callbacks", () => {
      it("successCallback should be called for each successfully updated resource", async () => {
        expect.assertions(1);

        jest.spyOn(service.tagService, "updateResourceTags").mockResolvedValue(updatedTagsCollection);

        const mockSuccessCallback = jest.fn();
        await service._addTagsToResourcesApi(preparedResourcesToUpdate, { successCallback: mockSuccessCallback });

        expect(mockSuccessCallback).toHaveBeenCalledTimes(3);
      });

      it("errorCallback should be called for each resource which encountered an error", async () => {
        expect.assertions(2);

        const mockErrorCallback = jest.fn();
        jest.spyOn(service.tagService, "updateResourceTags").mockRejectedValue(updatedTagsCollection);

        try {
          await service._addTagsToResourcesApi(preparedResourcesToUpdate, { errorCallback: mockErrorCallback });
        } catch (error) {
          expect(error).toBeInstanceOf(CollectionValidationError);
          expect(mockErrorCallback).toHaveBeenCalledTimes(3);
        }
      });
    });
  });

  describe("::addTagsToResources", () => {
    it("should update the resource's tags collection", async () => {
      expect.assertions(14);

      jest.spyOn(ResourceLocalStorage, "get").mockResolvedValue(resourcesDto);
      jest.spyOn(service.tagService, "updateResourceTags").mockResolvedValue(updateResponse);
      jest.spyOn(ResourceLocalStorage, "set").mockResolvedValue();

      const resources = await service.addTagsToResources(resourceIds, updatedTagsCollection);

      expect(resources).toBeInstanceOf(ResourcesCollection);
      expect(resources.length).toEqual(3);

      resources.items.forEach((resource) => {
        expect(resource).toBeInstanceOf(ResourceEntity);
        expect(resource.tags).toEqual(updatedTagsCollection);

        if (resource.id !== resourcesDto[0].id) {
          expect(service.tagService.updateResourceTags).toHaveBeenCalledWith(resource.id, updatedTagsCollectionDto);
        }
      });

      expect(ResourceLocalStorage.get).toHaveBeenCalledTimes(1);
      expect(service.tagService.updateResourceTags).toHaveBeenCalledTimes(2);
      expect(ResourceLocalStorage.set).toHaveBeenCalledTimes(1);
      // `.toHaveBeenCalledWith` doesn't manage to match the parameter as it is a ResourcesCollection
      // Also, the order might be different
      expect(ResourceLocalStorage.set.mock.calls[0][0].items).toEqual(expect.arrayContaining(resources.items));
    });

    it("should do nothing if given an empty array", async () => {
      expect.assertions(5);

      jest.spyOn(ResourceLocalStorage, "get");
      jest.spyOn(service.tagService, "updateResourceTags");
      jest.spyOn(ResourceLocalStorage, "set");

      const resources = await service.addTagsToResources([], updatedTagsCollection);

      expect(resources).toBeInstanceOf(ResourcesCollection);
      expect(resources.length).toEqual(0);

      expect(ResourceLocalStorage.get).not.toHaveBeenCalled();
      expect(service.tagService.updateResourceTags).not.toHaveBeenCalled();
      expect(ResourceLocalStorage.set).not.toHaveBeenCalled();
    });

    it("should throw a TypeError if resourceIds is not an array", async () => {
      expect.assertions(10);

      jest.spyOn(ResourceLocalStorage, "get");
      jest.spyOn(service.tagService, "updateResourceTags");
      jest.spyOn(ResourceLocalStorage, "set");

      const tests = FAIL_ARRAY_SCENARIOS.map(async ({ value }) => {
        await expect(() => service.addTagsToResources(value, updatedTagsCollection)).rejects.toThrow(
          new TypeError("resourceIds is not an array"),
        );
      });

      await Promise.all(tests);

      expect(ResourceLocalStorage.get).not.toHaveBeenCalled();
      expect(service.tagService.updateResourceTags).not.toHaveBeenCalled();
      expect(ResourceLocalStorage.set).not.toHaveBeenCalled();
    });

    it("should throw an Error if any resourceId is not a valid uuid", async () => {
      expect.assertions(4);

      jest.spyOn(ResourceLocalStorage, "get").mockResolvedValue(resourcesDto);
      jest.spyOn(service.tagService, "updateResourceTags");
      jest.spyOn(ResourceLocalStorage, "set");

      await expect(() => service.addTagsToResources(["", ...resourceIds], updatedTagsCollection)).rejects.toThrow(
        new Error("The given parameter is not a valid UUID"),
      );

      expect(ResourceLocalStorage.get).toHaveBeenCalledTimes(1);
      expect(service.tagService.updateResourceTags).not.toHaveBeenCalled();
      expect(ResourceLocalStorage.set).not.toHaveBeenCalled();
    });

    it("should throw a TypeError if the tags parameter is not a TagsCollection", async () => {
      expect.assertions(4);

      jest.spyOn(ResourceLocalStorage, "get").mockResolvedValue(resourcesDto);
      jest.spyOn(service.tagService, "updateResourceTags");
      jest.spyOn(ResourceLocalStorage, "set");

      await expect(() => service.addTagsToResources(resourceIds, [])).rejects.toThrow(
        new TypeError("tags is not a TagsCollection"),
      );

      expect(ResourceLocalStorage.get).toHaveBeenCalledTimes(1);
      expect(service.tagService.updateResourceTags).not.toHaveBeenCalled();
      expect(ResourceLocalStorage.set).not.toHaveBeenCalled();
    });

    it("should throw an Error if the resource doesn't exist locally", async () => {
      expect.assertions(4);

      jest.spyOn(ResourceLocalStorage, "get").mockResolvedValue(resourcesDto);
      jest.spyOn(service.tagService, "updateResourceTags");
      jest.spyOn(ResourceLocalStorage, "set");

      const uuid = uuidv4();
      await expect(() => service.addTagsToResources([uuid], updatedTagsCollection)).rejects.toThrow(
        new TypeError(`Resource ${uuid} doesn't exist locally`),
      );

      expect(ResourceLocalStorage.get).toHaveBeenCalledTimes(1);
      expect(service.tagService.updateResourceTags).not.toHaveBeenCalled();
      expect(ResourceLocalStorage.set).not.toHaveBeenCalled();
    });

    it("should throw a CollectionValidationError when an error is thrown by the underlying API service", async () => {
      expect.assertions(4);

      const error = new Error();
      jest.spyOn(ResourceLocalStorage, "get").mockResolvedValue(resourcesDto);
      jest.spyOn(service.tagService, "updateResourceTags").mockRejectedValue(error);
      jest.spyOn(ResourceLocalStorage, "set");

      await expect(() => service.addTagsToResources(resourceIds, updatedTagsCollection)).rejects.toThrow(
        CollectionValidationError,
      );

      expect(ResourceLocalStorage.get).toHaveBeenCalledTimes(1);
      expect(service.tagService.updateResourceTags).toHaveBeenCalledTimes(2);
      expect(ResourceLocalStorage.set).not.toHaveBeenCalled();
    });

    it("should throw any error thrown by the underlying local storage get", async () => {
      expect.assertions(4);

      const error = new Error();
      jest.spyOn(ResourceLocalStorage, "get").mockRejectedValue(error);
      jest.spyOn(service.tagService, "updateResourceTags");
      jest.spyOn(ResourceLocalStorage, "set");

      await expect(() => service.addTagsToResources(resourceIds, updatedTagsCollection)).rejects.toThrow(error);

      expect(ResourceLocalStorage.get).toHaveBeenCalledTimes(1);
      expect(service.tagService.updateResourceTags).not.toHaveBeenCalled();
      expect(ResourceLocalStorage.set).not.toHaveBeenCalled();
    });

    it("should throw any error thrown by the underlying local storage set", async () => {
      expect.assertions(4);

      const error = new Error();
      jest.spyOn(ResourceLocalStorage, "get").mockResolvedValue(resourcesDto);
      jest.spyOn(service.tagService, "updateResourceTags").mockResolvedValue(updateResponse);
      jest.spyOn(ResourceLocalStorage, "set").mockRejectedValue(error);

      await expect(() => service.addTagsToResources(resourceIds, updatedTagsCollection)).rejects.toThrow(error);

      expect(ResourceLocalStorage.get).toHaveBeenCalledTimes(1);
      expect(service.tagService.updateResourceTags).toHaveBeenCalledTimes(2);
      expect(ResourceLocalStorage.set).toHaveBeenCalledTimes(1);
    });

    describe("Callbacks", () => {
      it("successCallback should be called for each successfully updated resource", async () => {
        expect.assertions(1);

        jest.spyOn(ResourceLocalStorage, "get").mockResolvedValue(resourcesDto);
        jest.spyOn(service.tagService, "updateResourceTags").mockResolvedValue(updatedTagsCollection);
        jest.spyOn(ResourceLocalStorage, "set").mockResolvedValue();

        const mockSuccessCallback = jest.fn();
        await service.addTagsToResources(resourceIds, updatedTagsCollection, { successCallback: mockSuccessCallback });

        expect(mockSuccessCallback).toHaveBeenCalledTimes(3);
      });

      it("errorCallback should be called for each resource which encountered an error", async () => {
        expect.assertions(2);

        const mockErrorCallback = jest.fn();
        jest.spyOn(ResourceLocalStorage, "get").mockResolvedValue(resourcesDto);
        jest.spyOn(service.tagService, "updateResourceTags").mockRejectedValue(updatedTagsCollection);
        jest.spyOn(ResourceLocalStorage, "set").mockResolvedValue();

        try {
          await service.addTagsToResources(resourceIds, updatedTagsCollection, { errorCallback: mockErrorCallback });
        } catch (error) {
          expect(error).toBeInstanceOf(CollectionValidationError);
          expect(mockErrorCallback).toHaveBeenCalledTimes(2);
        }
      });
    });
  });
});
