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

import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import CollectionValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/collectionValidationError";
import { defaultResourcesDtos } from "passbolt-styleguide/src/shared/models/entity/resource/resourcesCollection.test.data";
import { defaultPassboltResponseEntity } from "passbolt-styleguide/src/shared/models/entity/apiService/PassboltResponseEntity.test.data";

import DeleteTagService from "./deleteTagService";
import TagEntity from "../../model/entity/tag/tagEntity";
import ResourceLocalStorage from "../local_storage/resourceLocalStorage";
import { defaultTagDto } from "../../model/entity/tag/tagEntity.test.data";
import ResourcesCollection from "../../model/entity/resource/resourcesCollection";
import { defaultTagsCollectionDto } from "../../model/entity/tag/tagsCollection.test.data";

describe("DeleteTagService", () => {
  let service,
    unrelatedTag,
    tagsCollectionDto,
    tagToDeleteId,
    deleteResponse,
    resourcesCollectionDto,
    updatedTagsCollectionDto,
    updatedResourcesCollectionDto;

  beforeEach(() => {
    enableFetchMocks();

    service = new DeleteTagService(defaultApiClientOptions());

    unrelatedTag = new TagEntity(defaultTagDto());

    tagsCollectionDto = defaultTagsCollectionDto();
    tagToDeleteId = tagsCollectionDto[0].id;
    deleteResponse = defaultPassboltResponseEntity();
    resourcesCollectionDto = defaultResourcesDtos(10, { tags: tagsCollectionDto });

    [, ...updatedTagsCollectionDto] = tagsCollectionDto;
    updatedResourcesCollectionDto = resourcesCollectionDto.map((resource) => ({
      ...resource,
      tags: updatedTagsCollectionDto,
    }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("::deleteTagApi", () => {
    it("should delete the tag", async () => {
      expect.assertions(1);

      jest.spyOn(service.tagService, "delete").mockResolvedValue();

      await service._deleteTagApi(tagToDeleteId);
      expect(service.tagService.delete).toHaveBeenCalledWith(tagToDeleteId);
    });

    it("should throw an Error if the tagId parameter is not a valid uuid", async () => {
      expect.assertions(2);

      jest.spyOn(service.tagService, "delete");

      await expect(() => service._deleteTagApi("")).rejects.toThrow(Error);
      expect(service.tagService.delete).not.toHaveBeenCalled();
    });

    it("should throw any error thrown by the underlying service", async () => {
      expect.assertions(1);

      const error = new Error();
      jest.spyOn(service.tagService, "delete").mockRejectedValue(error);
      await expect(() => service._deleteTagApi(tagToDeleteId)).rejects.toThrow(error);
    });
  });

  describe("::_deleteTagLocalStorage", () => {
    it("should delete the tag", async () => {
      expect.assertions(2);

      jest.spyOn(ResourceLocalStorage, "get").mockResolvedValue(resourcesCollectionDto);
      jest.spyOn(ResourceLocalStorage, "set");

      await service._deleteTagLocalStorage(tagToDeleteId);

      expect(ResourceLocalStorage.get).toHaveBeenCalled();
      expect(ResourceLocalStorage.set).toHaveBeenCalledWith(new ResourcesCollection(updatedResourcesCollectionDto));
    });

    it("should do nothing if the tag wasn't in any local resource", async () => {
      expect.assertions(1);

      jest.spyOn(ResourceLocalStorage, "get").mockResolvedValue(resourcesCollectionDto);
      jest.spyOn(ResourceLocalStorage, "set");

      await service._deleteTagLocalStorage(unrelatedTag.id);
      expect(ResourceLocalStorage.set).not.toHaveBeenCalled();
    });

    it("should throw an Error if the tagId parameter is not a valid uuid", async () => {
      expect.assertions(2);

      jest.spyOn(service.tagService, "delete");

      await expect(() => service._deleteTagLocalStorage("")).rejects.toThrow(Error);
      expect(service.tagService.delete).not.toHaveBeenCalled();
    });

    it("should throw a CollectionValidationError if the entity is malformed", async () => {
      expect.assertions(1);

      jest.spyOn(ResourceLocalStorage, "get").mockResolvedValue(defaultResourcesDtos(2, { id: null }));
      await expect(service._deleteTagLocalStorage(tagToDeleteId)).rejects.toThrow(CollectionValidationError);
    });

    it("should throw any error thrown by the underlying service when getting the values", async () => {
      expect.assertions(1);

      const error = new Error();
      jest.spyOn(ResourceLocalStorage, "get").mockRejectedValue(error);

      await expect(service._deleteTagLocalStorage(tagToDeleteId)).rejects.toThrow(error);
    });

    it("should throw any error thrown by the underlying service when setting the values", async () => {
      expect.assertions(1);

      const error = new Error();
      jest.spyOn(ResourceLocalStorage, "get").mockResolvedValue(resourcesCollectionDto);
      jest.spyOn(ResourceLocalStorage, "set").mockRejectedValue(error);

      await expect(service._deleteTagLocalStorage(tagToDeleteId)).rejects.toThrow(error);
    });
  });

  describe("::delete", () => {
    it("should delete the tag both in the api and the local storage", async () => {
      expect.assertions(3);

      jest.spyOn(service.tagService, "delete").mockResolvedValue(deleteResponse);
      jest.spyOn(ResourceLocalStorage, "get").mockResolvedValue(resourcesCollectionDto);
      jest.spyOn(ResourceLocalStorage, "set");

      await service.delete(tagToDeleteId);

      expect(service.tagService.delete).toHaveBeenCalledWith(tagToDeleteId);

      expect(ResourceLocalStorage.get).toHaveBeenCalled();
      expect(ResourceLocalStorage.set).toHaveBeenCalledWith(new ResourcesCollection(updatedResourcesCollectionDto));
    });

    it("should throw an error when given a malformed UUID", async () => {
      expect.assertions(1);
      await expect(() => service.delete("")).rejects.toThrow(Error);
    });

    it("should throw any error thrown by the underlying API service", async () => {
      expect.assertions(3);

      const error = new Error();
      jest.spyOn(service.tagService, "delete").mockRejectedValue(error);
      jest.spyOn(ResourceLocalStorage, "get");
      jest.spyOn(ResourceLocalStorage, "set");

      await expect(() => service.delete(tagToDeleteId)).rejects.toThrow(error);

      expect(ResourceLocalStorage.get).not.toHaveBeenCalled();
      expect(ResourceLocalStorage.set).not.toHaveBeenCalled();
    });

    it("should throw any error thrown by the underlying local storage get", async () => {
      expect.assertions(4);

      const error = new Error();
      jest.spyOn(service.tagService, "delete").mockResolvedValue(deleteResponse);

      jest.spyOn(ResourceLocalStorage, "get").mockRejectedValue(error);
      jest.spyOn(ResourceLocalStorage, "set");

      await expect(() => service.delete(tagToDeleteId)).rejects.toThrow(error);

      expect(service.tagService.delete).toHaveBeenCalledWith(tagToDeleteId);
      expect(ResourceLocalStorage.get).toHaveBeenCalled();
      expect(ResourceLocalStorage.set).not.toHaveBeenCalled();
    });

    it("should throw any error thrown by the underlying local storage set", async () => {
      expect.assertions(4);

      const error = new Error();
      jest.spyOn(service.tagService, "delete").mockResolvedValue(deleteResponse);

      jest.spyOn(ResourceLocalStorage, "get").mockResolvedValue(resourcesCollectionDto);
      jest.spyOn(ResourceLocalStorage, "set").mockRejectedValue(error);

      await expect(() => service.delete(tagToDeleteId)).rejects.toThrow(error);

      expect(service.tagService.delete).toHaveBeenCalledWith(tagToDeleteId);
      expect(ResourceLocalStorage.get).toHaveBeenCalled();
      expect(ResourceLocalStorage.set).toHaveBeenCalled();
    });
  });
});
