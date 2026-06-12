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
 * @since         5.13.0
 */

import SubscriptionEntity from "passbolt-styleguide/src/shared/models/entity/subscription/subscriptionEntity";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import { mockSubscriptionUpdated } from "passbolt-styleguide/src/react-extension/components/Administration/DisplaySubscriptionKey/DisplaySubscriptionKey.test.data";

import CreateSubscriptionKeyController from "./createSubscriptionKeyController";
import PostLogoutService from "../../service/auth/postLogoutService";

describe("CreateSubscriptionKeyController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("::exec", () => {
    it("should create the subscription key and log the user out", async () => {
      expect.assertions(3);

      const controller = new CreateSubscriptionKeyController(null, null, defaultApiClientOptions());
      jest
        .spyOn(controller.createSubscriptionService, "create")
        .mockResolvedValue(new SubscriptionEntity(mockSubscriptionUpdated));
      jest.spyOn(PostLogoutService, "exec").mockImplementation(async () => {});

      const result = await controller.exec({ data: mockSubscriptionUpdated.data });

      expect(result).toEqual(new SubscriptionEntity(mockSubscriptionUpdated));
      expect(controller.createSubscriptionService.create).toHaveBeenCalledTimes(1);
      expect(PostLogoutService.exec).toHaveBeenCalledTimes(1);
    });

    it("should not catch errors", async () => {
      expect.assertions(2);

      const expectedError = new Error("Something went wrong!");
      const controller = new CreateSubscriptionKeyController(null, null, defaultApiClientOptions());
      jest.spyOn(controller.createSubscriptionService, "create").mockRejectedValue(expectedError);
      jest.spyOn(PostLogoutService, "exec").mockImplementation(async () => {});

      await expect(controller.exec({ data: mockSubscriptionUpdated.data })).rejects.toStrictEqual(expectedError);
      expect(PostLogoutService.exec).not.toHaveBeenCalled();
    });
  });
});
