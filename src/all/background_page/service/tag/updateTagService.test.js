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
import { enableFetchMocks } from "jest-fetch-mock";

import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import CollectionValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/collectionValidationError";
import { defaultResourcesDtos } from "passbolt-styleguide/src/shared/models/entity/resource/resourcesCollection.test.data";
import { defaultPassboltResponseEntity } from "passbolt-styleguide/src/shared/models/entity/apiService/PassboltResponseEntity.test.data";

import UpdateTagService from "./updateTagService";
import TagEntity from "../../model/entity/tag/tagEntity";
import ResourceLocalStorage from "../local_storage/resourceLocalStorage";
import { defaultTagDto } from "../../model/entity/tag/tagEntity.test.data";
import { defaultTagsCollectionDto } from "../../model/entity/tag/tagsCollection.test.data";
import ResourcesCollection from "../../model/entity/resource/resourcesCollection";

describe("UpdateTagService", () => {
  let service,
    tagsCollectionDto,
    tagToUpdateDto,
    tagToUpdate,
    updatedTagDto,
    updatedTag,
    randomTag,
    updateResponse,
    malformedUpdateResponse,
    resourcesCollectionDto,
    updatedTagsCollectionDto,
    updatedResourcesCollectionDto;

  beforeEach(() => {
    enableFetchMocks();

    service = new UpdateTagService(defaultApiClientOptions());

    tagsCollectionDto = defaultTagsCollectionDto();
    tagToUpdateDto = defaultTagDto({ ...tagsCollectionDto[0], slug: "updated" });
    tagToUpdate = new TagEntity(tagToUpdateDto);
    updatedTagDto = defaultTagDto({ slug: tagToUpdateDto.slug }); // The API changes the id of the tag
    updatedTag = new TagEntity(updatedTagDto);
    randomTag = new TagEntity(defaultTagDto());
    updateResponse = defaultPassboltResponseEntity(updatedTagDto);
    malformedUpdateResponse = defaultPassboltResponseEntity(defaultTagDto({ id: null }));
    resourcesCollectionDto = defaultResourcesDtos(10, { tags: tagsCollectionDto });

    updatedTagsCollectionDto = [...tagsCollectionDto];
    updatedTagsCollectionDto[0] = updatedTagDto;
    updatedResourcesCollectionDto = resourcesCollectionDto.map((resource) => ({
      ...resource,
      tags: updatedTagsCollectionDto,
    }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("::_updateTagApi", () => {
    it("should update the tag", async () => {
      expect.assertions(3);

      jest.spyOn(service.tagService, "update").mockResolvedValue(updateResponse);
      const updatedTag = await service._updateTagApi(tagToUpdate);

      expect(service.tagService.update).toHaveBeenCalledWith(tagToUpdate.id, tagToUpdate.toDto());
      expect(updatedTag).toBeInstanceOf(TagEntity);
      expect(updatedTag).toEqual(updatedTag);
    });

    it("should throw a TypeError if the tag parameter is not a TagEntity", async () => {
      expect.assertions(2);

      jest.spyOn(service.tagService, "update");

      await expect(() => service._updateTagApi({})).rejects.toThrow(TypeError);
      expect(service.tagService.update).not.toHaveBeenCalled();
    });

    it("should throw a EntityValidationError if the entity is malformed", async () => {
      expect.assertions(1);

      jest.spyOn(service.tagService, "update").mockResolvedValue(malformedUpdateResponse);
      await expect(() => service._updateTagApi(tagToUpdate)).rejects.toThrow(EntityValidationError);
    });

    it("should throw any error thrown by the underlying service", async () => {
      expect.assertions(1);

      const error = new Error();
      jest.spyOn(service.tagService, "update").mockRejectedValue(error);
      await expect(() => service._updateTagApi(tagToUpdate)).rejects.toThrow(error);
    });
  });

  describe("::_updateTagLocalStorage", () => {
    it("should update the tag", async () => {
      expect.assertions(4);

      jest.spyOn(ResourceLocalStorage, "get").mockResolvedValue(resourcesCollectionDto);
      jest.spyOn(ResourceLocalStorage, "set");

      const updatedLocalTag = await service._updateTagLocalStorage(tagToUpdate.id, updatedTag);

      expect(ResourceLocalStorage.get).toHaveBeenCalled();
      expect(ResourceLocalStorage.set).toHaveBeenCalledWith(new ResourcesCollection(updatedResourcesCollectionDto));

      expect(updatedLocalTag).toBeInstanceOf(TagEntity);
      expect(updatedLocalTag).toStrictEqual(updatedTag);
    });

    it("should still return the tag even if it wasn't in any local resource", async () => {
      expect.assertions(3);

      jest.spyOn(ResourceLocalStorage, "get").mockResolvedValue(resourcesCollectionDto);
      jest.spyOn(ResourceLocalStorage, "set");
      const updatedLocalTag = await service._updateTagLocalStorage(randomTag.id, updatedTag);

      expect(ResourceLocalStorage.set).not.toHaveBeenCalled();
      expect(updatedLocalTag).toBeInstanceOf(TagEntity);
      expect(updatedLocalTag).toStrictEqual(updatedTag);
    });

    it("should throw an Error if the oldTagId parameter is not a valid uuid", async () => {
      expect.assertions(1);
      await expect(() => service._updateTagLocalStorage("", updatedTag)).rejects.toThrow(Error);
    });

    it("should throw a TypeError if the tag parameter is not a TagEntity", async () => {
      expect.assertions(1);
      await expect(() => service._updateTagLocalStorage(randomTag.id, {})).rejects.toThrow(TypeError);
    });

    it("should throw a CollectionValidationError if the entity is malformed", async () => {
      expect.assertions(1);

      jest.spyOn(ResourceLocalStorage, "get").mockResolvedValue(defaultResourcesDtos(2, { id: null }));
      await expect(service._updateTagLocalStorage(tagToUpdate.id, updatedTag)).rejects.toThrow(
        CollectionValidationError,
      );
    });

    it("should throw any error thrown by the underlying service when getting the values", async () => {
      expect.assertions(1);

      const error = new Error();
      jest.spyOn(ResourceLocalStorage, "get").mockRejectedValue(error);

      await expect(service._updateTagLocalStorage(tagToUpdate.id, updatedTag)).rejects.toThrow(error);
    });

    it("should throw any error thrown by the underlying service when setting the values", async () => {
      expect.assertions(1);

      const error = new Error();
      jest.spyOn(ResourceLocalStorage, "get").mockResolvedValue(resourcesCollectionDto);
      jest.spyOn(ResourceLocalStorage, "set").mockRejectedValue(error);

      await expect(service._updateTagLocalStorage(tagToUpdate.id, updatedTag)).rejects.toThrow(error);
    });
  });

  describe("::update", () => {
    it("should update the tag both in the api and the local storage", async () => {
      expect.assertions(5);

      jest.spyOn(service.tagService, "update").mockResolvedValue(updateResponse);
      jest.spyOn(ResourceLocalStorage, "get").mockResolvedValue(resourcesCollectionDto);
      jest.spyOn(ResourceLocalStorage, "set");

      const updatedTag = await service.update(tagToUpdate);

      expect(updatedTag).toBeInstanceOf(TagEntity);
      expect(updatedTag).toEqual(updatedTag);

      expect(service.tagService.update).toHaveBeenCalledWith(tagToUpdate.id, tagToUpdate.toDto());

      expect(ResourceLocalStorage.get).toHaveBeenCalled();
      expect(ResourceLocalStorage.set).toHaveBeenCalledWith(new ResourcesCollection(updatedResourcesCollectionDto));
    });

    it("should throw a TypeError if the tag parameter is not a TagEntity", async () => {
      expect.assertions(1);
      await expect(() => service.update({})).rejects.toThrow(TypeError);
    });

    it("should throw any error thrown by the underlying API service", async () => {
      expect.assertions(3);

      const error = new Error();
      jest.spyOn(service.tagService, "update").mockRejectedValue(error);
      jest.spyOn(ResourceLocalStorage, "get").mockResolvedValue(resourcesCollectionDto);
      jest.spyOn(ResourceLocalStorage, "set");

      await expect(() => service.update(tagToUpdate)).rejects.toThrow(error);

      expect(ResourceLocalStorage.get).not.toHaveBeenCalled();
      expect(ResourceLocalStorage.set).not.toHaveBeenCalled();
    });

    it("should throw any error thrown by the underlying local storage get", async () => {
      expect.assertions(4);

      const error = new Error();
      jest.spyOn(service.tagService, "update").mockResolvedValue(updateResponse);

      jest.spyOn(ResourceLocalStorage, "get").mockRejectedValue(error);
      jest.spyOn(ResourceLocalStorage, "set");

      await expect(() => service.update(tagToUpdate)).rejects.toThrow(error);

      expect(service.tagService.update).toHaveBeenCalledWith(tagToUpdate.id, tagToUpdate.toDto());
      expect(ResourceLocalStorage.get).toHaveBeenCalled();
      expect(ResourceLocalStorage.set).not.toHaveBeenCalled();
    });

    it("should throw any error thrown by the underlying local storage set", async () => {
      expect.assertions(4);

      const error = new Error();
      jest.spyOn(service.tagService, "update").mockResolvedValue(updateResponse);
      jest.spyOn(ResourceLocalStorage, "get").mockResolvedValue(resourcesCollectionDto);
      jest.spyOn(ResourceLocalStorage, "set").mockRejectedValue(error);

      await expect(() => service.update(tagToUpdate)).rejects.toThrow(error);

      expect(service.tagService.update).toHaveBeenCalledWith(tagToUpdate.id, tagToUpdate.toDto());
      expect(ResourceLocalStorage.get).toHaveBeenCalled();
      expect(ResourceLocalStorage.set).toHaveBeenCalled();
    });
  });
});
