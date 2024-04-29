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
import each from "jest-each";
import Keyring from "../../model/keyring";
import ValidateOrganizationPublicKeyService from "./validateOrganizationPublicKeyService";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import {mockApiResponse} from "../../../../../test/mocks/mockApiResponse";
import {pgpKeys} from 'passbolt-styleguide/test/fixture/pgpKeys/keys';
import {dummyData} from "./validateOrganizationPublicKeyService.test.data";

beforeAll(() => {
  enableFetchMocks();
});

beforeEach(() => {
  fetch.resetMocks();
  // Spy on keyring public key retrieval from local storage.
  jest.spyOn(Keyring.prototype, "getPublicKeysFromStorage").mockImplementation(() => ({
    keyId1: {
      fingerprint: pgpKeys.betty.fingerprint
    }
  }));
  // Mock get server key json request.
  fetch.doMockOnceIf(/auth\/verify/, () => mockApiResponse({
    fingerprint: pgpKeys.account_recovery_organization.fingerprint
  }));
  // Spy on the keyring synchronization
  jest.spyOn(Keyring.prototype, "sync").mockImplementation(() => {});
});

describe("ValidateOrganizationPublicKeyService::validatePublicKey", () => {
  it("should accept a viable key", () => {
    expect.assertions(1);
    const service = new ValidateOrganizationPublicKeyService(defaultApiClientOptions());
    const validationPromise = service.validatePublicKey(dummyData.viableKey);
    return expect(validationPromise).resolves.not.toThrow();
  });

  each([
    {key: pgpKeys.anita.public, expectedError: new Error("The key algorithm should be RSA.")},
    {key: pgpKeys.ada.private, expectedError: new Error("The key should be public.")},
    {key: pgpKeys.revokedKey.public, expectedError: new Error("The key should not be revoked.")},
    {key: pgpKeys.expired.public, expectedError: new Error("The key should not have an expiry date.")},
    {key: pgpKeys.rsa_2048.public, expectedError: new Error("The key should be at least 4096 bits.")},
    {key: pgpKeys.validKeyWithExpirationDateDto.public, expectedError: new Error("The key should not have an expiry date.")},
    {key: pgpKeys.account_recovery_organization.public, expectedError: new Error("The key is the current server key, the organization recovery key must be a new one.")},
    {key: pgpKeys.betty.public, expectedError: new Error("The key is already being used, the organization recovery key must be a new one.")},
    {key: pgpKeys.account_recovery_organization_alternative.public, expectedError: new Error("The key is the current organization recovery key, you must provide a new one.")},
  ]).describe("Should throw an error when the key cannot be validated", scenario => {
    it(`Should throw an error with the scenario: ${scenario.expectedError.message}`, async() => {
      expect.assertions(1);
      const service = new ValidateOrganizationPublicKeyService(defaultApiClientOptions());
      const validationPromise = service.validatePublicKey(scenario.key, pgpKeys.account_recovery_organization_alternative.public);
      return expect(validationPromise).rejects.toThrow(scenario.expectedError.message);
    });
  });
});
