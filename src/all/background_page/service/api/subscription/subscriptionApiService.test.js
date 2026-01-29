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
 * @since         5.8.0
 */
import { enableFetchMocks } from "jest-fetch-mock";

import {
  mockSubscription,
  mockSubscriptionUpdated,
} from "passbolt-styleguide/src/react-extension/components/Administration/DisplaySubscriptionKey/DisplaySubscriptionKey.test.data";
import PassboltBadResponseError from "passbolt-styleguide/src/shared/lib/Error/PassboltBadResponseError";
import SubscriptionEntity from "passbolt-styleguide/src/shared/models/entity/subscription/subscriptionEntity";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";

import SubscriptionApiService, { SUBSCRIPTION_API_SERVICE_RESOURCE_NAME } from "./subscriptionApiService";
import { mockApiResponse } from "../../../../../../test/mocks/mockApiResponse";

describe("SubscriptionApiService", () => {
  /**
   * @type {SubscriptionApiService}
   */
  let service;

  beforeEach(() => {
    enableFetchMocks();
    fetch.resetMocks();
    service = new SubscriptionApiService(defaultApiClientOptions());
  });

  it("Should return the expected resource name", () => {
    expect(SubscriptionApiService.RESOURCE_NAME).toEqual(SUBSCRIPTION_API_SERVICE_RESOURCE_NAME);
  });

  describe("::find", () => {
    it("Should get the key from the API", async () => {
      expect.assertions(2);

      const subscriptionEntity = new SubscriptionEntity(mockSubscription);

      fetch.doMockOnceIf(new RegExp(`/${SUBSCRIPTION_API_SERVICE_RESOURCE_NAME}/key`), async () =>
        mockApiResponse(subscriptionEntity),
      );

      const result = await service.find();
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(result).toEqual(subscriptionEntity.toDto());
    });

    it("Should throw an error if the response is not properly formatted", async () => {
      expect.assertions(2);

      fetch.doMockOnceIf(new RegExp(`/${SUBSCRIPTION_API_SERVICE_RESOURCE_NAME}/key`), async () => "wrong");

      await expect(service.find()).rejects.toBeInstanceOf(PassboltBadResponseError);
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("::update", () => {
    it("Should get update the key", async () => {
      expect.assertions(2);

      const subscriptionEntity = new SubscriptionEntity(mockSubscriptionUpdated);

      fetch.doMockOnceIf(new RegExp(`/${SUBSCRIPTION_API_SERVICE_RESOURCE_NAME}/key`), async () =>
        mockApiResponse(subscriptionEntity),
      );

      const result = await service.update(mockSubscriptionUpdated.data);
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(result).toEqual(subscriptionEntity.toDto());
    });

    it("Should throw an error if the response is not properly formatted", async () => {
      expect.assertions(2);

      fetch.doMockOnceIf(new RegExp(`/${SUBSCRIPTION_API_SERVICE_RESOURCE_NAME}/key`), async () => "wrong");

      await expect(service.update("new key")).rejects.toBeInstanceOf(PassboltBadResponseError);
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });
});
