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
import ActivateSsoConfigurationController from "./activateSsoConfigurationController";
import {defaultApiClientOptions} from "../../service/api/apiClient/apiClientOptions.test.data";

beforeEach(() => {
  enableFetchMocks();
});

describe("ActivateSsoConfigurationController", () => {
  describe("AccountRecoveryGetRequestController::exec", () => {
    it("Should activate the given SSO configuration.", async() => {
      expect.assertions(1);
      const ssoDraftConfigurationId = uuid();
      const ssoToken = uuid();

      fetch.doMockOnceIf(new RegExp(`/sso/settings/${ssoDraftConfigurationId}.json`), async req => {
        const request = JSON.parse(await req.text());
        expect(request).toStrictEqual({
          status: "active",
          token: ssoToken
        });
        return mockApiResponse([]);
      });

      const controller = new ActivateSsoConfigurationController(null, null, defaultApiClientOptions());
      await controller.exec(ssoDraftConfigurationId, ssoToken);
    });

    it("Should throw an error if the SSO configuration id is not a valid uuid.", async() => {
      expect.assertions(1);
      const ssoDraftConfigurationId = "not a uuid";
      const ssoToken = uuid();

      const controller = new ActivateSsoConfigurationController(null, null, defaultApiClientOptions());
      try {
        await controller.exec(ssoDraftConfigurationId, ssoToken);
      } catch (e) {
        expect(e).toStrictEqual(new TypeError('The SSO configuration id should be a valid uuid.'));
      }
    });

    it("Should throw an error if the SSO activation token is not a valid uuid.", async() => {
      expect.assertions(1);
      const ssoDraftConfigurationId = uuid();
      const ssoToken = "not a uuid";

      const controller = new ActivateSsoConfigurationController(null, null, defaultApiClientOptions());
      try {
        await controller.exec(ssoDraftConfigurationId, ssoToken);
      } catch (e) {
        expect(e).toStrictEqual(new TypeError('The SSO activation token should be a valid uuid.'));
      }
    });
  });
});
