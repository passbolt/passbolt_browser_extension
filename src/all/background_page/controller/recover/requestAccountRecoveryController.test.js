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
import RequestAccountRecoveryController from "./requestAccountRecoveryController";
import AccountLocalStorage from "../../service/local_storage/accountLocalStorage";
import {defaultApiClientOptions} from "../../service/api/apiClient/apiClientOptions.test.data";
import {mockApiResponse} from "../../../../../test/mocks/mockApiResponse";
import {pendingAccountRecoveryRequestDto} from "../../model/entity/accountRecovery/accountRecoveryRequestEntity.test.data";
import AccountRecoverEntity from "../../model/entity/account/accountRecoverEntity";
import {withSecurityTokenAccountRecoverDto} from "../../model/entity/account/accountRecoverEntity.test.data";
import AccountAccountRecoveryEntity from "../../model/entity/account/accountAccountRecoveryEntity";

beforeEach(() => {
  enableFetchMocks();
});

describe("RequestAccountRecoveryController", () => {
  describe("RequestAccountRecoveryController::exec", () => {
    it("Should initiate an account recovery from the recover journey.", async() => {
      const account = new AccountRecoverEntity(withSecurityTokenAccountRecoverDto());
      const controller = new RequestAccountRecoveryController(null, defaultApiClientOptions(), null, account);

      // Mock the API response.
      const mockApiResponseDto = pendingAccountRecoveryRequestDto();
      const mockApiFetch = fetch.doMockOnce(() => mockApiResponse(mockApiResponseDto));

      await controller.exec();

      expect.assertions(3);
      // Expect the API to have been called.
      expect(mockApiFetch).toHaveBeenCalled();
      // Expect the temporary account created in the local storage.
      const accountForAccountRecovery = await AccountLocalStorage.getAccountByUserIdAndType(account.userId, AccountAccountRecoveryEntity.TYPE_ACCOUNT_ACCOUNT_RECOVERY);
      expect(accountForAccountRecovery).not.toBeUndefined();
      // Expect the account being recovered to contain the expected information.
      const expectedAccountDto = {
        type: AccountAccountRecoveryEntity.TYPE_ACCOUNT_ACCOUNT_RECOVERY,
        domain: account.domain,
        user_id: account.userId,
        user_key_fingerprint: account.userKeyFingerprint,
        user_public_armored_key: account.userPublicArmoredKey,
        server_public_armored_key: account.serverPublicArmoredKey,
        username: account.username,
        first_name: account.firstName,
        last_name: account.lastName,
        user_private_armored_key: account.userPrivateArmoredKey,
        authentication_token_token: account.authenticationTokenToken,
        security_token: account.securityToken.toDto(),
        account_recovery_request_id: mockApiResponseDto.id
      };
      expect(accountForAccountRecovery).toEqual(expectedAccountDto);
    });
  });
});
