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
import {mockApiResponse} from "../../../../../test/mocks/mockApiResponse";
import GetOrganizationPolicyController from "./getOrganizationPolicyController";
import {enabledAccountRecoveryOrganizationPolicyDto} from "../../model/entity/accountRecovery/accountRecoveryOrganizationPolicyEntity.test.data";
import AccountRecoveryOrganizationPolicyEntity from "../../model/entity/accountRecovery/accountRecoveryOrganizationPolicyEntity";
import {defaultApiClientOptions} from "../../service/api/apiClient/apiClientOptions.test.data";

beforeEach(() => {
  enableFetchMocks();
});

describe("GetOrganizationPolicyController", () => {
  describe("GetOrganizationPolicyController::exec", () => {
    it("Should retrieve the account recovery organization policy.", async() => {
      // Mock API fetch account recovery organization policy response.
      const mockApiResult = enabledAccountRecoveryOrganizationPolicyDto();
      fetch.doMock(() => mockApiResponse(mockApiResult));

      const controller = new GetOrganizationPolicyController(null, null, defaultApiClientOptions());
      const accountRecoveryOrganizationPolicy = await controller.exec();

      expect.assertions(1);
      const accountRecoveryOrganizationPolicyDto = accountRecoveryOrganizationPolicy.toDto(AccountRecoveryOrganizationPolicyEntity.ALL_CONTAIN_OPTIONS);
      await expect(accountRecoveryOrganizationPolicyDto).toEqual(mockApiResult);
    });
  });
});
