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
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import ContinueAccountRecoveryController from "./continueAccountRecoveryController";
import AccountAccountRecoveryEntity from "../../model/entity/account/accountAccountRecoveryEntity";
import {defaultAccountAccountRecoveryDto} from "../../model/entity/account/accountAccountRecoveryEntity.test.data";
import WorkerService from "../../service/worker/workerService";
import {v4 as uuidv4} from "uuid";
import AccountTemporarySessionStorageService from "../../service/sessionStorage/accountTemporarySessionStorageService";

beforeEach(() => {
  enableFetchMocks();
});

describe("ContinueAccountRecoveryController", () => {
  describe("ContinueAccountRecoveryController::exec", () => {
    it("Should continue the account recovery if the user can continue.", async() => {
      const workerId = uuidv4();
      const mockedWorker = {tab: {id: "tabID"}, port: {_port: {name: workerId}}};
      const accountRecovery = new AccountAccountRecoveryEntity(defaultAccountAccountRecoveryDto());

      // Mock API fetch account recovery requests response.
      const url = new RegExp(`/account-recovery/continue/${accountRecovery.userId}/${accountRecovery.authenticationTokenToken}.json`);
      fetch.doMockIf(url, () => mockApiResponse());
      jest.spyOn(AccountTemporarySessionStorageService, "set");

      const controller = new ContinueAccountRecoveryController(mockedWorker, null, defaultApiClientOptions(), accountRecovery);
      const promise = controller.exec();

      expect.assertions(2);
      await expect(promise).resolves.not.toThrow();
      await expect(AccountTemporarySessionStorageService.set).toHaveBeenCalledTimes(1);
    });

    it("Should not continue the account recovery if the API return an error.", async() => {
      const workerId = uuidv4();
      const mockedWorker = {tab: {id: "tabID"}, port: {_port: {name: workerId}}};
      const accountRecovery = new AccountAccountRecoveryEntity(defaultAccountAccountRecoveryDto());

      // Mock API fetch account recovery requests response.
      const url = new RegExp(`/account-recovery/continue/${accountRecovery.userId}/${accountRecovery.authenticationTokenToken}.json`);
      fetch.doMockIf(url, () => Promise.reject(new Error("Unable to reach the server, an unexpected error occurred")));
      // Mock Worker to assert error handler.
      const mockedBootstrapAccountRecoveryWorkerPortEmit = jest.fn();
      WorkerService.get = jest.fn(() => ({
        port: {
          emit: mockedBootstrapAccountRecoveryWorkerPortEmit
        }
      }));

      const controller = new ContinueAccountRecoveryController(mockedWorker, null, defaultApiClientOptions(), accountRecovery);
      const promise = controller.exec();

      expect.assertions(2);
      await expect(promise).rejects.toThrowError("Unable to reach the server, an unexpected error occurred");
      expect(mockedBootstrapAccountRecoveryWorkerPortEmit).toHaveBeenCalledWith("passbolt.account-recovery-bootstrap.remove-iframe");
    });
  });
});
