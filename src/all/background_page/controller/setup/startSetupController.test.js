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

import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import StartSetupController from "./startSetupController";
import {enableFetchMocks} from "jest-fetch-mock";
import {mockApiResponse} from "../../../../../test/mocks/mockApiResponse";
import {defaultUserDto} from "passbolt-styleguide/src/shared/models/entity/user/userEntity.test.data";
import {defaultVerifyDto} from "../../model/entity/auth/auth.test.data";
import GetGpgKeyInfoService from "../../service/crypto/getGpgKeyInfoService";
import UserEntity from "../../model/entity/user/userEntity";
import {initialAccountSetupDto} from "../../model/entity/account/accountSetupEntity.test.data";
import AccountSetupEntity from "../../model/entity/account/accountSetupEntity";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import WorkerService from "../../service/worker/workerService";
import AccountRecoveryOrganizationPolicyEntity from "../../model/entity/accountRecovery/accountRecoveryOrganizationPolicyEntity";
import UserPassphrasePoliciesEntity from "passbolt-styleguide/src/shared/models/entity/userPassphrasePolicies/userPassphrasePoliciesEntity";
import {defaultUserPassphrasePoliciesEntityDto} from "passbolt-styleguide/src/shared/models/userPassphrasePolicies/UserPassphrasePoliciesDto.test.data";
import {enabledAccountRecoveryOrganizationPolicyDto} from "../../model/entity/accountRecovery/accountRecoveryOrganizationPolicyEntity.test.data";
import {v4 as uuidv4} from "uuid";
import AccountTemporarySessionStorageService from "../../service/sessionStorage/accountTemporarySessionStorageService";

// Reset the modules before each test.
beforeEach(() => {
  enableFetchMocks();
});

