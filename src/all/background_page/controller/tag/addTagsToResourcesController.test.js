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
import { defaultTagsDtos } from "passbolt-styleguide/src/shared/models/entity/tag/tagCollection.test.data";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import { defaultResourceDto } from "passbolt-styleguide/src/shared/models/entity/resource/resourceEntity.test.data";
import CollectionValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/collectionValidationError";

import TagsCollection from "../../model/entity/tag/tagsCollection";
import AddTagsToResourcesController from "./addTagsToResourcesController";
import ResourcesCollection from "../../model/entity/resource/resourcesCollection";

describe("AddTagsToResourcesController", () => {
  let resourcesDto, resourceIds, tagsDto, tags, updatedResources;

  beforeEach(() => {
    jest.restoreAllMocks();

    resourcesDto = [defaultResourceDto(), defaultResourceDto(), defaultResourceDto()];
    resourceIds = resourcesDto.map((resource) => resource.id);
    tagsDto = defaultTagsDtos();
    tags = new TagsCollection(tagsDto);
    updatedResources = new ResourcesCollection(
      resourcesDto.map((resource) => ({
        ...resource,
        tags: tagsDto,
      })),
    );
  });

  describe("::exec", () => {
    it("should add tags to resources", async () => {
      expect.assertions(2);

      const controller = new AddTagsToResourcesController(null, null, defaultApiClientOptions());
      jest.spyOn(controller.updateResourceTagsService, "addTagsToResources").mockResolvedValue(updatedResources);
      jest.spyOn(controller.progressService, "start").mockImplementation(() => {});
      jest.spyOn(controller.progressService, "finishStep").mockImplementation(() => {});
      jest.spyOn(controller.progressService, "close").mockImplementation(() => {});

      const result = await controller.exec(resourceIds, tagsDto);

      expect(controller.updateResourceTagsService.addTagsToResources).toHaveBeenCalledWith(
        resourceIds,
        tags,
        expect.any(Object),
      );
      expect(result).toEqual(updatedResources);
    });

    it("should throw TypeError when resourceIds is not an Array", async () => {
      expect.assertions(2);

      const controller = new AddTagsToResourcesController(null, null, defaultApiClientOptions());
      jest.spyOn(controller.updateResourceTagsService, "addTagsToResources");
      jest.spyOn(controller.progressService, "start").mockImplementation(() => {});
      jest.spyOn(controller.progressService, "close").mockImplementation(() => {});

      await expect(() => controller.exec("not-an-array", tagsDto)).rejects.toThrow(
        new TypeError("resourceIds is not an Array"),
      );
      expect(controller.updateResourceTagsService.addTagsToResources).not.toHaveBeenCalled();
    });

    it("should throw Error when any resourceId is not a valid UUID", async () => {
      expect.assertions(2);

      const controller = new AddTagsToResourcesController(null, null, defaultApiClientOptions());
      jest.spyOn(controller.updateResourceTagsService, "addTagsToResources");
      jest.spyOn(controller.progressService, "start").mockImplementation(() => {});
      jest.spyOn(controller.progressService, "close").mockImplementation(() => {});

      await expect(() => controller.exec(["invalid-uuid", ...resourceIds], tagsDto)).rejects.toThrow(
        new Error("The given parameter is not a valid UUID"),
      );
      expect(controller.updateResourceTagsService.addTagsToResources).not.toHaveBeenCalled();
    });

    it("should throw TypeError when tagsDto is not an Array", async () => {
      expect.assertions(2);

      const controller = new AddTagsToResourcesController(null, null, defaultApiClientOptions());
      jest.spyOn(controller.updateResourceTagsService, "addTagsToResources");
      jest.spyOn(controller.progressService, "start").mockImplementation(() => {});
      jest.spyOn(controller.progressService, "close").mockImplementation(() => {});

      await expect(() => controller.exec(resourceIds, {})).rejects.toThrow(new TypeError("tagsDto is not an Array"));
      expect(controller.updateResourceTagsService.addTagsToResources).not.toHaveBeenCalled();
    });

    it("should throw CollectionValidationError if tagsDto is malformed", async () => {
      expect.assertions(2);

      const controller = new AddTagsToResourcesController(null, null, defaultApiClientOptions());
      jest.spyOn(controller.updateResourceTagsService, "addTagsToResources");
      jest.spyOn(controller.progressService, "start").mockImplementation(() => {});
      jest.spyOn(controller.progressService, "finishStep").mockImplementation(() => {});
      jest.spyOn(controller.progressService, "close").mockImplementation(() => {});

      await expect(() => controller.exec(resourceIds, [{ id: null }])).rejects.toThrow(CollectionValidationError);
      expect(controller.updateResourceTagsService.addTagsToResources).not.toHaveBeenCalled();
    });

    it("should not catch errors from service", async () => {
      expect.assertions(1);

      const expectedError = new Error("Something went wrong!");
      const controller = new AddTagsToResourcesController(null, null, defaultApiClientOptions());
      jest.spyOn(controller.updateResourceTagsService, "addTagsToResources").mockRejectedValue(expectedError);
      jest.spyOn(controller.progressService, "start").mockImplementation(() => {});
      jest.spyOn(controller.progressService, "finishStep").mockImplementation(() => {});
      jest.spyOn(controller.progressService, "close").mockImplementation(() => {});

      await expect(() => controller.exec(resourceIds, tagsDto)).rejects.toThrow(expectedError);
    });

    it("should close progressService in case of success", async () => {
      expect.assertions(1);

      const controller = new AddTagsToResourcesController(null, null, defaultApiClientOptions());
      jest.spyOn(controller.updateResourceTagsService, "addTagsToResources").mockResolvedValue(updatedResources);
      jest.spyOn(controller.progressService, "start").mockImplementation(() => {});
      jest.spyOn(controller.progressService, "finishStep").mockImplementation(() => {});
      jest.spyOn(controller.progressService, "close").mockImplementation(() => {});

      await controller.exec(resourceIds, tagsDto);

      expect(controller.progressService.close).toHaveBeenCalledTimes(1);
    });

    it("should close progressService in case of error", async () => {
      expect.assertions(1);

      const expectedError = new Error("Something went wrong!");
      const controller = new AddTagsToResourcesController(null, null, defaultApiClientOptions());
      jest.spyOn(controller.updateResourceTagsService, "addTagsToResources").mockRejectedValue(expectedError);
      jest.spyOn(controller.progressService, "start").mockImplementation(() => {});
      jest.spyOn(controller.progressService, "finishStep").mockImplementation(() => {});
      jest.spyOn(controller.progressService, "close").mockImplementation(() => {});

      try {
        await controller.exec(resourceIds, tagsDto);
      } catch {
        expect(controller.progressService.close).toHaveBeenCalledTimes(1);
      }
    });
  });
});
