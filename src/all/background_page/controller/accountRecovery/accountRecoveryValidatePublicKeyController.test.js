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

import each from "jest-each";
import {enableFetchMocks} from "jest-fetch-mock";
import AccountRecoveryValidatePublicKeyController from "./accountRecoveryValidatePublicKeyController";
import {defaultApiClientOptions} from "../../service/api/apiClient/apiClientOptions.test.data";
import {pgpKeys} from "../../../../../test/fixtures/pgpKeys/keys";
import {mockApiResponse} from "../../../../../test/mocks/mockApiResponse";
import {v4 as uuidv4} from "uuid";
import MockExtension from "../../../../../test/mocks/mockExtension";

beforeAll(() => {
  enableFetchMocks();
});

describe("AccountRecoveryValidatePublicKeyController", () => {
  describe("AccountRecoveryValidatePublicKeyController::exec", () => {
    beforeEach(() => {
      fetch.resetMocks();
      MockExtension.withMissingPrivateKeyAccount();
    });

    function mockFetch() {
      fetch.doMockOnce(() => mockApiResponse({
        policy: "opt-out",
        account_recovery_organization_public_key: {
          armored_key: pgpKeys.betty.public
        }
      }));

      fetch.doMockOnce(() => mockApiResponse({
        fingerprint: pgpKeys.account_recovery_organization.fingerprint
      }));

      fetch.doMockOnce(() => mockApiResponse([
        {
          user_id: uuidv4(),
          armored_key: pgpKeys.account_recovery_organization_alternative.public
        }
      ]));
    }

    each([
      {key: pgpKeys.anita.public, expectedError: new Error("The key algorithm should be RSA.")},
      {key: pgpKeys.ada.private, expectedError: new Error("The key should be public.")},
      {key: pgpKeys.revokedKey.public, expectedError: new Error("The key should not be revoked.")},
      {key: pgpKeys.expired.public, expectedError: new Error("The key should not have an expiry date.")},
      {key: pgpKeys.rsa_2048.public, expectedError: new Error("The key should be at least 4096 bits.")},
      {key: pgpKeys.validKeyWithExpirationDateDto.public, expectedError: new Error("The key should not have an expiry date.")},
      {key: pgpKeys.account_recovery_organization.public, expectedError: new Error("The key is the current server key, the organization recovery key must be a new one.")},
      {key: pgpKeys.account_recovery_organization_alternative.public, expectedError: new Error("The key is already being used, the organization recovery key must be a new one.")},
      {key: pgpKeys.betty.public, expectedError: new Error("The key is the current organization recovery key, you must provide a new one.")},
    ]).describe("Should throw an error when the key cannot be validated", scenario => {
      it(`Should throw an error whith the scenario: ${scenario.expectedError.message}`, async() => {
        expect.assertions(1);
        mockFetch();

        const controller = new AccountRecoveryValidatePublicKeyController(null, null, defaultApiClientOptions());
        try {
          await controller.exec(scenario.key);
        } catch (e) {
          expect(e).toStrictEqual(scenario.expectedError);
        }
      });
    });


    it("Should validate if the key to check could be used a the new ORK.", async() => {
      expect.assertions(1);
      mockFetch();

      const controller = new AccountRecoveryValidatePublicKeyController(null, null, defaultApiClientOptions());
      const promise = controller.exec(pgpKeys.ada.public);
      await expect(promise).resolves.toBeUndefined();
    });
  });
});
