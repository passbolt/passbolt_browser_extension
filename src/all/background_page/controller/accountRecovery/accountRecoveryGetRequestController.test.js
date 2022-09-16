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
import {defaultApiClientOptions} from "../../service/api/apiClient/apiClientOptions.test.data";
import {pendingAccountRecoveryRequestDto} from "../../model/entity/accountRecovery/accountRecoveryRequestEntity.test.data";
import AccountRecoveryGetRequestController from "./accountRecoveryGetRequestController";
import AccountRecoveryRequestEntity from "../../model/entity/accountRecovery/accountRecoveryRequestEntity";

beforeEach(() => {
  enableFetchMocks();
});

describe("AccountRecoveryGetRequestController", () => {
  describe("AccountRecoveryGetRequestController::exec", () => {
    it("Should retrieve an account recovery request.", async() => {
      // Mock API fetch account recovery organization policy response.
      const mockApiResult = pendingAccountRecoveryRequestDto();
      fetch.doMock(() => mockApiResponse(mockApiResult));

      const controller = new AccountRecoveryGetRequestController(null, null, defaultApiClientOptions());
      const accountRecoveryRequest = await controller.exec(mockApiResult.id);

      expect.assertions(1);
      const accountRecoveryRequestDto = accountRecoveryRequest.toDto(AccountRecoveryRequestEntity.ALL_CONTAIN_OPTIONS);
      await expect(accountRecoveryRequestDto).toEqual(mockApiResult);
    });

    it("Should throw an error if the account recovery request id is not a valid.", async() => {
      // Mock API fetch account recovery organization policy response.
      const mockApiResult = pendingAccountRecoveryRequestDto();
      fetch.doMock(() => mockApiResponse(mockApiResult));

      const controller = new AccountRecoveryGetRequestController(null, null, defaultApiClientOptions());

      expect.assertions(3);
      const promiseMissingParameter = controller.exec();
      await expect(promiseMissingParameter).rejects.toThrowError("An account recovery request id is required");
      const promiseInvalidTypeParameter = controller.exec(2);
      await expect(promiseInvalidTypeParameter).rejects.toThrowError("The account recovery request should be a string.");
      const promiseNotValidUuid = controller.exec("not-a-valid-uuid");
      await expect(promiseNotValidUuid).rejects.toThrowError("The account recovery request should be a valid uuid.");
    });
  });
});