describe("StartSetupController", () => {
  describe("StartSetupController::exec", () => {
    it("Should initiate the setup process and retrieve the setup material", async() => {
      const account = new AccountSetupEntity(initialAccountSetupDto());
      const workerId = uuidv4();
      const controller = new StartSetupController({port: {_port: {name: workerId}}}, null, defaultApiClientOptions(), account);

      // Mock API fetch organization settings
      const mockVerifyDto = defaultVerifyDto();
      fetch.doMockOnce(() => mockApiResponse(mockVerifyDto));
      // Mock API fetch setup start.
      const mockSetupStartDto = {user: defaultUserDto()};
      fetch.doMockOnce(() => mockApiResponse(mockSetupStartDto));

      expect.assertions(7);
      await controller.exec();
      const expectedAccount = await AccountTemporarySessionStorageService.get(workerId);
      const key = await OpenpgpAssertion.readKeyOrFail(mockVerifyDto.keydata);
      expect(expectedAccount.account.serverPublicArmoredKey).toEqual((await GetGpgKeyInfoService.getKeyInfo(key)).armoredKey);
      expect(expectedAccount.account.username).toEqual(mockSetupStartDto.user.username);
      expect(expectedAccount.account.firstName).toEqual(mockSetupStartDto.user.profile.first_name);
      expect(expectedAccount.account.lastName).toEqual(mockSetupStartDto.user.profile.last_name);
      expect(expectedAccount.account.user.toDto(UserEntity.ALL_CONTAIN_OPTIONS)).toEqual(mockSetupStartDto.user);
      expect(expectedAccount.accountRecoveryOrganizationPolicy).toBeNull();
      expect(expectedAccount.userPassphrasePolicies).toBeNull();
    }, 10 * 1000);

    it("Should initiate the setup process and retrieve the setup material with all configuration", async() => {
      const account = new AccountSetupEntity(initialAccountSetupDto());
      const accountRecoveryOrganizationPolicyDto = enabledAccountRecoveryOrganizationPolicyDto();
      const userPassphrasePoliciesDto = defaultUserPassphrasePoliciesEntityDto();
      const workerId = uuidv4();
      const controller = new StartSetupController({port: {_port: {name: workerId}}}, null, defaultApiClientOptions(), account);

      // Mock API fetch organization settings
      const mockVerifyDto = defaultVerifyDto();
      fetch.doMockOnce(() => mockApiResponse(mockVerifyDto));
      // Mock API fetch setup start.
      const mockSetupStartDto = {
        user: defaultUserDto(),
        account_recovery_organization_policy: accountRecoveryOrganizationPolicyDto,
        user_passphrase_policy: userPassphrasePoliciesDto
      };
      fetch.doMockOnce(() => mockApiResponse(mockSetupStartDto));

      expect.assertions(7);
      await controller.exec();
      const expectedAccount = await AccountTemporarySessionStorageService.get(workerId);
      const key = await OpenpgpAssertion.readKeyOrFail(mockVerifyDto.keydata);
      expect(expectedAccount.account.serverPublicArmoredKey).toEqual((await GetGpgKeyInfoService.getKeyInfo(key)).armoredKey);
      expect(expectedAccount.account.username).toEqual(mockSetupStartDto.user.username);
      expect(expectedAccount.account.firstName).toEqual(mockSetupStartDto.user.profile.first_name);
      expect(expectedAccount.account.lastName).toEqual(mockSetupStartDto.user.profile.last_name);
      expect(expectedAccount.account.user.toDto(UserEntity.ALL_CONTAIN_OPTIONS)).toEqual(mockSetupStartDto.user);
      expect(expectedAccount.accountRecoveryOrganizationPolicy).toStrictEqual(new AccountRecoveryOrganizationPolicyEntity(accountRecoveryOrganizationPolicyDto));
      expect(expectedAccount.userPassphrasePolicies).toStrictEqual(new UserPassphrasePoliciesEntity(userPassphrasePoliciesDto));
    }, 10 * 1000);

    it("Should not initiate the setup if the API does not provide a valid server public key", async() => {
      const workerId = uuidv4();
      const mockedWorker = {tab: {id: "tabID"}, port: {_port: {name: workerId}}};
      const account = new AccountSetupEntity(initialAccountSetupDto());
      const controller = new StartSetupController(mockedWorker, null, defaultApiClientOptions(), account);

      // Mock API fetch verify
      const mockVerifyDto = defaultVerifyDto({keydata: "not a valid key"});
      fetch.doMockOnce(() => mockApiResponse(mockVerifyDto));
      // Mock Worker to assert error handler.
      const mockedBootstrapSetupWorkerPortEmit = jest.fn();
      WorkerService.get = jest.fn(() => ({
        port: {
          emit: mockedBootstrapSetupWorkerPortEmit
        }
      }));

      expect.assertions(2);
      const promise = controller.exec();
      await expect(promise).rejects.toThrowError("The key should be a valid openpgp armored key string.");
      expect(mockedBootstrapSetupWorkerPortEmit).toHaveBeenCalledWith("passbolt.setup-bootstrap.remove-iframe");
    });

    it("Should not initiate the setup if the API does not provide a valid user", async() => {
      const workerId = uuidv4();
      const mockedWorker = {tab: {id: "tabID"}, port: {_port: {name: workerId}}};
      const account = new AccountSetupEntity(initialAccountSetupDto());
      const controller = new StartSetupController(mockedWorker, null, defaultApiClientOptions(), account);

      // Mock API fetch organization settings
      const mockVerifyDto = defaultVerifyDto();
      fetch.doMockOnce(() => mockApiResponse(mockVerifyDto));
      // Mock API fetch setup start.
      const mockSetupStartDto = {user: null};
      fetch.doMockOnce(() => mockApiResponse(mockSetupStartDto));
      // Mock Worker to assert error handler.
      const mockedBootstrapSetupWorkerPortEmit = jest.fn();
      WorkerService.get = jest.fn(() => ({
        port: {
          emit: mockedBootstrapSetupWorkerPortEmit
        }
      }));

      expect.assertions(2);
      const promise = controller.exec();
      await expect(promise).rejects.toThrowError("Could not validate property username.");
      expect(mockedBootstrapSetupWorkerPortEmit).toHaveBeenCalledWith("passbolt.setup-bootstrap.remove-iframe");
    });

    it("Should not initiate the setup if the API does not provide a valid account recovery organization policy (not mandatory)", async() => {
      const workerId = uuidv4();
      const mockedWorker = {tab: {id: "tabID"}, port: {_port: {name: workerId}}};
      const account = new AccountSetupEntity(initialAccountSetupDto());
      const controller = new StartSetupController(mockedWorker, null, defaultApiClientOptions(), account);

      // Mock API fetch organization settings
      const mockVerifyDto = defaultVerifyDto();
      fetch.doMockOnce(() => mockApiResponse(mockVerifyDto));
      // Mock API fetch setup start.
      const mockSetupStartDto = {user: defaultUserDto(), account_recovery_organization_policy: {status: "not-valid-status"}};
      fetch.doMockOnce(() => mockApiResponse(mockSetupStartDto));
      // Mock Worker to assert error handler.
      const mockedBootstrapSetupWorkerPortEmit = jest.fn();
      WorkerService.get = jest.fn(() => ({
        port: {
          emit: mockedBootstrapSetupWorkerPortEmit
        }
      }));

      expect.assertions(2);
      const promise = controller.exec();
      await expect(promise).rejects.toThrowError("Could not validate entity AccountRecoveryOrganizationPolicy.");
      expect(mockedBootstrapSetupWorkerPortEmit).toHaveBeenCalledWith("passbolt.setup-bootstrap.remove-iframe");
    });
  });
});
