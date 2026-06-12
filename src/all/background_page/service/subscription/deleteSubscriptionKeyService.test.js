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

import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";

import DeleteSubscriptionKeyService from "./deleteSubscriptionKeyService";

describe("DeleteSubscriptionKeyService", () => {
  /**
   * @type {DeleteSubscriptionKeyService}
   */
  let service;

  beforeEach(() => {
    enableFetchMocks();
    service = new DeleteSubscriptionKeyService(defaultApiClientOptions());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("::delete", () => {
    it("should call the API service delete once and resolve to undefined", async () => {
      expect.assertions(2);

      jest.spyOn(service.passboltEditionApiService, "delete").mockResolvedValue();

      await expect(service.delete()).resolves.toBeUndefined();
      expect(service.passboltEditionApiService.delete).toHaveBeenCalledTimes(1);
    });

    it("should propagate errors from the API service unchanged", async () => {
      expect.assertions(1);

      const error = new Error("an error occurred");
      jest.spyOn(service.passboltEditionApiService, "delete").mockRejectedValue(error);

      await expect(service.delete()).rejects.toEqual(error);
    });
  });
});
