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

import {defaultApiClientOptions} from "../../service/api/apiClient/apiClientOptions.test.data";
import StartRecoverController from "./startRecoverController";
import {enableFetchMocks} from "jest-fetch-mock";
import {mockApiResponse} from "../../../../../test/mocks/mockApiResponse";
import {defaultUserDto} from "passbolt-styleguide/src/shared/models/entity/user/userEntity.test.data";
import {defaultVerifyDto} from "../../model/entity/auth/auth.test.data";
import GetGpgKeyInfoService from "../../service/crypto/getGpgKeyInfoService";
import UserEntity from "../../model/entity/user/userEntity";
import {initialAccountRecoverDto} from "../../model/entity/account/accountRecoverEntity.test.data";
import AccountRecoverEntity from "../../model/entity/account/accountRecoverEntity";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import WorkerService from "../../service/worker/workerService";

jest.mock("../../service/worker/workerService");

// Reset the modules before each test.
beforeEach(() => {
  enableFetchMocks();
});

describe("StartRecoverController", () => {
  describe("StartRecoverController::exec", () => {
    it("Should initiate the recover process and retrieve the recover material", async() => {
      const account = new AccountRecoverEntity(initialAccountRecoverDto());
      const runtimeMemory = {};
      const controller = new StartRecoverController(null, null, defaultApiClientOptions(), account, runtimeMemory);

      // Mock API fetch organization settings
      const mockVerifyDto = defaultVerifyDto();
      fetch.doMockOnce(() => mockApiResponse(mockVerifyDto));
      // Mock API fetch recover start.
      const mockRecoverStartDto = {user: defaultUserDto()};
      fetch.doMockOnce(() => mockApiResponse(mockRecoverStartDto));

      expect.assertions(5);
      await controller.exec();
      const key = await OpenpgpAssertion.readKeyOrFail(mockVerifyDto.keydata);
      expect(account.serverPublicArmoredKey).toEqual((await GetGpgKeyInfoService.getKeyInfo(key)).armoredKey);
      expect(account.username).toEqual(mockRecoverStartDto.user.username);
      expect(account.firstName).toEqual(mockRecoverStartDto.user.profile.first_name);
      expect(account.lastName).toEqual(mockRecoverStartDto.user.profile.last_name);
      expect(account.user.toDto(UserEntity.ALL_CONTAIN_OPTIONS)).toEqual(mockRecoverStartDto.user);
    }, 10 * 1000);

    it("Should not initiate the recover if the API does not provide a valid server public key", async() => {
      const mockedWorker = {tab: {id: "tabID"}};
      const account = new AccountRecoverEntity(initialAccountRecoverDto());
      const runtimeMemory = {};
      const controller = new StartRecoverController(mockedWorker, null, defaultApiClientOptions(), account, runtimeMemory);

      // Mock API fetch verify
      const mockVerifyDto = defaultVerifyDto({keydata: "not a valid key"});
      fetch.doMockOnce(() => mockApiResponse(mockVerifyDto));
      // Mock Worker to assert error handler.
      const mockedBootstrapRecoverWorkerPortEmit = jest.fn();
      WorkerService.get = jest.fn(() => ({
        port: {
          emit: mockedBootstrapRecoverWorkerPortEmit
        }
      }));

      expect.assertions(2);
      const promise = controller.exec();
      await expect(promise).rejects.toThrowError("The key should be a valid openpgp armored key string.");
      expect(mockedBootstrapRecoverWorkerPortEmit).toHaveBeenCalledWith("passbolt.recover-bootstrap.remove-iframe");
    });

    it("Should not initiate the recover if the API does not provide a valid user", async() => {
      const mockedWorker = {tab: {id: "tabID"}};
      const account = new AccountRecoverEntity(initialAccountRecoverDto());
      const runtimeMemory = {};
      const controller = new StartRecoverController(mockedWorker, null, defaultApiClientOptions(), account, runtimeMemory);

      // Mock API fetch organization settings
      const mockVerifyDto = defaultVerifyDto();
      fetch.doMockOnce(() => mockApiResponse(mockVerifyDto));
      // Mock API fetch recover start.
      const mockRecoverStartDto = {user: null};
      fetch.doMockOnce(() => mockApiResponse(mockRecoverStartDto));
      // Mock Worker to assert error handler.
      const mockedBootstrapRecoverWorkerPortEmit = jest.fn();
      WorkerService.get = jest.fn(() => ({
        port: {
          emit: mockedBootstrapRecoverWorkerPortEmit
        }
      }));

      expect.assertions(2);
      const promise = controller.exec();
      await expect(promise).rejects.toThrowError("Could not validate property username.");
      expect(mockedBootstrapRecoverWorkerPortEmit).toHaveBeenCalledWith("passbolt.recover-bootstrap.remove-iframe");
    });

    it("Should not initiate the recover if the API does not provide a valid account recovery organization policy (not mandatory)", async() => {
      const mockedWorker = {tab: {id: "tabID"}};
      const account = new AccountRecoverEntity(initialAccountRecoverDto());
      const runtimeMemory = {};
      const controller = new StartRecoverController(mockedWorker, null, defaultApiClientOptions(), account, runtimeMemory);

      // Mock API fetch organization settings
      const mockVerifyDto = defaultVerifyDto();
      fetch.doMockOnce(() => mockApiResponse(mockVerifyDto));
      // Mock API fetch recover start.
      const mockRecoverStartDto = {user: defaultUserDto(), account_recovery_organization_policy: {status: "not-valid-status"}};
      fetch.doMockOnce(() => mockApiResponse(mockRecoverStartDto));
      // Mock Worker to assert error handler.
      const mockedBootstrapRecoverWorkerPortEmit = jest.fn();
      WorkerService.get = jest.fn(() => ({
        port: {
          emit: mockedBootstrapRecoverWorkerPortEmit
        }
      }));

      expect.assertions(2);
      const promise = controller.exec();
      await expect(promise).rejects.toThrowError("Could not validate entity AccountRecoveryOrganizationPolicy.");
      expect(mockedBootstrapRecoverWorkerPortEmit).toHaveBeenCalledWith("passbolt.recover-bootstrap.remove-iframe");
    });
  });
});
