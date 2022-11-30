/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.9.0
 */
import {enableFetchMocks} from "jest-fetch-mock";
import {v4 as uuid} from "uuid";
import {mockApiResponse} from "../../../../../test/mocks/mockApiResponse";
import {defaultApiClientOptions} from "../../service/api/apiClient/apiClientOptions.test.data";
import DeleteSsoConfigurationController from "./deleteSsoConfigurationController";

beforeEach(() => {
  enableFetchMocks();
  jest.clearAllMocks();
});

describe("DeleteSsoConfigurationController", () => {
  describe("DeleteSsoConfigurationController::exec", () => {
    it("Should delete the given configuration.", async() => {
      expect.assertions(1);

      const configurationId = uuid();

      fetch.doMockOnceIf(new RegExp(`/sso/settings/${configurationId}.json`), async req => {
        expect(req.url).toBe(`https://localhost//sso/settings/${configurationId}.json?api-version=v2`);
        return mockApiResponse({});
      });

      const controller = new DeleteSsoConfigurationController(null, null, defaultApiClientOptions());
      await controller.exec(configurationId);
    });

    it("Should throw the given configuration.", async() => {
      expect.assertions(1);

      const controller = new DeleteSsoConfigurationController(null, null, defaultApiClientOptions());
      try {
        await controller.exec("fake id");
      } catch (e) {
        expect(e).toStrictEqual(new Error("A valid SSO settings id is required."));
      }
    });
  });
});
