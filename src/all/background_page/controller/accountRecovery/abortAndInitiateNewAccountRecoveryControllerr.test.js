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
import AbortAndInitiateNewAccountRecoveryController from "./abortAndInitiateNewAccountRecoveryController";
import {mockApiResponse} from "../../../../../test/mocks/mockApiResponse";
import AccountAccountRecoveryEntity from "../../model/entity/account/accountAccountRecoveryEntity";
import {defaultAccountAccountRecoveryDto} from "../../model/entity/account/accountAccountRecoveryEntity.test.data";
import AccountLocalStorage from "../../service/local_storage/accountLocalStorage";

beforeEach(() => {
  enableFetchMocks();
});

describe("AbortAndInitiateNewAccountRecoveryController", () => {
  describe("AbortAndInitiateNewAccountRecoveryController::exec", () => {
    it("Should abort the current request and initiate a new one.", async() => {
      const accountRecovery = new AccountAccountRecoveryEntity(defaultAccountAccountRecoveryDto());
      await AccountLocalStorage.add(accountRecovery);
      const controller = new AbortAndInitiateNewAccountRecoveryController(null, null, defaultApiClientOptions(), accountRecovery);

      // Mock the abort API request response.
      const mockApiAbortFetch = fetch.doMockOnceIf(new RegExp(`/setup/recover/abort/${accountRecovery.userId}.json`), () => mockApiResponse());
      const mockApiHelpFetch = fetch.doMockOnceIf(new RegExp(`/users/recover.json`), () => mockApiResponse());

      expect.assertions(4);
      expect(await AccountLocalStorage.get()).toHaveLength(1);
      await controller.exec();
      expect(mockApiAbortFetch).toHaveBeenCalled();
      expect(mockApiHelpFetch).toHaveBeenCalled();
      expect(await AccountLocalStorage.get()).toHaveLength(0);
    });
  });
});
