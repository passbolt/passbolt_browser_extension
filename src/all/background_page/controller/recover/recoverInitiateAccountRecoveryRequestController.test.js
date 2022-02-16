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
import {enableFetchMocks} from 'jest-fetch-mock';
import {Worker} from "../../sdk/worker";
import {RecoverInitiateAccountRecoveryRequestController} from "./recoverInitiateAccountRecoveryRequestController";
import {AccountLocalStorage} from "../../service/local_storage/accountLocalStorage";
import {AccountEntity} from "../../model/entity/account/accountEntity";
import {SetupEntity} from "../../model/entity/setup/setupEntity";
import {
  step0SetupRequestInitializedDto,
  step3SetupSecurityTokenDto
} from "../../model/entity/setup/SetupEntity.test.data";
import MockStorage from "../../sdk/storage.test.mock";

beforeEach(() => {
  window.browser = Object.assign({}, {storage: new MockStorage()}); // Required by local storage
  enableFetchMocks();
});

describe("RecoverInitiateAccountRecoveryRequestController", () => {
  describe("RecoverInitiateAccountRecoveryRequestController::exec", () => {
    it("Should assert setupEntity contains required data.", async() => {
      const mockPort = {};
      const mockWorker = new Worker(mockPort);
      const requestId = uuidv4();
      const setupEntity = new SetupEntity(step0SetupRequestInitializedDto());
      const controller = new RecoverInitiateAccountRecoveryRequestController(mockWorker, requestId, setupEntity);

      expect.assertions(6);
      try {
        await controller.exec();
        expect(false).toBeTruthy();
      } catch (error) {
        expect(error.message).toEqual("Could not validate entity Account.");
        expect(error.details).not.toBeUndefined();
        expect(error.details.user_public_armored_key).not.toBeUndefined();
        expect(error.details.user_private_armored_key).not.toBeUndefined();
        expect(error.details.server_public_armored_key).not.toBeUndefined();
        expect(error.details.security_token).not.toBeUndefined();
      }
    });

    it("Should assert setupEntity contains data to create an account.", async() => {
      const mockPort = {};
      const mockWorker = new Worker(mockPort);
      const requestId = uuidv4();
      const setupEntity = new SetupEntity(step3SetupSecurityTokenDto());
      const controller = new RecoverInitiateAccountRecoveryRequestController(mockWorker, requestId, setupEntity);
      const apiFetchMock = jest.fn(() => Promise.resolve(JSON.stringify({header: {}, body: {}})));
      fetch.mockResponse(apiFetchMock);

      expect.assertions(2);
      await controller.exec();

      // Expect the temporary account created in the local storage.
      const accountForAccountRecovery = await AccountLocalStorage.getAccountByUserIdAndType(setupEntity.userId, AccountEntity.TYPE_ACCOUNT_RECOVERY);
      expect(accountForAccountRecovery).not.toBeUndefined();
      // Expect the API to have been called.
      expect(apiFetchMock).toHaveBeenCalled();
    });
  });
});
