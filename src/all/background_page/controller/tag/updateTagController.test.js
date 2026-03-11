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

import { defaultTagDto } from "../../model/entity/tag/tagEntity.test.data";
import TagEntity from "../../model/entity/tag/tagEntity";
import UpdateTagController from "./updateTagController";

describe("UpdateTagController", () => {
  let tagDto, tag;

  beforeEach(() => {
    jest.restoreAllMocks();

    tagDto = defaultTagDto();
    tag = new TagEntity(tagDto);
  });

  describe("::exec", () => {
    it("should update a tag", async () => {
      expect.assertions(2);

      const controller = new UpdateTagController(null, null, defaultApiClientOptions());
      jest.spyOn(controller.updateTagService, "update").mockResolvedValue(tag);

      const result = await controller.exec(tagDto);

      expect(controller.updateTagService.update).toHaveBeenCalledWith(tag);
      expect(result).toEqual(tag);
    });

    it("should throw EntityValidationError if provided dto is malformed", async () => {
      expect.assertions(2);

      const controller = new UpdateTagController(null, null, defaultApiClientOptions());
      jest.spyOn(controller.updateTagService, "update").mockResolvedValue(tag);

      try {
        await controller.exec(defaultTagDto({ id: null }));
      } catch (error) {
        expect(error).toBeInstanceOf(EntityValidationError);
      }

      expect(controller.updateTagService.update).not.toHaveBeenCalled();
    });

    it("should not catch errors", async () => {
      expect.assertions(1);

      const expectedError = new Error("Something went wrong!");
      const controller = new UpdateTagController(null, null, defaultApiClientOptions());
      jest.spyOn(controller.updateTagService, "update").mockRejectedValue(expectedError);

      try {
        await controller.exec(tagDto);
      } catch (error) {
        expect(error).toStrictEqual(expectedError);
      }
    });
  });
});
