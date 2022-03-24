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
import {RecoverInitiateAccountRecoveryRequestController} from "./recoverInitiateAccountRecoveryRequestController";
import {AccountLocalStorage} from "../../service/local_storage/accountLocalStorage";
import {AccountEntity} from "../../model/entity/account/accountEntity";
import {SetupEntity} from "../../model/entity/setup/setupEntity";
import {
  step0SetupRequestInitializedDto,
  step3SetupSecurityTokenDto
} from "../../model/entity/setup/SetupEntity.test.data";
import MockStorage from "../../sdk/storage.test.mock";
import {defaultApiClientOptions} from "../../service/api/apiClient/apiClientOptions.test.data";
import {mockApiResponse} from "../../../tests/mocks/mockApiResponse";
import {defaultAccountRecoveryRequestDto} from "../../model/entity/accountRecovery/accountRecoveryRequestEntity.test.data";

beforeEach(() => {
  window.browser = Object.assign({}, {storage: new MockStorage()}); // Required by local storage
  enableFetchMocks();
});

describe("RecoverInitiateAccountRecoveryRequestController", () => {
  describe("RecoverInitiateAccountRecoveryRequestController::exec", () => {
    it("Should assert the setup entity contains the data required to create an account recovery request.", async() => {
      const setupEntity = new SetupEntity(step0SetupRequestInitializedDto());
      const controller = new RecoverInitiateAccountRecoveryRequestController(null, defaultApiClientOptions(), null, setupEntity);

      expect.assertions(4);
      try {
        await controller.exec();
      } catch (error) {
        expect(error.message).toEqual("Could not validate entity AccountRecoveryRequestCreate.");
        expect(error.details).not.toBeUndefined();
        expect(error.details.armored_key).not.toBeUndefined();
        expect(error.details.fingerprint).not.toBeUndefined();
      }
    });

    it("Should assert setupEntity contains data to create an account.", async() => {
      const setupEntity = new SetupEntity(step3SetupSecurityTokenDto());
      const controller = new RecoverInitiateAccountRecoveryRequestController(null, defaultApiClientOptions(), null, setupEntity);

      // Mock the API response.
      const mockApiResponseDto = defaultAccountRecoveryRequestDto();
      const mockApiFetch = fetch.doMockOnce(() => mockApiResponse(mockApiResponseDto));

      expect.assertions(14);
      await controller.exec();

      // Expect the API to have been called.
      expect(mockApiFetch).toHaveBeenCalled();
      // Expect the temporary account created in the local storage.
      const accountForAccountRecovery = await AccountLocalStorage.getAccountByUserIdAndType(setupEntity.userId, AccountEntity.TYPE_ACCOUNT_RECOVERY);
      expect(accountForAccountRecovery).not.toBeUndefined();
      // Expect the temporary account to contain the expected information.
      const expectedAccountDto = {...setupEntity.toAccountRecoveryAccountDto(), account_recovery_request_id: mockApiResponseDto.id};
      expect(accountForAccountRecovery.type).toEqual(AccountEntity.TYPE_ACCOUNT_RECOVERY);
      expect(accountForAccountRecovery.domain).toBeTruthy();
      expect(accountForAccountRecovery.user_id).toBeTruthy();
      expect(accountForAccountRecovery.authentication_token_token).toBeTruthy();
      expect(accountForAccountRecovery.user_public_armored_key).toBeTruthy();
      expect(accountForAccountRecovery.user_private_armored_key).toBeTruthy();
      expect(accountForAccountRecovery.server_public_armored_key).toBeTruthy();
      expect(accountForAccountRecovery.account_recovery_request_id).toBeTruthy();
      expect(accountForAccountRecovery.user).toBeTruthy();
      expect(accountForAccountRecovery.user.profile).toBeTruthy();
      expect(accountForAccountRecovery.security_token).toBeTruthy();
      expect(accountForAccountRecovery).toEqual(expect.objectContaining(expectedAccountDto));
    });
  });
});
