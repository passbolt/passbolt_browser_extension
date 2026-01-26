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
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import { defaultResourceDto } from "passbolt-styleguide/src/shared/models/entity/resource/resourceEntity.test.data";

import TagsCollection from "../../model/entity/tag/tagsCollection";
import UpdateResourceTagsController from "./updateResourceTagsController";
import { defaultTagsCollectionDto } from "../../model/entity/tag/tagsCollection.test.data";

describe("UpdateResourceTagsController", () => {
  let resourceDto, tagsDto, tags, updatedResource;

  beforeEach(() => {
    jest.restoreAllMocks();

    resourceDto = defaultResourceDto();
    tagsDto = defaultTagsCollectionDto();
    tags = new TagsCollection(tagsDto);
    updatedResource = defaultResourceDto({
      ...resourceDto,
      tags: tagsDto,
    });
  });

  describe("::exec", () => {
    it("should update a resource's tags collection", async () => {
      expect.assertions(2);

      const controller = new UpdateResourceTagsController(null, null, defaultApiClientOptions());
      jest.spyOn(controller.updateResourceTagsService, "updateResourceTags").mockResolvedValue(updatedResource);

      const result = await controller.exec(resourceDto.id, tagsDto);

      expect(controller.updateResourceTagsService.updateResourceTags).toHaveBeenCalledWith(resourceDto.id, tags);
      expect(result).toEqual(updatedResource);
    });

    it("should throw an Error when resourceId is not an uuid", async () => {
      expect.assertions(2);

      const controller = new UpdateResourceTagsController(null, null, defaultApiClientOptions());
      jest.spyOn(controller.updateResourceTagsService, "updateResourceTags").mockResolvedValue(updatedResource);

      try {
        await controller.exec("", tagsDto);
      } catch (error) {
        expect(error).toEqual(new Error("The given parameter is not a valid UUID"));
      }

      expect(controller.updateResourceTagsService.updateResourceTags).not.toHaveBeenCalled();
    });

    it("should throw EntityValidationError if tagsDto is malformed", async () => {
      expect.assertions(2);

      const controller = new UpdateResourceTagsController(null, null, defaultApiClientOptions());
      jest.spyOn(controller.updateResourceTagsService, "updateResourceTags");

      try {
        await controller.exec(resourceDto.id, {});
      } catch (error) {
        expect(error).toBeInstanceOf(EntityValidationError);
      }

      expect(controller.updateResourceTagsService.updateResourceTags).not.toHaveBeenCalled();
    });

    it("should not catch errors", async () => {
      expect.assertions(1);

      const expectedError = new Error("Something went wrong!");
      const controller = new UpdateResourceTagsController(null, null, defaultApiClientOptions());
      jest.spyOn(controller.updateResourceTagsService, "updateResourceTags").mockRejectedValue(expectedError);

      try {
        await controller.exec(resourceDto.id, tagsDto);
      } catch (error) {
        expect(error).toStrictEqual(expectedError);
      }
    });
  });
});
