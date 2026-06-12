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

import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import PassboltApiFetchError from "passbolt-styleguide/src/shared/lib/Error/PassboltApiFetchError";
import SubscriptionEntity from "passbolt-styleguide/src/shared/models/entity/subscription/subscriptionEntity";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import { mockSubscriptionUpdated } from "passbolt-styleguide/src/react-extension/components/Administration/DisplaySubscriptionKey/DisplaySubscriptionKey.test.data";

import CreateSubscriptionKeyService from "./createSubscriptionKeyService";
import PassboltSubscriptionError from "../../error/passboltSubscriptionError";
import UpdateSubscriptionEntity from "../../model/entity/subscription/update/updateSubscriptionEntity";

describe("CreateSubscriptionKeyService", () => {
  /**
   * @type {CreateSubscriptionKeyService}
   */
  let service;

  beforeEach(() => {
    enableFetchMocks();
    service = new CreateSubscriptionKeyService(defaultApiClientOptions());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("::create", () => {
    it("should create the subscription key and return it", async () => {
      expect.assertions(2);

      jest.spyOn(service.passboltEditionApiService, "create").mockResolvedValue(mockSubscriptionUpdated);

      const subscriptionKey = await service.create(
        new UpdateSubscriptionEntity({ data: mockSubscriptionUpdated.data }),
      );

      expect(subscriptionKey).toBeInstanceOf(SubscriptionEntity);
      expect(subscriptionKey._props.data).toEqual(mockSubscriptionUpdated.data);
    });

    it("should throw a TypeError if input is not an UpdateSubscriptionEntity", async () => {
      expect.assertions(1);

      await expect(service.create({ data: mockSubscriptionUpdated.data })).rejects.toThrow(
        new TypeError("subscriptionKeyEntity is not an UpdateSubscriptionEntity"),
      );
    });

    it("should throw a PassboltSubscriptionError", async () => {
      expect.assertions(2);

      const errorMessage = "an error occurred";
      const error = new PassboltApiFetchError(errorMessage, {
        code: 402,
        body: mockSubscriptionUpdated,
      });

      jest.spyOn(service.passboltEditionApiService, "create").mockRejectedValue(error);

      try {
        await service.create(new UpdateSubscriptionEntity({ data: mockSubscriptionUpdated.data }));
      } catch (error) {
        expect(error).toBeInstanceOf(PassboltSubscriptionError);
        expect(error.message).toEqual(errorMessage);
      }
    });

    it("should throw a EntityValidationError if the returned entity is missing required properties", async () => {
      expect.assertions(2);

      jest.spyOn(service.passboltEditionApiService, "create").mockResolvedValue({
        ...mockSubscriptionUpdated,
        expiry: undefined,
      });

      try {
        await service.create(new UpdateSubscriptionEntity({ data: mockSubscriptionUpdated.data }));
      } catch (error) {
        expect(error).toBeInstanceOf(EntityValidationError);
        expect(error.message).toEqual("Could not validate entity SubscriptionEntity.");
      }
    });

    it("should throw parent's error when payment is not required", async () => {
      expect.assertions(1);

      const error = new Error();

      jest.spyOn(service.passboltEditionApiService, "create").mockRejectedValue(error);

      await expect(
        service.create(new UpdateSubscriptionEntity({ data: mockSubscriptionUpdated.data })),
      ).rejects.toEqual(error);
    });
  });
});
