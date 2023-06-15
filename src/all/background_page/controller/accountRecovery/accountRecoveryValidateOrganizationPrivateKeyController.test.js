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
import AccountRecoveryValidateOrganizationPrivateKeyController from "./accountRecoveryValidateOrganizationPrivateKeyController";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import {pgpKeys} from "../../../../../test/fixtures/pgpKeys/keys";
import {enabledAccountRecoveryOrganizationPolicyDto} from "../../model/entity/accountRecovery/accountRecoveryOrganizationPolicyEntity.test.data";
import WrongOrganizationRecoveryKeyError from "../../error/wrongOrganizationRecoveryKeyError";
import {defaultApiClientOptions} from "../../service/api/apiClient/apiClientOptions.test.data";
import {mockApiResponse} from "../../../../../test/mocks/mockApiResponse";

// Reset the modules before each test.
beforeEach(() => {
  enableFetchMocks();
});

describe("AccountRecoveryValidateOrganizationPrivateKeyController", () => {
  describe("AccountRecoveryValidateOrganizationPrivateKeyController::exec", () => {
    it("Should assert the provided private key dto is valid.", async() => {
      const controller = new AccountRecoveryValidateOrganizationPrivateKeyController(null, null, defaultApiClientOptions());

      const accountRecoveryPrivateKeyDto = {};
      const resultPromise = controller.exec(accountRecoveryPrivateKeyDto);

      expect.assertions(1);
      await expect(resultPromise).rejects.toThrowError(EntityValidationError);
    });

    it("Should throw an error if no account recovery organization policy is found.", async() => {
      const controller = new AccountRecoveryValidateOrganizationPrivateKeyController(null, null, defaultApiClientOptions());

      // Mock API get account recovery organization policy.
      fetch.doMockOnce(() => mockApiResponse(null));

      const privateKeyDto = {
        armored_key: pgpKeys.account_recovery_organization.private,
        passphrase: pgpKeys.account_recovery_organization.passphrase
      };
      const result = controller.exec(privateKeyDto);

      expect.assertions(1);
      await expect(result).rejects.toThrowError("Account recovery organization policy not found.");
    });


    it("Should throw an error if the key doesn't validate.", async() => {
      const controller = new AccountRecoveryValidateOrganizationPrivateKeyController(null, null, defaultApiClientOptions());

      // Mock API get account recovery organization policy.
      fetch.doMockOnce(() => mockApiResponse(enabledAccountRecoveryOrganizationPolicyDto()));

      const privateKeyDto = {
        armored_key: pgpKeys.ada.private,
        passphrase: pgpKeys.ada.passphrase
      };
      const result = controller.exec(privateKeyDto);

      expect.assertions(1);
      await expect(result).rejects.toThrowError(WrongOrganizationRecoveryKeyError);
    });

    it("Should validate a valid account organization private key.", async() => {
      const controller = new AccountRecoveryValidateOrganizationPrivateKeyController(null, null, defaultApiClientOptions());

      // Mock API get account recovery organization policy.
      fetch.doMockOnce(() => mockApiResponse(enabledAccountRecoveryOrganizationPolicyDto()));

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
