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

import SubscriptionEntity from "passbolt-styleguide/src/shared/models/entity/subscription/subscriptionEntity";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import { mockSubscriptionUpdated } from "passbolt-styleguide/src/react-extension/components/Administration/DisplaySubscriptionKey/DisplaySubscriptionKey.test.data";

import UpdateSubscriptionKeyController from "./updateSubscriptionKeyController";

describe("UpdteSubscriptionKeyController", () => {
  describe("::exec", () => {
    it("should update the subscription key", async () => {
      expect.assertions(2);

      const controller = new UpdateSubscriptionKeyController(null, null, defaultApiClientOptions());
      jest
        .spyOn(controller.updateSubscriptionService, "update")
        .mockResolvedValue(new SubscriptionEntity(mockSubscriptionUpdated));

      const result = await controller.exec({ data: mockSubscriptionUpdated.data });

      expect(result).toEqual(new SubscriptionEntity(mockSubscriptionUpdated));
      expect(controller.updateSubscriptionService.update).toHaveBeenCalledTimes(1);
    });

    it("should not catch errors", async () => {
      expect.assertions(1);

      const expectedError = new Error("Something went wrong!");
      const controller = new UpdateSubscriptionKeyController(null, null, defaultApiClientOptions());
      jest.spyOn(controller.updateSubscriptionService, "update").mockRejectedValue(expectedError);

      await expect(controller.exec({ data: mockSubscriptionUpdated.data })).rejects.toStrictEqual(expectedError);
    });
  });
});
