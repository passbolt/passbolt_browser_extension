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
 * @since         3.6.0
 */

import {enableFetchMocks} from "jest-fetch-mock";
import {defaultApiClientOptions} from "../../service/api/apiClient/apiClientOptions.test.data";
import {withSecurityTokenAccountRecoverDto} from "../../model/entity/account/accountRecoverEntity.test.data";
import RequestHelpCredentialsLostController from "./requestHelpCredentialsLostController";
import AccountEntity from "../../model/entity/account/accountEntity";
import {mockApiResponse} from "../../../../../test/mocks/mockApiResponse";

beforeEach(() => {
  enableFetchMocks();
});

describe("RequestHelpCredentialsLostController", () => {
  describe("RequestHelpCredentialsLostController::exec", () => {
    it("Should request help to an administrator.", async() => {
      const account = new AccountEntity(withSecurityTokenAccountRecoverDto());
      const controller = new RequestHelpCredentialsLostController(null, null, defaultApiClientOptions(), account);

      // Mock the API response.
      const mockApiFetch = fetch.doMockOnceIf(new RegExp('/users/recover.json'), () => mockApiResponse());

      await controller.exec();

      expect.assertions(1);
      // Expect the API to have been called.
      expect(mockApiFetch).toHaveBeenCalled();
    });
  });
});
