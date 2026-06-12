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

import { enableFetchMocks } from "jest-fetch-mock";

import PassboltBadResponseError from "passbolt-styleguide/src/shared/lib/Error/PassboltBadResponseError";
import SubscriptionEntity from "passbolt-styleguide/src/shared/models/entity/subscription/subscriptionEntity";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import { mockSubscriptionUpdated } from "passbolt-styleguide/src/react-extension/components/Administration/DisplaySubscriptionKey/DisplaySubscriptionKey.test.data";

import { mockApiResponse } from "../../../../../../test/mocks/mockApiResponse";
import PassboltEditionApiService, { PASSBOLT_EDITION_API_SERVICE_RESOURCE_NAME } from "./passboltEditionApiService";

describe("PassboltEditionApiService", () => {
  /**
   * @type {PassboltEditionApiService}
   */
  let service;

  beforeEach(() => {
    enableFetchMocks();
    fetch.resetMocks();
    service = new PassboltEditionApiService(defaultApiClientOptions());
  });

  it("Should return the expected resource name", () => {
    expect(PassboltEditionApiService.RESOURCE_NAME).toEqual(PASSBOLT_EDITION_API_SERVICE_RESOURCE_NAME);
  });

  describe("::create", () => {
    it("Should POST the subscription key and return the response", async () => {
      expect.assertions(4);

      const subscriptionEntity = new SubscriptionEntity(mockSubscriptionUpdated);

      fetch.doMockOnceIf(new RegExp(`/${PASSBOLT_EDITION_API_SERVICE_RESOURCE_NAME}\\.json`), async () =>
        mockApiResponse(subscriptionEntity),
      );

      const result = await service.create({ data: mockSubscriptionUpdated.data });

      expect(fetch).toHaveBeenCalledTimes(1);

      const { method, body } = fetch.mock.calls[0][1];
      expect(method).toEqual("POST");
      expect(JSON.parse(body).data).toEqual(mockSubscriptionUpdated.data);

      expect(result).toEqual(subscriptionEntity.toDto());
    });

    it("Should throw an error if the response is not properly formatted", async () => {
      expect.assertions(2);

      fetch.doMockOnceIf(new RegExp(`/${PASSBOLT_EDITION_API_SERVICE_RESOURCE_NAME}\\.json`), async () => "wrong");

      await expect(service.create({ data: mockSubscriptionUpdated.data })).rejects.toBeInstanceOf(
        PassboltBadResponseError,
      );

      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("::delete", () => {
    it("Should DELETE the subscription key and resolve", async () => {
      expect.assertions(3);

      fetch.doMockOnceIf(new RegExp(`/${PASSBOLT_EDITION_API_SERVICE_RESOURCE_NAME}\\.json`), async () =>
        mockApiResponse({}),
      );

      await expect(service.delete()).resolves.not.toThrow();

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch.mock.calls[0][1].method).toEqual("DELETE");
    });

    it("Should throw an error if the response is not properly formatted", async () => {
      expect.assertions(2);

      fetch.doMockOnceIf(new RegExp(`/${PASSBOLT_EDITION_API_SERVICE_RESOURCE_NAME}\\.json`), async () => "wrong");

      await expect(service.delete()).rejects.toBeInstanceOf(PassboltBadResponseError);

      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });
});
