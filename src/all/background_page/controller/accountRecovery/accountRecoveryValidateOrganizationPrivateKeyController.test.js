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
import {AccountRecoveryValidateOrganizationPrivateKeyController} from "./accountRecoveryValidateOrganizationPrivateKeyController";
import {ApiClientOptions} from "../../service/api/apiClient/apiClientOptions";
import {EntityValidationError} from "../../model/entity/abstract/entityValidationError";
import {pgpKeys} from "../../../tests/fixtures/pgpKeys/keys";
import {defaultAccountRecoveryOrganizationPolicyDto} from "../../model/entity/accountRecovery/accountRecoveryOrganizationPolicyEntity.test.data";
import {WrongOrganizationRecoveryKeyError} from "../../error/wrongOrganizationRecoveryKeyError";

// Reset the modules before each test.
beforeEach(() => {
  enableFetchMocks();
});

describe("AccountRecoveryValidateOrganizationPrivateKeyController", () => {
  describe("AccountRecoveryValidateOrganizationPrivateKeyController::exec", () => {
    it("Should assert the provided private key dto is valid.", async() => {
      const mockPort = {};
      const mockWorker = new Worker(mockPort);
      const requestId = uuidv4();
      const apiClientOptions = (new ApiClientOptions()).setBaseUrl("https://localhost");
      const controller = new AccountRecoveryValidateOrganizationPrivateKeyController(mockWorker, requestId, apiClientOptions);

      const accountRecoveryPrivateKeyDto = {};

      expect.assertions(1);
      const resultPromise = controller.exec(accountRecoveryPrivateKeyDto);
      await expect(resultPromise).rejects.toThrowError(EntityValidationError);
    });

    it("Should throw an error if no account recovery organization policy is found.", async() => {
      const mockPort = {};
      const mockWorker = new Worker(mockPort);
      const requestId = uuidv4();
      const apiClientOptions = (new ApiClientOptions()).setBaseUrl("https://localhost");
      const controller = new AccountRecoveryValidateOrganizationPrivateKeyController(mockWorker, requestId, apiClientOptions);

      // Mock API responses
      const mockFetchRequestUrl = `${apiClientOptions.baseUrl}/account-recovery/organization-policies.json*`;
      const mockFetchRequestResult = null;
      fetch.doMockOnceIf(new RegExp(mockFetchRequestUrl), JSON.stringify({header: {}, body: mockFetchRequestResult}));

      const privateKeyDto = {
        armored_key: pgpKeys.account_recovery_organization.private,
        passphrase: pgpKeys.account_recovery_organization.passphrase
      };
      const result = controller.exec(privateKeyDto);

      expect.assertions(1);
      await expect(result).rejects.toThrowError("Account recovery organization policy not found.");
    });


    it("Should throw an error if the key doesn't validate.", async() => {
      const mockPort = {};
      const mockWorker = new Worker(mockPort);
      const requestId = uuidv4();
      const apiClientOptions = (new ApiClientOptions()).setBaseUrl("https://localhost");
      const controller = new AccountRecoveryValidateOrganizationPrivateKeyController(mockWorker, requestId, apiClientOptions);

      // Mock API responses
      const mockFetchRequestUrl = `${apiClientOptions.baseUrl}/account-recovery/organization-policies.json*`;
      const mockFetchRequestResult = defaultAccountRecoveryOrganizationPolicyDto();
      fetch.doMockOnceIf(new RegExp(mockFetchRequestUrl), JSON.stringify({header: {}, body: mockFetchRequestResult}));

      const privateKeyDto = {
        armored_key: pgpKeys.ada.private,
        passphrase: pgpKeys.ada.passphrase
      };
      const result = controller.exec(privateKeyDto);

      expect.assertions(1);
      await expect(result).rejects.toThrowError(WrongOrganizationRecoveryKeyError);
    });

    it("Should validate a valid account organization private key.", async() => {
      const mockPort = {};
      const mockWorker = new Worker(mockPort);
      const requestId = uuidv4();
      const apiClientOptions = (new ApiClientOptions()).setBaseUrl("https://localhost");
      const controller = new AccountRecoveryValidateOrganizationPrivateKeyController(mockWorker, requestId, apiClientOptions);

      // Mock API responses
      const mockFetchRequestUrl = `${apiClientOptions.baseUrl}/account-recovery/organization-policies.json*`;
      const mockFetchRequestResult = defaultAccountRecoveryOrganizationPolicyDto();
      fetch.doMockOnceIf(new RegExp(mockFetchRequestUrl), JSON.stringify({header: {}, body: mockFetchRequestResult}));

      const privateKeyDto = {
        armored_key: pgpKeys.account_recovery_organization.private,
        passphrase: pgpKeys.account_recovery_organization.passphrase
      };
      const result = controller.exec(privateKeyDto);

      expect.assertions(1);
      await expect(result).resolves.not.toThrow();
    });
  });
});
