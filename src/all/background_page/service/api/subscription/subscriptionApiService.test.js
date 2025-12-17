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
enableFetchMocks();

import SubscriptionApiService, { SUBSCRIPTION_API_SERVICE_RESOURCE_NAME } from "./subscriptionApiService";
import { mockApiResponse } from "../../../../../../test/mocks/mockApiResponse";
import PassboltBadResponseError from "passbolt-styleguide/src/shared/lib/Error/PassboltBadResponseError";
import SubscriptionEntity from "../../../model/entity/subscription/subscriptionEntity";
import { API_CLIENT_OPTIONS, KEY_DTO } from "./subscriptionApiService.test.data";

describe("SubscriptionApiService", () => {
  /**
   * @type {SubscriptionApiService}
   */
  let service;

  beforeEach(() => {
    fetch.resetMocks();
    service = new SubscriptionApiService(API_CLIENT_OPTIONS);
  });

  it("Should return the expected resource name", () => {
    expect(SubscriptionApiService.RESOURCE_NAME).toEqual(SUBSCRIPTION_API_SERVICE_RESOURCE_NAME);
  });

  describe("::find", () => {
    it("Should get the key from the API", async () => {
      expect.assertions(2);

      const subscriptionEntity = new SubscriptionEntity(KEY_DTO);

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

      const newKey = "a new perfectly valid subscription key";
      const subscriptionEntity = new SubscriptionEntity({
        ...KEY_DTO,
        data: newKey,
      });

      fetch.doMockOnceIf(new RegExp(`/${SUBSCRIPTION_API_SERVICE_RESOURCE_NAME}/key`), async () =>
        mockApiResponse(subscriptionEntity),
      );

      const result = await service.update(newKey);
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
