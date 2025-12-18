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
 * @since         5.9.0
 */

import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import UpdateSubscriptionKeyController from "./updateSubscriptionKeyController";
import { NEW_KEY_DTO, UPDATED_KEY_DTO } from "./updateSubscriptionKeyController.test.data";

describe("UpdteSubscriptionKeyController", () => {
  describe("::exec", () => {
    it("should update the subscription key", async () => {
      expect.assertions(2);

      const controller = new UpdateSubscriptionKeyController(null, null, defaultApiClientOptions());
      jest.spyOn(controller.updateSubscriptionService, "update").mockResolvedValue(UPDATED_KEY_DTO);

      const result = await controller.exec(NEW_KEY_DTO);

      expect(result).toEqual(UPDATED_KEY_DTO);
      expect(controller.updateSubscriptionService.update).toHaveBeenCalledTimes(1);
    });

    it("should not catch errors", async () => {
      expect.assertions(1);

      const expectedError = new Error("Something went wrong!");
      const controller = new UpdateSubscriptionKeyController(null, null, defaultApiClientOptions());
      jest.spyOn(controller.updateSubscriptionService, "update").mockRejectedValue(expectedError);

      await expect(controller.exec(NEW_KEY_DTO)).rejects.toStrictEqual(expectedError);
    });
  });
});
