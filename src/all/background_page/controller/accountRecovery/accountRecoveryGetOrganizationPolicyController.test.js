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

import {v4 as uuidv4} from "uuid";
import {enableFetchMocks} from "jest-fetch-mock";
import {Worker} from "../../sdk/worker";
import {AccountRecoveryGetOrganizationPolicyController} from "./accountRecoveryGetOrganizationPolicyController";
import {ApiClientOptions} from "../../service/api/apiClient/apiClientOptions";
import {defaultAccountRecoveryOrganizationPolicyDto} from "../../model/entity/accountRecovery/accountRecoveryOrganizationPolicyEntity.test.data";
import {AccountRecoveryOrganizationPolicyEntity} from "../../model/entity/accountRecovery/accountRecoveryOrganizationPolicyEntity";

beforeEach(() => {
  enableFetchMocks();
});

describe("AccountRecoveryGetOrganizationPolicyController", () => {
  describe("AccountRecoveryGetOrganizationPolicyController::exec", () => {
    it("Should retrieve the account recovery organization policy.", async() => {
      const mockPort = {};
      const mockWorker = new Worker(mockPort);
      const requestId = uuidv4();
      const apiClientOptions = (new ApiClientOptions()).setBaseUrl("https://localhost");
      const controller = new AccountRecoveryGetOrganizationPolicyController(mockWorker, requestId, apiClientOptions);

      // Mock API responses
      const mockFetchRequestUrl = `${apiClientOptions.baseUrl}/account-recovery/organization-policies.json*`;
      const mockFetchRequestResult = defaultAccountRecoveryOrganizationPolicyDto();
      fetch.doMockOnceIf(new RegExp(mockFetchRequestUrl), JSON.stringify({header: {}, body: mockFetchRequestResult}));

      const accountRecoveryOrganizationPolicy = await controller.exec();
      const accountRecoveryOrganizationPolicyDto = accountRecoveryOrganizationPolicy.toDto(AccountRecoveryOrganizationPolicyEntity.ALL_CONTAIN_OPTIONS);

      expect.assertions(1);
      await expect(accountRecoveryOrganizationPolicyDto).toEqual(mockFetchRequestResult);
    });
  });
});
