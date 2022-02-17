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
import {AccountRecoverySaveOrganizationPolicyController} from "./accountRecoverySaveOrganizationPolicyController";
import {ApiClientOptions} from "../../service/api/apiClient/apiClientOptions";
import {Keyring} from "../../model/keyring";
import {pgpKeys} from "../../../tests/fixtures/pgpKeys/keys";
import PassphraseController from "../passphrase/passphraseController";
import {
  createAccountRecoveryOrganizationPolicyDto,
  defaultAccountRecoveryOrganizationPolicyDto
} from "../../model/entity/accountRecovery/accountRecoveryOrganizationPolicyEntity.test.data";
import {EntityValidationError} from "../../model/entity/abstract/entityValidationError";
import {AccountRecoveryOrganizationPolicyEntity} from "../../model/entity/accountRecovery/accountRecoveryOrganizationPolicyEntity";

jest.mock("../passphrase/passphraseController.js");

beforeEach(() => {
  enableFetchMocks();
});

describe("AccountRecoverySaveOrganizationPolicyController", () => {
  describe("AccountRecoverySaveOrganizationPolicyController::exec", () => {
    it("Should save an account recovery organization policy.", async() => {
      const mockPort = {};
      const mockWorker = new Worker(mockPort);
      const requestId = uuidv4();
      const apiClientOptions = (new ApiClientOptions()).setBaseUrl("https://localhost");
      const controller = new AccountRecoverySaveOrganizationPolicyController(mockWorker, requestId, apiClientOptions);

      // Mock API get account recovery organization policy.
      const mockFetchRequestUrl = `${apiClientOptions.baseUrl}/account-recovery/organization-policies.json*`;
      const mockFetchRequestResult = defaultAccountRecoveryOrganizationPolicyDto();
      fetch.doMockOnceIf(new RegExp(mockFetchRequestUrl), JSON.stringify({header: {}, body: mockFetchRequestResult}));

      // Mock API save account recovery response.
      const mockPostResponseUrl = `${apiClientOptions.baseUrl}/account-recovery/organization-policies.json*`;
      const mockPostResponseResult = defaultAccountRecoveryOrganizationPolicyDto();
      fetch.doMockOnceIf(new RegExp(mockPostResponseUrl), JSON.stringify({header: {}, body: mockPostResponseResult}));

      // Mock user private key in keyring
      await (new Keyring()).importPrivate(pgpKeys.ada.private);

      // Mock user passphrase capture.
      PassphraseController.request.mockResolvedValue(pgpKeys.ada.passphrase);

      const accountRecoveryOrganizationPolicyDto = createAccountRecoveryOrganizationPolicyDto();
      const accountRecoveryOrganizationPrivateKeyDto = {
        armored_key: pgpKeys.account_recovery_organization.private,
        passphrase: pgpKeys.account_recovery_organization.passphrase
      };
      const createdAccountRecoveryOrganizationPolicy = await controller.exec(accountRecoveryOrganizationPolicyDto, accountRecoveryOrganizationPrivateKeyDto);

      expect.assertions(1);
      const createdAccountRecoveryOrganizationPolicyDto = createdAccountRecoveryOrganizationPolicy.toDto(AccountRecoveryOrganizationPolicyEntity.ALL_CONTAIN_OPTIONS);
      // Even if we mock the API result, we ensure the output of the controller.
      await expect(createdAccountRecoveryOrganizationPolicyDto).toEqual(mockPostResponseResult);
    });

    it("Should assert the provided account recovery policy dto is valid.", async() => {
      const mockPort = {};
      const mockWorker = new Worker(mockPort);
      const requestId = uuidv4();
      const apiClientOptions = (new ApiClientOptions()).setBaseUrl("https://localhost");
      const controller = new AccountRecoverySaveOrganizationPolicyController(mockWorker, requestId, apiClientOptions);

      const accountRecoveryOrganizationPolicyDto = {};
      const accountRecoveryOrganizationPrivateKeyDto = {
        armored_key: pgpKeys.account_recovery_organization.private,
        passphrase: pgpKeys.account_recovery_organization.passphrase
      };
      const controllerPromise = controller.exec(accountRecoveryOrganizationPolicyDto, accountRecoveryOrganizationPrivateKeyDto);

      expect.assertions(1);
      await expect(controllerPromise).rejects.toThrowError(EntityValidationError);
    });

    it("Should assert the provided account recovery private key dto is valid.", async() => {
      const mockPort = {};
      const mockWorker = new Worker(mockPort);
      const requestId = uuidv4();
      const apiClientOptions = (new ApiClientOptions()).setBaseUrl("https://localhost");
      const controller = new AccountRecoverySaveOrganizationPolicyController(mockWorker, requestId, apiClientOptions);

      const accountRecoveryOrganizationPolicyDto = createAccountRecoveryOrganizationPolicyDto();
      const accountRecoveryOrganizationPrivateKeyDto = {};
      const controllerPromise = controller.exec(accountRecoveryOrganizationPolicyDto, accountRecoveryOrganizationPrivateKeyDto);

      expect.assertions(1);
      await expect(controllerPromise).rejects.toThrowError(EntityValidationError);
    });
  });
});
