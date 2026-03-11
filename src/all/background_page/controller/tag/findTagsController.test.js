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
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";

import FindTagsController from "./findTagsController";
import TagEntity from "../../model/entity/tag/tagEntity";
import TagsCollection from "../../model/entity/tag/tagsCollection";
import { defaultTagDto, sharedTagDto } from "../../model/entity/tag/tagEntity.test.data";

beforeEach(() => {
  jest.restoreAllMocks();
});

describe("FindTagsController", () => {
  const tag1 = new TagEntity(defaultTagDto()),
    tag2 = new TagEntity(sharedTagDto()),
    tagsCollection = new TagsCollection([tag1, tag2]);

  describe("::exec", () => {
    it("should find the tags", async () => {
      expect.assertions(2);

      const controller = new FindTagsController(null, null, defaultApiClientOptions());
      jest.spyOn(controller.findTagsService, "findAll").mockResolvedValue(tagsCollection);

      const result = await controller.exec();

      expect(controller.findTagsService.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(tagsCollection);
    });

    it("should not catch errors", async () => {
      expect.assertions(1);

      const expectedError = new Error("Something went wrong!");
      const controller = new FindTagsController(null, null, defaultApiClientOptions());
      jest.spyOn(controller.findTagsService, "findAll").mockRejectedValue(expectedError);

      await expect(() => controller.exec()).rejects.toThrow(expectedError);
    });
  });
});
