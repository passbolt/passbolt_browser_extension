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
import {AccountRecoverySaveOrganizationPolicyController} from "./accountRecoverySaveOrganizationPolicyController";
import {pgpKeys} from "../../../tests/fixtures/pgpKeys/keys";
import PassphraseController from "../passphrase/passphraseController";
import {
  createAccountRecoveryOrganizationPolicyDto,
  defaultAccountRecoveryOrganizationPolicyDto
} from "../../model/entity/accountRecovery/accountRecoveryOrganizationPolicyEntity.test.data";
import {EntityValidationError} from "../../model/entity/abstract/entityValidationError";
import {AccountRecoveryOrganizationPolicyEntity} from "../../model/entity/accountRecovery/accountRecoveryOrganizationPolicyEntity";
import {defaultApiClientOptions} from "../../service/api/apiClient/apiClientOptions.test.data";
import {mockApiResponse} from "../../../tests/mocks/mockApiResponse";
import {MockExtension} from "../../../tests/mocks/mockExtension";

jest.mock("../passphrase/passphraseController.js");

beforeEach(() => {
  enableFetchMocks();
});

describe("AccountRecoverySaveOrganizationPolicyController", () => {
  describe("AccountRecoverySaveOrganizationPolicyController::exec", () => {
    it("Should save an account recovery organization policy.", async() => {
      const controller = new AccountRecoverySaveOrganizationPolicyController(null, null, defaultApiClientOptions());

      // Mock extension with a configured account.
      await MockExtension.withConfiguredAccount();
      // Mock user passphrase capture.
      PassphraseController.request.mockResolvedValue(pgpKeys.ada.passphrase);
      // Mock API get account recovery organization policy.
      fetch.doMockOnce(() => mockApiResponse(defaultAccountRecoveryOrganizationPolicyDto()));
      // Mock API account recovery user settings post. Return data such as the API will, including the request payload.
      fetch.doMockOnce(async req => mockApiResponse(JSON.parse(await req.text())));

      const accountRecoveryOrganizationPolicyDto = createAccountRecoveryOrganizationPolicyDto();
      const accountRecoveryOrganizationPrivateKeyDto = {
        armored_key: pgpKeys.account_recovery_organization.private,
        passphrase: pgpKeys.account_recovery_organization.passphrase
      };
      const createdAccountRecoveryOrganizationPolicy = await controller.exec(accountRecoveryOrganizationPolicyDto, accountRecoveryOrganizationPrivateKeyDto);

      expect.assertions(1);
      const createdAccountRecoveryOrganizationPolicyDto = createdAccountRecoveryOrganizationPolicy.toDto(AccountRecoveryOrganizationPolicyEntity.ALL_CONTAIN_OPTIONS);
      // Even if we mock the API result, we ensure the output of the controller.
      expect(createdAccountRecoveryOrganizationPolicyDto).toEqual(accountRecoveryOrganizationPolicyDto);
    });

    it("Should assert the provided account recovery policy dto is valid.", async() => {
      const controller = new AccountRecoverySaveOrganizationPolicyController(null, null, defaultApiClientOptions());

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
      const controller = new AccountRecoverySaveOrganizationPolicyController(null, null, defaultApiClientOptions());

      const accountRecoveryOrganizationPolicyDto = createAccountRecoveryOrganizationPolicyDto();
      const accountRecoveryOrganizationPrivateKeyDto = {};
      const controllerPromise = controller.exec(accountRecoveryOrganizationPolicyDto, accountRecoveryOrganizationPrivateKeyDto);

      expect.assertions(1);
      await expect(controllerPromise).rejects.toThrowError(EntityValidationError);
    });
  });
});
