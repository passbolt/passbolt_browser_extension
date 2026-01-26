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

import DeleteTagController from "./deleteTagController";
import { defaultTagDto } from "../../model/entity/tag/tagEntity.test.data";

describe("DeleteTagController", () => {
  let tagDto;

  beforeEach(() => {
    jest.restoreAllMocks();
    tagDto = defaultTagDto();
  });

  describe("::exec", () => {
    it("should find the tags", async () => {
      expect.assertions(1);

      const controller = new DeleteTagController(null, null, defaultApiClientOptions());
      jest.spyOn(controller.deleteTagService, "delete").mockResolvedValue();

      await controller.exec(tagDto.id);
      expect(controller.deleteTagService.delete).toHaveBeenCalledTimes(1);
    });

    it("should throw an Error if tagId is not a valid uuid", async () => {
      expect.assertions(1);

      const controller = new DeleteTagController(null, null, defaultApiClientOptions());
      try {
        await controller.exec("");
      } catch (error) {
        expect(error).toEqual(new Error("The given parameter is not a valid UUID"));
      }
    });

    it("should not catch errors", async () => {
      expect.assertions(1);

      const expectedError = new Error("Something went wrong!");
      const controller = new DeleteTagController(null, null, defaultApiClientOptions());
      jest.spyOn(controller.deleteTagService, "delete").mockRejectedValue(expectedError);

      try {
        await controller.exec(tagDto.id);
      } catch (error) {
        expect(error).toStrictEqual(expectedError);
      }
    });
  });
});
