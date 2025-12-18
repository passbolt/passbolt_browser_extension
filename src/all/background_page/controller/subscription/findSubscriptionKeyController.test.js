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

import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import FindSubscriptionKeyController from "./findSubscriptionKeyController";
import SubscriptionEntity from '../../model/entity/subscription/subscriptionEntity';
import {KEY_DTO} from './findSubscriptionKeyController.test.data';

beforeEach(() => {
  jest.restoreAllMocks();
});

describe("FindSubscriptionKeyController", () => {
  describe("::exec", () => {
    it("should find subscription key", async() => {
      expect.assertions(2);

      const entity = new SubscriptionEntity(KEY_DTO);
      const controller = new FindSubscriptionKeyController(null, null, defaultApiClientOptions());
      jest.spyOn(controller.findSubscriptionService, "find").mockResolvedValue(entity);

      const result = await controller.exec();

      expect(result).toEqual(entity);
      expect(controller.findSubscriptionService.find).toHaveBeenCalledTimes(1);
    });

    it("should not catch errors", async() => {
      expect.assertions(1);

      const expectedError = new Error("Something went wrong!");
      const controller = new FindSubscriptionKeyController(null, null, defaultApiClientOptions());
      jest.spyOn(controller.findSubscriptionService, "find").mockRejectedValue(expectedError);

      await expect(controller.exec()).rejects.toStrictEqual(expectedError);
    });
  });
});
